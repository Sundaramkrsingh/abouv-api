/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CUSTOM_ERRORS } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { envConfig } from 'src/shared/config/app.config';
import {
  HearAbtUsSchema,
  RoleDtoSchema,
  UpdateUserInfoRequestDto,
  OnboardingStatusDtoSchema,
  verifyEmailDtoSchema,
  // pushNotificationsDtoSchema,
  careerIssuesDtoSchema,
  AddEmailDtoSchema,
  GetEmailDtoSchema,
  NotificationPreferenceDto,
  notificationPreferenceDtoSchema,
  PushNotificationSubscriptionDto,
} from './profiles.dto';
import { LoggerService } from 'src/shared/logger/logger.service';
import * as nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import EmailVerification from 'src/email-templates/email-verification';
import * as bcrypt from 'bcrypt';
import isEqual from 'lodash.isequal';
import { getOTP } from 'src/shared/utils';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly s3Service: S3Service,
    private readonly logger: LoggerService,
  ) {}

  async findUser(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: +userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with userId ${userId} doesn't exist!`);
    }

    return user;
  }

  async findExistsGoal(userId: number) {
    const goal = await this.prismaService.userGoal.findUnique({
      where: {
        userId: userId,
      },
    });

    if (goal) {
      throw new NotFoundException(`User already has a goals!`);
    }
    return goal;
  }

  async computeProfileCompletion() {
    return '40%'; // TODO
  }

  /**
   * Profile
   */
  async findAll() {
    // TODO: add phoneNumber
    return this.prismaService.profile.findMany({
      include: {
        address: true,
        workExperience: true,
        project: true,
        licenseCertification: true,
        education: true,
        awardAchievement: true,
      },
    });
  }

  async findOne(userId: number) {
    const { phoneNumber } = await this.findUser(userId);

    const profile = await this.prismaService.profile.findUnique({
      where: { userId },
      include: {
        elective: true,
        address: true,
        workExperience: true,
        project: true,
        licenseCertification: true,
        education: true,
        awardAchievement: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile of userId ${userId} doesn't exist!`);
    }

    return Object.assign(profile, { phoneNumber });
  }

  /**
   * Basic
   */
  async findBasic(userId: number) {
    const profile = await this.findOne(userId);

    return profile;
  }

  async addEmail(userId: number, addEmailDto: AddEmailDtoSchema) {
    await this.findUser(userId);
    const existingRecord = await this.prismaService.profile.findUnique({
      where: { userId },
    });

    if (existingRecord) {
      throw new ConflictException({
        message: `Basic profile of userId ${userId} already exists!`,
        messageCode: 'ACCOUNT_EXISTS',
      });
    }

    const isEmailExist = addEmailDto?.email
      ? await this.prismaService.profile.findUnique({
          where: { email: addEmailDto?.email },
        })
      : null;

    if (isEmailExist && isEmailExist.id !== userId) {
      throw new ConflictException({
        message: 'Email already exists',
        messageCode: `EMAIL_EXISTS`,
      });
    }

    try {
      const profile = await this.prismaService.profile.create({
        data: {
          userId,
          email: addEmailDto?.email,
        },
      });

      await this.getEmailVerificationOTP(userId, {
        email: profile.email,
        fullName: profile.fullName,
        emailType: 'signup',
      });

      return { profile };
    } catch (error) {
      throw error;
    }
  }

  async updateEmail(userId: number, updateEmailDto: AddEmailDtoSchema) {
    await this.findUser(userId);

    const isEmailExist = await this.prismaService.profile.findUnique({
      where: { email: updateEmailDto.email },
    });

    if (isEmailExist && isEmailExist.userId !== userId) {
      throw new ConflictException({
        message: 'Email already exists',
        messageCode: `EMAIL_EXISTS`,
      });
    }

    try {
      const profile = await this.prismaService.profile.update({
        where: { userId },
        data: {
          email: updateEmailDto?.email,
        },
      });

      await this.getEmailVerificationOTP(userId, {
        email: profile.email,
        fullName: profile.fullName,
        emailType: 'signup',
      });

      return { profile };
    } catch (error) {
      throw error;
    }
  }

  async getEmailVerificationOTP(
    userId: number,
    getEmailDto: GetEmailDtoSchema,
  ) {
    try {
      const hasOTP = await this.prismaService.emailVerificationOTP.findUnique({
        where: { userId: Number(userId) },
      });

      if (hasOTP) {
        await this.prismaService.emailVerificationOTP.delete({
          where: { userId: Number(userId) },
        });
      }

      const otpCode = getOTP().toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const otp = await this.prismaService.emailVerificationOTP.create({
        data: {
          userId: Number(userId),
          otp: otpCode,
          expiresAt,
        },
      });

      await this.sendOTP(
        userId,
        getEmailDto.email,
        getEmailDto.fullName,
        otp.otp,
        getEmailDto.emailType,
      );

      return {
        message: 'OTP sent successfully on mail',
      };
    } catch (error) {
      this.logger.logError('[PWA-API][requestEmailVerificationOTP] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async sendOTP(
    userId: number,
    email: string,
    name: string,
    otp: string,
    type: string,
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: envConfig.node_mailer.email,
          pass: envConfig.node_mailer.password,
        },
      });

      const url = `https://${envConfig.subDomain}abouv.com/onboarding/password-creation?category=verify-otp`;
      const instaUrl = 'https://www.instagram.com/be.abouv/';
      const linkedinUrl =
        'https://www.linkedin.com/company/beztlabs/mycompany/';

      const emailHtml = render(
        EmailVerification({
          name,
          otp,
          url,
          instaUrl,
          linkedinUrl,
          type,
        }),
      );

      const mailOptions = {
        from: envConfig.node_mailer.email,
        to: email,
        subject: 'OTP for Email Verification',
        html: emailHtml,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.logError('[PWA-API][sendOTP] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async verifyEmail(userId: number, verifyEmailInfo: verifyEmailDtoSchema) {
    try {
      const { otpCode } = verifyEmailInfo;
      const otp = await this.prismaService.emailVerificationOTP.findUnique({
        where: {
          userId: Number(userId),
        },
      });

      if (!otp || otp.expiresAt < new Date()) {
        console.log('OTP has been expired');
        throw new BadRequestException(CUSTOM_ERRORS.OTP_EXPIRED);
      }

      if (otp.otp !== otpCode) {
        throw new ForbiddenException(CUSTOM_ERRORS.INCORRECT_OTP);
      }

      await this.prismaService.profile.update({
        where: { userId: Number(userId) },
        data: {
          isEmailVerified: true,
        },
      });

      return {
        isValidOtp: true,
        message: 'Email Verified Successfully',
      };
    } catch (error) {
      this.logger.logError('[PWA-API][verifyEmail] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async createBasic(userId: number, createBasicDto: any) {
    await this.findUser(userId);

    const existingRecord = await this.prismaService.profile.findUnique({
      where: { userId },
    });

    if (!existingRecord) {
      throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
    }

    const isAddressCreated = existingRecord
      ? await this.prismaService.address.findUnique({
          where: { profileId: existingRecord.id },
        })
      : null;

    if (isAddressCreated) {
      throw new ConflictException(CUSTOM_ERRORS.ADDRESS_EXISTS);
    }

    const fullName = createBasicDto.firstName + ' ' + createBasicDto.lastName;
    const username = fullName.split(' ').join('') + userId;
    const profileCompletion = await this.computeProfileCompletion();
    const { pincode, ...rest } = createBasicDto;
    const pincodeData = pincode
      ? await this.getCityStateByPincode(+pincode)
      : null;
    if (!pincodeData) {
      throw new BadRequestException('Invalid Pincode');
    }
    const { city, state } = pincodeData;

    try {
      return this.prismaService.$transaction(async (tx) => {
        const profile = await tx.profile.update({
          where: { userId },
          data: {
            ...rest,
            fullName,
            username,
            profileCompletion,
          },
        });

        const address = pincode
          ? await tx.address.create({
              data: {
                pincode,
                country: 'India',
                state: state,
                cityDistrict: city,
                profile: {
                  connect: {
                    id: profile.id,
                  },
                },
              },
            })
          : null;

        return { profile, address };
      });
    } catch (error) {
      throw error;
    }
  }

  async updateBasic(userId: number, updateBasicDto: any) {
    await this.findOne(userId);

    const profileCompletion = await this.computeProfileCompletion();

    const { pincode, line1, ...rest } = updateBasicDto;
    const fullName = updateBasicDto.firstName + ' ' + updateBasicDto.lastName;
    const addressLine1 = line1 ? line1 : '';

    const pincodeData = pincode
      ? await this.getCityStateByPincode(+pincode)
      : null;

    if (!pincodeData) {
      throw new BadRequestException('Invalid Pincode');
    }
    const { city, state } = pincodeData;

    try {
      return this.prismaService.$transaction(async (tx) => {
        const profile = await tx.profile.update({
          where: { userId },
          data: {
            ...rest,
            fullName,
            profileCompletion,
          },
        });

        let address = null;

        if (pincode) {
          address = await tx.address.update({
            where: { profileId: profile.id },
            data: {
              pincode,
              state: state,
              cityDistrict: city,
              line1: addressLine1,
            },
          });
        }

        return { profile, address };
      });
    } catch (error) {
      throw error;
    }
  }

  /*Password */

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async createPassword(userId: number, passwordDtoSchema: any) {
    await this.findUser(userId);

    const hashedPassword = await this.hashPassword(passwordDtoSchema.password);

    const passwordRecord = await this.prismaService.profile.update({
      where: { userId },

      data: {
        password: hashedPassword,
      },
    });

    return passwordRecord;
  }

  async updatePassword(userId: number, updatePasswordDto: any) {
    await this.findOne(userId);

    const hashedPassword = await this.hashPassword(updatePasswordDto.password);

    return this.prismaService.profile.update({
      where: { userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  /**
   * Address
   */
  async findAddress(userId: number) {
    const profile = await this.findOne(userId);

    return profile.address;
  }

  async createAddress(userId: number, createAddressDto: any) {
    const profile = await this.findOne(userId);

    if (profile.address) {
      throw new ConflictException(
        `Address of userId ${userId} already exists!`,
      );
    }

    return this.prismaService.address.create({
      data: {
        ...createAddressDto,
        profile: {
          connect: {
            id: profile.id,
          },
        },
      },
    });
  }

  // Getting Acquisition Channel
  async getAcquisitionChannel(userId: number) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found!`);
    }

    const channel = await this.prismaService.onboarding.findUnique({
      where: {
        userId: userId,
      },
      select: {
        acquisitionChannel: true,
      },
    });

    if (!channel) {
      return {
        data: {
          Message: `User ${userId} acquisition channel is null. User hasn't started onboarding process`,
        },
      };
    } else {
      return {
        data: {
          Message: 'Current channel found',
          Channel: channel.acquisitionChannel,
        },
      };
    }
  }

  async updateAddress(userId: number, updateAddressDto: any) {
    const profile = await this.findOne(userId);

    return this.prismaService.address.update({
      where: { profileId: profile.id },
      data: updateAddressDto,
    });
  }

  /**
   * Work Experience
   */
  async findWorkExperience(userId: number) {
    const profile = await this.findOne(userId);

    return profile.workExperience;
  }

  async createWorkExperience(userId: number, createWorkExperienceDto: any) {
    const profile = await this.findOne(userId);

    return this.prismaService.workExperience.create({
      data: {
        ...createWorkExperienceDto,
        profile: {
          connect: {
            id: profile.id,
          },
        },
      },
    });
  }

  async updateWorkExperience(
    userId: number,
    workExperienceId: number,
    updateWorkExperienceDto: any,
  ) {
    const profile = await this.findOne(userId);

    const isFound = profile.workExperience.some(
      (workExperience) => workExperience.id === workExperienceId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `Work experience with id ${workExperienceId} doesn't exist!`,
      );
    }

    return this.prismaService.workExperience.update({
      where: { id: workExperienceId },
      data: updateWorkExperienceDto,
    });
  }

  async deleteWorkExperience(userId: number, workExperienceId: number) {
    const profile = await this.findOne(userId);

    const isFound = profile.workExperience.some(
      (workExperience) => workExperience.id === workExperienceId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `Work experience with id ${workExperienceId} doesn't exist!`,
      );
    }

    await this.prismaService.workExperience.delete({
      where: { id: workExperienceId },
    });

    return {
      message: `Work experience with id ${workExperienceId} is deleted successfully!`,
    };
  }

  /**
   * Project
   */
  async findProject(userId: number) {
    const profile = await this.findOne(userId);

    return profile.project;
  }

  async createProject(userId: number, createProjectDto: any) {
    const profile = await this.findOne(userId);

    return this.prismaService.project.create({
      data: {
        ...createProjectDto,
        profile: {
          connect: {
            id: profile.id,
          },
        },
      },
    });
  }

  async updateProject(
    userId: number,
    projectId: number,
    updateProjectDto: any,
  ) {
    const profile = await this.findOne(userId);

    const isFound = profile.project.some((project) => project.id === projectId);

    if (!isFound) {
      throw new NotFoundException(
        `Project with id ${projectId} doesn't exist!`,
      );
    }

    return this.prismaService.project.update({
      where: { id: projectId },
      data: updateProjectDto,
    });
  }

  async deleteProject(userId: number, projectId: number) {
    const profile = await this.findOne(userId);

    const isFound = profile.project.some((project) => project.id === projectId);

    if (!isFound) {
      throw new NotFoundException(
        `Project with id ${projectId} doesn't exist!`,
      );
    }

    await this.prismaService.project.delete({
      where: { id: projectId },
    });

    return {
      message: `Project with id ${projectId} is deleted successfully!`,
    };
  }

  /**
   * License Certification
   */
  async findLicenseCertification(userId: number) {
    const profile = await this.findOne(userId);

    return profile.licenseCertification;
  }

  async createLicenseCertification(
    userId: number,
    createLicenseCertificationDto: any,
  ) {
    const profile = await this.findOne(userId);

    return this.prismaService.licenseCertification.create({
      data: {
        ...createLicenseCertificationDto,
        profile: {
          connect: {
            id: profile.id,
          },
        },
      },
    });
  }

  async updateLicenseCertification(
    userId: number,
    licenseCertificationId: number,
    updateLicenseCertificationDto: any,
  ) {
    const profile = await this.findOne(userId);

    const isFound = profile.licenseCertification.some(
      (licenseCertification) =>
        licenseCertification.id === licenseCertificationId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `License and certification with id ${licenseCertificationId} doesn't exist!`,
      );
    }

    return this.prismaService.licenseCertification.update({
      where: { id: licenseCertificationId },
      data: updateLicenseCertificationDto,
    });
  }

  async deleteLicenseCertification(
    userId: number,
    licenseCertificationId: number,
  ) {
    const profile = await this.findOne(userId);

    const isFound = profile.licenseCertification.some(
      (licenseCertification) =>
        licenseCertification.id === licenseCertificationId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `License certification with id ${licenseCertificationId} doesn't exist!`,
      );
    }

    await this.prismaService.licenseCertification.delete({
      where: { id: licenseCertificationId },
    });

    return {
      message: `License certification with id ${licenseCertificationId} is deleted successfully!`,
    };
  }

  /**
   * Education
   */
  async findEducation(userId: number) {
    const profile = await this.findOne(userId);

    return profile.education;
  }

  async createEducation(userId: number, createEducationDto: any) {
    const profile = await this.findOne(userId);

    return this.prismaService.education.create({
      data: {
        ...createEducationDto,
        profile: {
          connect: {
            id: profile.id,
          },
        },
      },
    });
  }

  async updateEducation(
    userId: number,
    educationId: number,
    updateEducationDto: any,
  ) {
    const profile = await this.findOne(userId);

    const isFound = profile.education.some(
      (education) => education.id === educationId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `Education with id ${educationId} doesn't exist!`,
      );
    }

    return this.prismaService.education.update({
      where: { id: educationId },
      data: updateEducationDto,
    });
  }

  async deleteEducation(userId: number, educationId: number) {
    const profile = await this.findOne(userId);

    const isFound = profile.education.some(
      (education) => education.id === educationId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `Education with id ${educationId} doesn't exist!`,
      );
    }

    await this.prismaService.education.delete({
      where: { id: educationId },
    });

    return {
      message: `Education with id ${educationId} is deleted successfully!`,
    };
  }

  /**
   * Award Achievement
   */
  async findAwardAchievement(userId: number) {
    const profile = await this.findOne(userId);

    return profile.awardAchievement;
  }

  async createAwardAchievement(userId: number, createAwardAchievementDto: any) {
    const profile = await this.findOne(userId);

    return this.prismaService.awardAchievement.create({
      data: {
        ...createAwardAchievementDto,
        profile: {
          connect: {
            id: profile.id,
          },
        },
      },
    });
  }

  async updateAwardAchievement(
    userId: number,
    awardAchievementId: number,
    updateAwardAchievementDto: any,
  ) {
    const profile = await this.findOne(userId);

    const isFound = profile.awardAchievement.some(
      (awardAchievement) => awardAchievement.id === awardAchievementId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `Award and achievement with id ${awardAchievementId} doesn't exist!`,
      );
    }

    return this.prismaService.awardAchievement.update({
      where: { id: awardAchievementId },
      data: updateAwardAchievementDto,
    });
  }

  async deleteAwardAchievement(userId: number, awardAchievementId: number) {
    const profile = await this.findOne(userId);

    const isFound = profile.awardAchievement.some(
      (awardAchievement) => awardAchievement.id === awardAchievementId,
    );

    if (!isFound) {
      throw new NotFoundException(
        `Award achievement with id ${awardAchievementId} doesn't exist!`,
      );
    }

    await this.prismaService.awardAchievement.delete({
      where: { id: awardAchievementId },
    });

    return {
      message: `Award achievement with id ${awardAchievementId} is deleted successfully!`,
    };
  }

  async updateProfileImage(userId: string, file: Express.Multer.File) {
    try {
      const checkUser = await this.prismaService.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!checkUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const currentProfile = await this.prismaService.profile.findUnique({
        where: {
          userId: Number(userId),
        },
      });
      if (!currentProfile) {
        throw new BadRequestException(CUSTOM_ERRORS.PROFILE_NOT_FOUND);
      }
      const bucketName = envConfig.S3.uploadProfileImgBucket;
      if (currentProfile?.avatar) {
        await this.s3Service.deleteObjectFromS3(
          currentProfile.avatar,
          bucketName,
        );
      }
      const fileKey = await this.s3Service.uploadFile(
        file,
        bucketName,
        checkUser?.phoneNumber,
      );
      const updatedProfile = await this.prismaService.profile.update({
        where: { userId: Number(userId) },
        data: { avatar: fileKey },
      });
      return {
        message: 'successfully Uploaded',
        userProfile: updatedProfile,
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadResume(userId: string, file: Express.Multer.File) {
    try {
      const checkUser = await this.prismaService.user.findFirstOrThrow({
        where: {
          id: Number(userId),
        },
      });
      if (!checkUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const bucketName = envConfig.S3.userResumeBucket;
      const currentProfile = await this.prismaService.profile.findUnique({
        where: {
          userId: Number(userId),
        },
      });
      if (currentProfile?.resume) {
        await this.s3Service.deleteObjectFromS3(
          currentProfile.resume,
          bucketName,
        );
      }
      const fileKey = await this.s3Service.uploadFile(
        file,
        bucketName,
        checkUser?.phoneNumber,
      );

      const updatedProfile = await this.prismaService.profile.update({
        where: { userId: Number(userId) },
        data: { resume: fileKey },
      });

      return {
        message: 'successfully Uploaded',
        userProfile: updatedProfile,
      };
    } catch (error) {
      throw error;
    }
  }

  async getProfileImage(userId: string) {
    try {
      const checkUser = await this.prismaService.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!checkUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const currentProfile = await this.prismaService.profile.findUnique({
        where: {
          userId: Number(userId),
        },
      });

      if (!currentProfile) {
        throw new BadRequestException(CUSTOM_ERRORS.PROFILE_NOT_FOUND);
      }

      const bucketName = envConfig.S3.uploadProfileImgBucket;
      const profileImage = currentProfile?.avatar
        ? await this.s3Service.getSignedFileUrl(
            currentProfile.avatar,
            bucketName,
          )
        : null;

      return {
        userId,
        userAvatar: profileImage,
      };
    } catch (error) {
      throw error;
    }
  }
  async getProfileResume(userId: string) {
    try {
      const checkUser = await this.prismaService.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!checkUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const currentProfile = await this.prismaService.profile.findUnique({
        where: {
          userId: Number(userId),
        },
      });

      if (!currentProfile) {
        throw new BadRequestException(CUSTOM_ERRORS.PROFILE_NOT_FOUND);
      }

      const bucketName = envConfig.S3.userResumeBucket;
      const profileResume = currentProfile?.resume
        ? await this.s3Service.getSignedFileUrl(
            currentProfile.resume,
            bucketName,
          )
        : null;

      const fileName = currentProfile?.resume?.split('-').splice(2).join('-');
      return {
        userId,
        resumeFileName: fileName,
        userResume: profileResume,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteProfileResume(userId: string) {
    try {
      const checkUser = await this.prismaService.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!checkUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const currentProfile = await this.prismaService.profile.findUnique({
        where: {
          userId: Number(userId),
        },
      });

      if (!currentProfile) {
        throw new BadRequestException(CUSTOM_ERRORS.PROFILE_NOT_FOUND);
      }
      if (!currentProfile?.resume) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_RESUME_NOT_FOUND);
      }
      const bucketName = envConfig.S3.userResumeBucket;
      await this.s3Service.deleteObjectFromS3(
        currentProfile.resume,
        bucketName,
      );
      const updatedProfile = await this.prismaService.profile.update({
        where: { userId: Number(userId) },
        data: { resume: null },
      });
      return {
        userId,
        updatedProfile,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteProfileImage(userId: string) {
    try {
      const checkUser = await this.prismaService.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!checkUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const currentProfile = await this.prismaService.profile.findUnique({
        where: {
          userId: Number(userId),
        },
      });

      if (!currentProfile) {
        throw new BadRequestException(CUSTOM_ERRORS.PROFILE_NOT_FOUND);
      }
      if (!currentProfile?.avatar) {
        throw new BadRequestException(CUSTOM_ERRORS.PROFILE_IMAGE_NOT_FOUND);
      }
      const bucketName = envConfig.S3.userResumeBucket;
      await this.s3Service.deleteObjectFromS3(
        currentProfile.avatar,
        bucketName,
      );
      const updatedProfile = await this.prismaService.profile.update({
        where: { userId: Number(userId) },
        data: { avatar: null },
      });
      return {
        userId,
        updatedProfile,
      };
    } catch (error) {
      throw error;
    }
  }
  // electives

  // GET:    finding electives of specific user.

  async findElectiveList(userId: number, tier1Id: number) {
    const profile = await this.findOne(userId);
    const electives = await this.prismaService.elective.findMany({
      where: {
        profileId: profile.id,
        tier1Id: tier1Id,
      },
    });

    // Checking if the tier ids given are valid
    const AllTier1Ids = await this.prismaService.tier1.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const currentTier1Name = await this.prismaService.tier1.findUnique({
      where: {
        id: tier1Id,
      },
    });

    const ArrAllTier1Ids = AllTier1Ids.map((obj) => obj.id);

    if (!ArrAllTier1Ids.includes(tier1Id)) {
      return {
        Error: 'invalid tier 1 id.',
      };
    }

    const Alltier2Ids = await this.prismaService.tier2.findMany({
      where: { tier1Id: tier1Id },
      select: {
        id: true,
        name: true,
      },
    });
    // console.log('All rier2', Alltier2Ids);

    try {
      const formattedElectives = {
        name: currentTier1Name.name,
        id: tier1Id,
        foregroundColor: currentTier1Name.chipForegroundColor,
        backgroundColor: currentTier1Name.backgroundColor,
        tier2skills: await Promise.all(
          electives?.map(async (elective) => {
            const val = {
              id: elective.tier2Id,
              tier1Id: tier1Id,
              name:
                Alltier2Ids?.filter((obj) => obj.id === elective?.tier2Id)
                  .length > 0
                  ? Alltier2Ids?.filter(
                      (obj) => obj.id === elective?.tier2Id,
                    )[0].name
                  : null,
              createdAt: elective.createdAt,
              updatedAt: elective.updatedAt,
              tier3skills: await Promise.all(
                elective.tier3Id.map(async (tier3Id: number) => {
                  const tier3 = await this.prismaService.tier3.findUnique({
                    where: {
                      id: tier3Id,
                    },
                    select: {
                      name: true,
                      tier2Id: true,
                      createdAt: true,
                      updatedAt: true,
                    },
                  });
                  return {
                    id: tier3Id,
                    createdAt: tier3 ? tier3.createdAt : null,
                    updatedAt: tier3 ? tier3.updatedAt : null,
                    tier2Id: tier3 ? tier3.tier2Id : null,
                    name: tier3 ? tier3.name : null,
                  };
                }),
              ),
            };
            // console.log("val coming for electove: ", elective)
            return val;
          }),
        ),
      };

      // console.log("formatted electives: ", formattedElectives)
      const profileData = await this.prismaService.profile.findUnique({
        where: {
          id: profile.id,
        },
      });

      // console.log("found profile, ", profileData)
      const latestElectiveUpdatedAt = profileData.electivesSetAt;
      const currentDate = new Date();
      const oneYearInMs = 365 * 24 * 60 * 60 * 1000; // Number of milliseconds in one year

      const differenceInMs =
        currentDate.getTime() - latestElectiveUpdatedAt?.getTime();

      let remainingDays = Math.ceil(
        (oneYearInMs - differenceInMs) / (1000 * 60 * 60 * 24),
      );
      if (remainingDays < 0) {
        remainingDays = 0;
      }

      return {
        electives: formattedElectives,
        updateElectivesAfter: `${remainingDays} days`, // Format date as yyyy-MM-dd
      };
    } catch (error) {
      console.log('error: ', error);
      return {
        Error: error,
      };
    }
  }

  // Delete Elective
  async deleteElectiveTier3ForUser(
    userId: number,
    tier1Id: number,
    tier2Id: number,
    tier3Id: number,
  ) {
    const profile = await this.findOne(userId);

    const elective = await this.prismaService.elective.findFirst({
      where: {
        tier1Id: tier1Id,
        tier2Id: tier2Id,
        profileId: profile.id,
      },
    });

    if (!elective) {
      throw new NotFoundException('Elective not found.');
    }

    const currentT3 = elective.tier3Id;
    const newAfterDeletion = currentT3.filter((t3) => t3 != tier3Id);

    await this.prismaService.elective.updateMany({
      where: {
        profileId: profile.id,
        tier1Id: tier1Id,
        tier2Id: tier2Id,
      },
      data: {
        tier3Id: newAfterDeletion,
      },
    });

    return {
      deletedElective: newAfterDeletion,
    };
  }

  private async _deleteWholeElectiveForUser(
    userId: number,
    tier1Id: number,
    tier2Id: number,
  ) {
    const profile = await this.findOne(userId);

    const elective = await this.prismaService.elective.findFirst({
      where: {
        tier1Id: tier1Id,
        tier2Id: tier2Id,
        profileId: profile.id,
      },
    });

    if (!elective) {
      throw new NotFoundException('Elective not found.');
    }

    await this.prismaService.elective.deleteMany({
      where: {
        profileId: profile.id,
        tier1Id: tier1Id,
        tier2Id: tier2Id,
      },
    });

    return {
      deletedElective: 'True',
    };
  }

  async deleteElectiveForUser(
    userId: number,
    tier1Id: number,
    tier2Id: number,
  ) {
    return await this._deleteWholeElectiveForUser(userId, tier1Id, tier2Id);
  }

  async updateElective(
    userId: number,
    electiveId: number,
    updateElectiveDto: any,
  ) {
    const profile = await this.findOne(userId);

    // The user profile is
    console.log(
      'User is :',
      profile.firstName,
      profile.lastName,
      profile.userId,
      profile.elective,
    );

    // Showing the selected elective

    const selectedElective = await this.prismaService.elective.findUnique({
      where: { id: electiveId },
    });

    console.log('selected elective is: ', selectedElective);

    try {
      await this.prismaService.elective.update({
        where: {
          id: electiveId,
          profileId: profile.id,
        },
        data: { ...updateElectiveDto },
      });
    } catch {
      return {
        Error: 'This elective does not exist for this user',
      };
    }

    const currentDate = new Date();
    // Update electiveSetAt column in Profile table
    await this.prismaService.profile.update({
      where: { id: profile.id },
      data: { electivesSetAt: currentDate },
    });

    return {
      updatedElectives: profile.elective,
    };
  }

  // Be able to create electives for a user during the onbaording session.
  async createElective(
    userId: number,
    createElectiveDto: any,
    tier1Id: number,
    tier2Id: number,
  ) {
    //  Instantly throwing error if more than 3 electives are sent.
    // currently not adding to check exact 3 electives, because db only has 2 T3 electives for every T2 elective.
    if (createElectiveDto.tier3Id.length > 3) {
      throw new BadRequestException('Cannot create more than 3 electives.');
    }

    // Checking if the tier ids given are valid
    const AllTier1Ids = await this.prismaService.tier1.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const ArrAllTier1Ids = AllTier1Ids.map((obj) => obj.id);

    if (!ArrAllTier1Ids.includes(tier1Id)) {
      throw new NotFoundException('invalid tier 1 id.');
    }

    const Alltier2Ids = await this.prismaService.tier2.findMany({
      where: { tier1Id: tier1Id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!Alltier2Ids.map((obj) => obj.id).includes(tier2Id)) {
      throw new BadRequestException(
        'Invalid Tier 2 id. This t2 id does not belong to the provided t1 series.',
      );
    }

    let Alltier3Ids: any = await this.prismaService.tier3.findMany({
      where: { tier2Id: tier2Id },
      select: {
        id: true,
      },
    });
    Alltier3Ids = Alltier3Ids.map((obj) => obj.id);

    if (!createElectiveDto.tier3Id.every((id) => Alltier3Ids.includes(id))) {
      throw new BadRequestException(
        'Some (or all) of the tier 3 ids do not belong to the provided T2 and T1 family.',
      );
    }

    const profile = await this.findOne(userId);
    const now = new Date();

    if (!profile) {
      throw new NotFoundException('User not found.');
    }

    const elective = this.prismaService.elective.findMany({
      where: {
        profileId: profile.id,
        tier1Id: tier1Id,
        tier2Id: tier2Id,
      },
    });

    if (elective) {
      try {
        for (const obj of profile.elective) {
          if (obj.tier1Id == tier1Id && obj.tier2Id == tier2Id) {
            if (isEqual(obj.tier3Id, createElectiveDto.tier3Id)) {
              return {
                Message: 'no new data found to be added. this already exists.',
              };
            } else {
              console.log('Found that elective exists. Deleting it.');
              await this._deleteWholeElectiveForUser(userId, tier1Id, tier2Id);
            }
          }
        }
      } catch (error) {
        throw error;
      }
    }

    await this.prismaService.profile.update({
      where: { id: profile.id },
      data: {
        electivesSetAt: now,
        elective: {
          create: {
            tier1Id: tier1Id,
            tier2Id: tier2Id,
            tier3Id: createElectiveDto.tier3Id,
          },
        },
      },
    });

    return {
      message: 'Elective Added.',
    };
  }

  //goal

  async findGoalForUser(userId: number) {
    await this.findOne(userId);
    // const profile = await this.findOne(userId);
    // Fetch Goal names
    // const goal = await this.prismaService.goalSetting.findMany({
    //   where: {
    //     id: {
    //       in: profile.goal,
    //     },
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //   },
    // });
    // const responseData = goal.map((goal) => ({
    //   id: goal.id,
    //   name: goal.name,
    // }));
    const responseData = {};

    return responseData;
  }

  async findGoalList() {
    return this.prismaService.goalSetting.findMany();
  }

  async createGoal(userId: number, createGoalDto: any) {
    await this.findUser(userId);
    await this.findExistsGoal(userId);
    return this.prismaService.userGoal.create({
      data: { userId, ...createGoalDto },
    });
  }

  async updateGoal(userId: number, updateGoalDto: any) {
    await this.findUser(userId);
    const findGoal = await this.prismaService.userGoal.findUnique({
      where: { userId },
    });

    if (!findGoal) {
      return this.prismaService.userGoal.create({
        data: { userId, ...updateGoalDto },
      });
    } else {
      return this.prismaService.userGoal.update({
        where: { userId },
        data: { ...updateGoalDto },
      });
    }
  }

  async getAllCurrentRole() {
    try {
      return await this.prismaService.roleSetting.findMany();
    } catch (error) {
      throw error;
    }
  }
  async getAllHearAboutUs() {
    try {
      return await this.prismaService.hearAbtUsSetting.findMany();
    } catch (error) {
      throw error;
    }
  }

  async updateUserCurrentRole(
    userId: number,
    updateUserRoleDto: RoleDtoSchema,
  ) {
    try {
      const findUser = await this.prismaService.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!findUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const findRoleId = await this.prismaService.roleSetting.findUnique({
        where: {
          name: updateUserRoleDto?.role,
        },
      });

      if (!findRoleId) {
        throw new BadRequestException(CUSTOM_ERRORS.INVALID_USER_ROLE);
      }
      const updatedProfile = await this.prismaService.user.update({
        where: { id: Number(userId) },
        data: { userRole: findRoleId?.id },
      });
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }
  async updateUserHearAboutUs(
    userId: number,
    updateHearAbtUsDto: HearAbtUsSchema,
  ) {
    try {
      const findUser = await this.prismaService.user.findUnique({
        where: {
          id: Number(userId),
        },
      });

      if (!findUser) {
        throw new BadRequestException(CUSTOM_ERRORS.USER_NOT_FOUND);
      }
      const findHearAboutUs =
        await this.prismaService.hearAbtUsSetting.findUnique({
          where: {
            name: updateHearAbtUsDto?.hearAboutUs,
          },
        });

      if (!findHearAboutUs) {
        throw new BadRequestException(CUSTOM_ERRORS.INVALID_USER_ROLE);
      }

      const checkUserOnboarding =
        await this.prismaService.onboarding.findUnique({
          where: {
            userId: Number(userId),
          },
        });

      if (checkUserOnboarding) {
        throw new BadRequestException(
          `Onboarding Details are already present for userId: ${userId}`,
        );
      }

      const updatedProfile = await this.prismaService.onboarding.create({
        data: {
          acquisitionChannel: findHearAboutUs.name,
          user: {
            connect: { id: Number(userId) },
          },
        },
      });
      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }

  async UserHearAboutUs(userId: number, updateHearAbtUsDto: HearAbtUsSchema) {
    try {
      await this.findUser(userId);

      const acquisitionChannel =
        await this.prismaService.hearAbtUsSetting.findUnique({
          where: { name: updateHearAbtUsDto?.hearAboutUs },
        });

      if (!acquisitionChannel) {
        throw new BadRequestException(CUSTOM_ERRORS.INVALID_USER_ROLE);
      }
      const updatedProfile = await this.prismaService.onboarding.upsert({
        where: { userId: Number(userId) },
        update: { acquisitionChannel: acquisitionChannel.name },
        create: {
          acquisitionChannel: acquisitionChannel.name,
          user: { connect: { id: Number(userId) } },
        },
      });

      return updatedProfile;
    } catch (error) {
      throw error;
    }
  }

  async getCityStateByPincode(pincode: number) {
    try {
      const locationInfo = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const res = await locationInfo.json();

      if (!locationInfo.ok || res[0].Status === 'Error') {
        this.logger.logError('[PWA-API][getCityStateByPincode] - error', {
          locationInfo,
        });
        throw new BadRequestException('Invalid Pincode');
      }
      const [firstObj] = res;

      if (firstObj?.Status === 'Error') {
        return {
          city: null,
          pincode: null,
          state: null,
        };
      }
      this.logger.logInfo(
        '[PWA-API][getCityStateByPincode] locationInfo from Indian Post API: ',
        {
          data: firstObj?.Message,
        },
      );
      const [postList] = res?.['0']?.PostOffice;
      const response = {
        city: postList?.District,
        pincode: postList?.Pincode,
        state: postList?.State,
      };
      return response;
    } catch (error) {
      this.logger.logError('[PWA-API][getCityStateByPincode] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  // async getUserElectives(
  //   userId: number,
  // ) {
  //   try {
  //     const elective = this.prismaService.profile
  //   }
  // }

  async updateUserInfo(
    userId: number,
    updateUserInfo: UpdateUserInfoRequestDto,
  ) {
    try {
      const { firstName, lastName, pincode, email } = updateUserInfo;
      const { city, state } = await this.getCityStateByPincode(pincode);
      if (!city || !state) {
        throw new BadRequestException('Invalid Pincode');
      }
      const findUser = await this.prismaService.user.findUnique({
        where: {
          id: +userId,
        },
      });
      this.logger.logInfo('[PWA-API][updateUserInfo] checkUserExist: ', {
        data: findUser,
      });
      if (!findUser) {
        this.logger.logError('[PWA-API][updateUserInfo] UserNotFound: ', {
          data: findUser,
        });
        throw new BadRequestException('Invalid UserId');
      }
      const updatedCreateProfile = await this.prismaService.profile.upsert({
        where: { userId: +userId },
        update: { firstName, lastName, email, updatedAt: new Date() },
        create: {
          userId: +userId,
          firstName,
          lastName,
          email,
          isEmailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          electivesSetAt: new Date(),
        },
      });

      await this.prismaService.address.upsert({
        where: { profileId: +updatedCreateProfile?.id },
        update: {
          country: 'India',
          pincode: pincode?.toString(),
          state: state,
          cityDistrict: city,
        },
        create: {
          country: 'India',
          pincode: pincode?.toString(),
          state: state,
          cityDistrict: city,
          profileId: +updatedCreateProfile?.id,
        },
      });

      const updateProfile = await this.prismaService.profile.findUnique({
        where: {
          userId: +userId,
        },
        select: {
          address: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      this.logger.logInfo('[PWA-API][updateUserInfo] updateProfileResponse: ', {
        data: updateProfile,
      });
      return updateProfile;
    } catch (error) {
      this.logger.logError('[PWA-API][updateUserInfo] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async getFACETSinfoOnboarding() {
    try {
      const tier1Data = await this.prismaService.tier1.findMany({
        select: {
          id: true,
          name: true,
          foregroundColor: true,
          backgroundColor: true,
          cardBackgroundColor: true,
          chipForegroundColor: true,
          cardBorderColor: true,
          isActive: true,
        },
      });

      const tier1WithTier3Data = await this.prismaService.tier1.findMany({
        include: {
          tier2: {
            include: {
              tier3: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const response = tier1Data.map((t1) => {
        const matchingTier1 = tier1WithTier3Data.find((t) => t.id === t1.id);
        const tier3Count =
          matchingTier1?.tier2.reduce(
            (count, t2) => count + t2.tier3.length,
            0,
          ) || 0;
        return {
          ...t1,
          tier3Count,
        };
      });

      return response;
    } catch (error) {
      this.logger.logError('[PWA-API][getFACETSinfoOnboarding] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async getCareerIssueOptions() {
    try {
      return await this.prismaService.careerIssueSetting.findMany({});
    } catch (error) {
      this.logger.logError('[PWA-API][getCareerIssueOptions] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async userCareerIssues(
    userId: number,
    careerIssuesInfo: careerIssuesDtoSchema,
  ) {
    try {
      const { careerIssues } = careerIssuesInfo;

      const doesExist = await this.prismaService.userCareerIssue.findUnique({
        where: {
          userId: +userId,
        },
      });

      if (doesExist) {
        await this.prismaService.userCareerIssue.delete({
          where: {
            userId: +userId,
          },
        });
      }

      const issues = await this.prismaService.userCareerIssue.create({
        data: {
          userId: +userId,
          careerIssues,
        },
      });

      return issues.careerIssues;
    } catch (error) {
      this.logger.logError('[PWA-API][userCareerIssues] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  // async pushNotificationsPermission(
  //   userId: number,
  //   pushNotificationsInfo: pushNotificationsDtoSchema,
  // ) {
  //   try {
  //     const { flag } = pushNotificationsInfo;
  //     const findUser = await this.prismaService.profile.findUnique({
  //       where: {
  //         userId: +userId,
  //       },
  //     });

  //     if (!findUser) {
  //       throw new NotFoundException(CUSTOM_ERRORS.PROFILE_NOT_FOUND);
  //     }

  //     const data = await this.prismaService.profile.update({
  //       where: { userId: +userId },
  //       data: {
  //         pushNotifications: flag,
  //       },
  //     });

  //     return {
  //       pushNotifications: data.pushNotifications,
  //     };
  //   } catch (error) {
  //     this.logger.logError('[PWA-API][pushNotificationsPermission] - error', {
  //       status: error?.status,
  //       error,
  //     });
  //     throw error;
  //   }
  // }

  async getOnboardingStatus(userId: string) {
    try {
      const { isNewUser, onboardingSlug } = await this.findUser(+userId);

      return {
        onboardingSlug,
        isOnboardingCompleted:
          !isNewUser && onboardingSlug === '' ? true : false,
      };
    } catch (error) {
      this.logger.logError('[PWA-API][getOnboardingStatus] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async updateOnboardingStatus(
    userId: string,
    updateOnboardingStatusDto: OnboardingStatusDtoSchema,
  ) {
    try {
      await this.findUser(+userId);

      const { onboardingSlug } = updateOnboardingStatusDto;
      const isNewUser = onboardingSlug ? true : false;

      await this.prismaService.user.update({
        where: { id: +userId },
        data: {
          isNewUser,
          onboardingSlug,
        },
      });

      return {
        onboardingSlug,
        isOnboardingCompleted:
          !isNewUser && onboardingSlug === '' ? true : false,
      };
    } catch (error) {
      this.logger.logError('[PWA-API][updateOnboardingStatus] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async updateNotificationSettings(
    userId: number,
    notificationSettings: NotificationPreferenceDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const profile = await this.findOne(userId);
    try {
      const parsedData =
        notificationPreferenceDtoSchema.parse(notificationSettings);

      const { notificationType, status } = parsedData;
      if (notificationType == 'email') {
        await this.prismaService.profile.update({
          where: { userId },
          data: { emailNotifications: status },
        });

        return {
          Status: 'Email Notification Settings updated!',
        };
      }
      // else if (notificationType == 'push') {
      //   await this.prismaService.profile.update({
      //     where: { userId },
      //     data: { pushNotifications: status },
      //   });
      //   return {
      //     Status: 'Push Notification Settings updated!',
      //   };
      // }
      else {
        throw new BadRequestException('Invalid notifcation channel');
      }
    } catch (error) {
      throw error;
    }
  }

  async getNotificationPreference(userId: number) {
    const profile = await this.findOne(userId);

    try {
      const emailNotificationEnabled = profile.emailNotifications;
      // const pushNotificationEnabled = profile.pushNotifications;

      return {
        emailNotificationEnabled,
        // pushNotificationEnabled,
      };
    } catch (error) {
      throw error;
    }
  }

  async getInAppNotifications(userId: number) {
    try {
      const profile = await this.prismaService.profile.findUnique({
        where: {
          userId: +userId,
        },
      });

      if (!profile) {
        throw new NotFoundException(
          `User with userId ${userId} doesn't exist!`,
        );
      }

      const notifications = await this.prismaService.notification.findMany({
        where: {
          userId: +userId,
        },
        select: {
          message: true,
          isRead: true,
        },
      });

      return { notifications };
    } catch (error) {
      this.logger.logError('[PWA-API][getInAppNotifications] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }

  async subscribePushNotification(
    userId: number,
    pushNotificationSubscriptionDto: PushNotificationSubscriptionDto,
  ) {
    try {
      await this.findUser(+userId);

      const profile = await this.prismaService.profile.findUnique({
        where: {
          userId: +userId,
        },
      });

      if (!profile) {
        throw new NotFoundException(
          `User with userId ${userId} doesn't exist!`,
        );
      }

      const subscriptionExists =
        await this.prismaService.pushNotification.findUnique({
          where: {
            userId: +userId,
          },
        });

      if (subscriptionExists) {
        await this.prismaService.pushNotification.delete({
          where: {
            userId: +userId,
          },
        });
      }

      await this.prismaService.pushNotification.create({
        data: {
          subscription: pushNotificationSubscriptionDto.subscription,
          profile: {
            connect: {
              userId: +userId,
            },
          },
        },
      });

      return { status: 'Subscription for push notifications added' };
    } catch (error) {
      this.logger.logError(
        '[PWA-API][postPushNotficationSubscription] - error',
        {
          status: error?.status,
          error,
        },
      );
      throw error;
    }
  }
}
