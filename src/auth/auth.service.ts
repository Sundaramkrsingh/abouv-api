/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CUSTOM_ERRORS,
  JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  OTP_EXPIRATION_TIME,
  TOKEN_EXPIRATION_TIME,
} from 'src/constants';
import { envConfig } from 'src/shared/config/app.config';
import type {
  GoogleSigninDtoSchema,
  LoginDto,
  LoginEmailDtoSchema,
  passwordDto,
  RequestDTO,
} from './dto/auth.dto';
import { getOTP, checkTestUser } from 'src/shared/utils';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { PasswordResetSchema } from './dto/auth.dto';
import ResetPassword from 'src/email-templates/reset-password';
import { ZodError } from 'zod';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js/mobile';
import { GetEmailDtoSchema } from 'src/profiles/profiles.dto';
import EmailVerification from 'src/email-templates/email-verification';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async signUp(userInfo: any) {
    try {
      let userCreated = null;

      const doesUserExist = await this.prismaService.user.findUnique({
        where: { phoneNumber: userInfo.phoneNumber },
      });

      if (isValidPhoneNumber(userInfo?.phoneNumber) === false) {
        throw new BadRequestException(CUSTOM_ERRORS.INVALID_PHONE_NUMBER);
      }

      if (parsePhoneNumber(userInfo?.phoneNumber)?.country !== 'IN') {
        throw new BadRequestException(CUSTOM_ERRORS.INVALID_COUNTRY_CODE);
      }

      if (!doesUserExist) {
        userCreated = await this.prismaService.user.create({
          data: {
            phoneNumber: userInfo.phoneNumber,
            isPhoneNumberVerified: false,
            isNewUser: true,
          },
        });
      }

      if (userCreated) {
        return {
          status: HttpStatus.CREATED,
          userInfo: userCreated,
        };
      }

      // If user exists, check if its account is created or not
      const hasProfile = await this.prismaService.profile.findUnique({
        where: { userId: doesUserExist?.id },
      });

      // If account is created then throw an error and on UI redirect it to login page
      if (hasProfile?.email && hasProfile?.password) {
        throw new ConflictException('User is already registered');
      }

      // else continue with signup flow
      return {
        userInfo: doesUserExist,
      };
    } catch (error) {
      throw error;
    }
  }

  async tempSignUp(userInfo: any) {
    try {
      const doesUserExist = await this.prismaService.user.findUnique({
        where: { phoneNumber: userInfo.phoneNumber },
      });

      if (doesUserExist) {
        const countryCode = userInfo?.phoneNumber?.slice(0, 3);
        if (countryCode != '+91') {
          throw new BadRequestException(CUSTOM_ERRORS.INVALID_COUNTRY_CODE);
        }
        return {
          status: HttpStatus.OK,
          userInfo: doesUserExist,
        };
      }
      const userCreated = await this.prismaService.user.create({
        data: {
          phoneNumber: userInfo.phoneNumber,
          isPhoneNumberVerified: true,
          isNewUser: true,
        },
      });
      if (userInfo?.phoneNumber) {
        const countryCode = userInfo?.phoneNumber?.slice(0, 3);
        if (countryCode != '+91') {
          throw new BadRequestException(CUSTOM_ERRORS.INVALID_COUNTRY_CODE);
        }
      }
      return {
        status: HttpStatus.CREATED,
        userInfo: userCreated,
      };
    } catch (error) {
      throw error;
    }
  }

  async signIn(userInfo: any) {
    try {
      const { phoneNumber, smsOtp } = userInfo;
      const user = await this.prismaService.user.findUnique({
        where: { phoneNumber: phoneNumber },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid phone Number');
      }

      if (!(smsOtp === user.otp)) {
        throw new BadRequestException('Invalid Otp');
      }
      const isOtpValid = this.checkOtpExpiration(user.otpGeneratedAt);

      if (isOtpValid) {
        throw new BadRequestException('Otp Expired');
      }

      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          otp: null,
          otpGeneratedAt: null,
          isPhoneNumberVerified: true,
        },
      });

      const token = await this.generateToken(user.id, user.phoneNumber);
      if (!token) {
        throw new ForbiddenException('Invalid token');
      }
      const rt = await this.generateRefreshToken(user.id);
      return {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        token: token,
        refreshToken: rt,
        userInfo: user,
      };
    } catch (error) {
      throw error;
    }
  }

  async loginEmail(loginEmailDto: LoginEmailDtoSchema) {
    const profile = await this.prismaService.profile.findUnique({
      where: { email: loginEmailDto?.email },
    });

    if (!profile) {
      throw new NotFoundException('This account does not exist');
    }

    try {
      if (checkTestUser(loginEmailDto?.email)) {
        return { profile };
      }

      await this.getEmailVerificationOTP(profile.userId, {
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
      console.log(error);
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
      console.log(error);
      throw error;
    }
  }

  async loginUser(loginUserDto: LoginDto) {
    try {
      const profile = await this.prismaService.profile.findUnique({
        where: { email: loginUserDto?.email },
      });

      if (!profile) {
        throw new NotFoundException('This account does not exist');
      }

      if (!checkTestUser(loginUserDto?.email)) {
        const otp = await this.prismaService.emailVerificationOTP.findUnique({
          where: {
            userId: profile.userId,
          },
        });

        if (!otp || otp.expiresAt < new Date()) {
          console.log('OTP has been expired');
          throw new BadRequestException(CUSTOM_ERRORS.OTP_EXPIRED);
        }

        if (otp.otp !== loginUserDto?.otp) {
          throw new ForbiddenException(CUSTOM_ERRORS.INCORRECT_OTP);
        }
      }

      const userPhoneNumber = await this.prismaService.user.findUnique({
        where: {
          id: profile.userId,
        },
        select: {
          phoneNumber: true,
        },
      });

      const token = await this.generateToken(
        profile.userId,
        userPhoneNumber.phoneNumber,
      );

      const rt = await this.generateRefreshToken(profile.userId);
      if (!token || !rt) {
        throw new ForbiddenException('Invalid token');
      }
      return { token: token, refreshToken: rt };
    } catch (error) {
      throw error;
    }
  }

  async signOut(headers: any) {
    try {
      const refreshToken = headers.refreshtoken;
      const decoded = await this.verifyToken(refreshToken, true);
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }
      const user = await this.prismaService.user.findUnique({
        where: { id: Number(decoded.sub) },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      // await this.generateToken(user.id, user.phoneNumber);
      return {
        status: HttpStatus.OK,
        message: 'Signed out successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async generateTokenByRefreshToken(headers: any, userId: number) {
    try {
      const refreshToken = headers.authorization.split(' ')[1];
      const decoded = await this.verifyToken(refreshToken, true);
      if (!decoded) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const tokenUserId = Number(decoded.sub);
      if (tokenUserId !== Number(userId)) {
        throw new UnauthorizedException('Mismatch User Id & refresh token');
      }
      const user = await this.prismaService.user.findUnique({
        where: { id: tokenUserId },
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const token = await this.generateToken(user.id, user.phoneNumber);
      if (!token) {
        throw new ForbiddenException('Invalid token');
      }
      return {
        status: HttpStatus.OK,
        usrId: user.id,
        token: token,
      };
    } catch (error) {
      throw error;
    }
  }
  async generateOtp(userInfo: any) {
    try {
      const { phoneNumber } = userInfo;
      const user = await this.prismaService.user.findUnique({
        where: { phoneNumber: phoneNumber },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const otp = getOTP();

      if (user?.otp) {
        const isOtpExpired = this.checkOtpExpiration(user?.otpGeneratedAt);
        if (isOtpExpired) {
          await this.prismaService.user.update({
            where: { id: user.id },
            data: { otp, otpGeneratedAt: new Date() },
          });
          return {
            userId: user.id,
            otp,
            phoneNumber: user.phoneNumber,
          };
        } else {
          const timeRemaining = this.getRemainingSeconds(user?.otpGeneratedAt);
          return {
            message: `please wait, Time remaining to resend otp: ${timeRemaining}s`,
          };
        }
      }
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { otp, otpGeneratedAt: new Date() },
      });

      return {
        userId: user.id,
        otp,
        phoneNumber: user.phoneNumber,
      };
    } catch (error) {
      throw error;
    }
  }

  getRemainingSeconds(otpGeneratedAt: Date = null): number {
    if (!otpGeneratedAt) {
      return 0;
    }
    const now = new Date();
    const otpExpiry = new Date(otpGeneratedAt.getTime() + OTP_EXPIRATION_TIME);
    const difference = otpExpiry.getTime() - now.getTime();
    return Math.floor(difference / 1000);
  }

  private checkOtpExpiration(otpGeneratedTime: Date): boolean {
    if (!otpGeneratedTime) {
      return true;
    }
    const now = new Date();
    const otpExpiry = new Date(
      otpGeneratedTime.getTime() + OTP_EXPIRATION_TIME,
    );
    return now.getTime() > otpExpiry.getTime();
  }

  private async generateToken(userId: number, mobileNo: string) {
    try {
      const payload = {
        id: userId,
        phoneNumber: mobileNo,
      };
      return await this.jwtService.signAsync(payload, {
        secret: envConfig.jwt.secret,
        expiresIn: TOKEN_EXPIRATION_TIME,
      });
    } catch (error) {
      throw new BadRequestException('Could not generate token');
    }
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    try {
      const refreshPayload = {
        sub: userId.toString(),
      };
      return await this.jwtService.signAsync(refreshPayload, {
        secret: envConfig.jwt.refreshTokenSecret,
        expiresIn: JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      });
    } catch (error) {
      throw new BadRequestException('Could not generate refresh token');
    }
  }

  private async verifyToken(token: string, isRefreshToken: boolean) {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: isRefreshToken
          ? envConfig.jwt.refreshTokenSecret
          : envConfig.jwt.secret,
      });
      return decoded;
    } catch (error) {
      console.log(error);
      throw new ForbiddenException('Invalid or expired token');
    }
  }

  async requestPasswordReset(userInfo: RequestDTO) {
    try {
      const profile = await this.prismaService.profile.findFirst({
        where: { email: userInfo.email },
      });

      if (!profile) {
        throw new NotFoundException('This account does not exist');
      }

      const resetToken = await this.generatePasswordResetToken(profile);

      await this.sendResetInstructions(
        profile.fullName,
        profile.email,
        resetToken,
      );

      return {
        status: HttpStatus.OK,
        message: 'Password reset instructions sent successfully on mail',
      };
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        throw error;
      } else {
        throw new BadRequestException(
          'Could not process password reset request',
        );
      }
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async resetPassword(
    token: string,
    passwordResetDTO: passwordDto,
  ): Promise<{ status: number; message: string }> {
    try {
      const { password } = PasswordResetSchema.parse(passwordResetDTO);

      const resetTokenRecord =
        await this.prismaService.passwordResetToken.findUnique({
          where: { token },
          include: { user: true },
        });

      if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
        console.log('Invalid or expired reset token');
        throw new BadRequestException('Invalid or expired reset token');
      }

      const hashedPassword = await this.hashPassword(password);

      await this.prismaService.profile.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      });

      await this.prismaService.passwordResetToken.delete({
        where: { token },
      });

      return {
        status: HttpStatus.ACCEPTED,
        message: 'Password reset successful',
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(
          'Validation error: ' + error.errors.map((e) => e.message).join(', '),
        );
      } else {
        throw new BadRequestException('Could not reset password');
      }
    }
  }

  async signToken(args: { userId: string; email: string }) {
    try {
      const payload = {
        id: args.userId,
        email: args.email,
      };

      const expiresIn = '10mins';

      return await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn,
      });
    } catch (error) {
      throw new BadRequestException('Could not sign token');
    }
  }

  private async generatePasswordResetToken(user) {
    try {
      const token = await this.signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      if (user) {
        await this.prismaService.passwordResetToken.deleteMany({
          where: { userId: user.id },
        });
      }

      await this.prismaService.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      return token;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Could not generate password reset token');
    }
  }

  private async sendResetInstructions(
    username: string,
    email: string,
    resetToken: string,
  ) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: envConfig.node_mailer.email,
          pass: envConfig.node_mailer.password,
        },
      });

      const url = `https://${envConfig.subDomain}abouv.com/reset-password?token=${resetToken}`;
      const instaUrl = 'https://www.instagram.com/be.abouv/';
      const linkedinUrl =
        'https://www.linkedin.com/company/beztlabs/mycompany/';

      const emailHtml = render(
        ResetPassword({
          url,
          name: username,
          instaUrl,
          linkedinUrl,
        }),
      );

      const mailOptions = {
        from: envConfig.node_mailer.email,
        to: email,
        subject: 'Password Reset Instructions',
        html: emailHtml,
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Could not send reset instructions');
    }
  }

  async updateFirstTimeUser(userId: string) {
    try {
      const user = await this.prismaService.profile.findUnique({
        where: { userId: Number(userId) },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.isFirstTime) {
        return {
          status: HttpStatus.OK,
          message: 'User is already updated',
        };
      }

      await this.prismaService.profile.update({
        where: { userId: Number(userId) },
        data: { isFirstTime: false },
      });

      return {
        status: HttpStatus.OK,
        message: 'User updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  async findFirstUser(userId: string) {
    const user = await this.prismaService.profile.findUnique({
      where: { userId: Number(userId) },
    });

    if (!user) {
      console.log(`User with id ${userId} not found`);
      throw new NotFoundException('User not found');
    }

    return user.isFirstTime;
  }

  async googleSignup(userId: number, googleSigninDto: GoogleSigninDtoSchema) {
    try {
      const { email } = googleSigninDto;

      const existingProfile = await this.prismaService.profile.findUnique({
        where: { email },
      });

      if (existingProfile && existingProfile.userId !== +userId) {
        throw new ConflictException({
          message: 'Email already exists',
          messageCode: `EMAIL_EXISTS`,
        });
      }

      const profile = await this.prismaService.profile.upsert({
        where: { userId: +userId },
        update: {
          email,
          isEmailVerified: true,
          user: {
            connect: {
              id: +userId,
            },
          },
        },
        create: {
          email,
          isEmailVerified: true,
          user: {
            connect: {
              id: +userId,
            },
          },
        },
      });

      return { profile };
    } catch (error) {
      throw error;
    }
  }

  async googleLogin(googleLoginDto: GoogleSigninDtoSchema) {
    try {
      const profile = await this.prismaService.profile.findFirst({
        where: { email: googleLoginDto?.email },
      });

      if (!profile) {
        throw new NotFoundException('This account does not exist');
      }

      const userPhoneNumber = await this.prismaService.user.findUnique({
        where: {
          id: profile.userId,
        },
        select: {
          phoneNumber: true,
        },
      });

      const token = await this.generateToken(
        profile.userId,
        userPhoneNumber.phoneNumber,
      );

      const rt = await this.generateRefreshToken(profile.userId);
      if (!token || !rt) {
        throw new ForbiddenException('Invalid token');
      }
      return { token: token, refreshToken: rt };
    } catch (error) {
      throw error;
    }
  }
}
