/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import * as ProfilesDtoSchema from './profiles.dto';
import * as ProfileSwaggerSchema from './profiles.swagger.schema';
import * as ProfilesSwaggerExample from './profiles.swagger.example';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}
  @Get('/goals')
  findGoalList() {
    return this.profilesService.findGoalList();
  }

  /**
   * Profile
   */
  @Get()
  // @UseGuards(JwtAuthGuard)
  findAll() {
    return this.profilesService.findAll();
  }

  @Get('profile/:userId')
  // @UseGuards(JwtAuthGuard)
  findOne(@Param('userId') userId: string) {
    return this.profilesService.findOne(+userId);
  }
  //goal

  @Get(':userId/goal')
  findGoalForUser(@Param('userId') userId: string) {
    return this.profilesService.findGoalForUser(+userId);
  }

  @Patch(':userId/goal')
  @ApiBody({
    schema: ProfileSwaggerSchema.goalDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.goalDtoSwaggerExample,
  })
  updateGoal(
    @Param('userId') userId: string,
    @Body() updateGoalDto: ProfilesDtoSchema.GoalDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.goalDtoSchema.parse(updateGoalDto);
    return this.profilesService.updateGoal(+userId, validatedData);
  }
  @Post(':userId/goal')
  @ApiBody({
    schema: ProfileSwaggerSchema.goalDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.goalDtoSwaggerExample,
  })
  createGoal(
    @Param('userId') userId: string,
    @Body() goalDtoSchema: ProfilesDtoSchema.GoalDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.goalDtoSchema.parse(goalDtoSchema);
    return this.profilesService.createGoal(+userId, validatedData);
  }
  /**
   * Basic
   */
  @Get(':userId/basic')
  findBasic(@Param('userId') userId: string) {
    return this.profilesService.findBasic(+userId);
  }

  @Post(':userId/email')
  @ApiBody({
    schema: ProfileSwaggerSchema.addEmailDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.addEmailDtoSwaggerExample,
  })
  addEmail(
    @Param('userId') userId: string,
    @Body() addEmailDto: ProfilesDtoSchema.AddEmailDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.addEmailDtoSchema.parse(addEmailDto);
    return this.profilesService.addEmail(+userId, validatedData);
  }

  @Patch(':userId/email')
  @ApiBody({
    schema: ProfileSwaggerSchema.addEmailDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.addEmailDtoSwaggerExample,
  })
  updateEmail(
    @Param('userId') userId: string,
    @Body() updateEmailDto: ProfilesDtoSchema.AddEmailDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.addEmailDtoSchema.parse(updateEmailDto);
    return this.profilesService.updateEmail(+userId, validatedData);
  }

  // now doing it in a single api
  // @Post(':userId/otp-request')
  // @ApiBody({
  //   schema: ProfileSwaggerSchema.getEmailDtoSwaggerSchema,
  //   examples: ProfilesSwaggerExample.getEmailDtoSwaggerExample,
  // })
  // async requestEmailVerification(
  //   @Param('userId') userId: number,
  //   @Body() getEmailDto: ProfilesDtoSchema.GetEmailDtoSchema
  // ) {
  //   const validatedData =
  //     ProfilesDtoSchema.getEmailDtoSchema.parse(getEmailDto)
  //   return await this.profilesService.getEmailVerificationOTP(userId, validatedData);
  // }

  @Post(':userId/otp-verify')
  @ApiBody({
    schema: ProfileSwaggerSchema.verifyEmailDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.verifyEmailDtoSwaggerExample,
  })
  async validateEmailVerification(
    @Param('userId') userId: number,
    @Body() verifyEmailDto: ProfilesDtoSchema.verifyEmailDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.verifyEmailDtoSchema.parse(verifyEmailDto);
    return await this.profilesService.verifyEmail(userId, validatedData);
  }

  @Post(':userId/basic')
  @ApiBody({
    schema: ProfileSwaggerSchema.basicDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.basicDtoSwaggerExample,
  })
  createBasic(
    @Param('userId') userId: string,
    @Body() createBasicDto: ProfilesDtoSchema.BasicDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.basicDtoSchema.parse(createBasicDto);
    return this.profilesService.createBasic(+userId, validatedData);
  }

  @Patch(':userId/basic')
  @ApiBody({
    schema: ProfileSwaggerSchema.basicDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.basicDtoSwaggerExample,
  })
  updateBasic(
    @Param('userId') userId: string,
    @Body() updateBasicDto: ProfilesDtoSchema.BasicDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.basicDtoSchema.parse(updateBasicDto);
    return this.profilesService.updateBasic(+userId, validatedData);
  }

  /* Password */

  @Get(':userId/password')
  findPassword(@Param('userId') userId: string) {
    return this.profilesService.findBasic(+userId);
  }

  @Post(':userId/password')
  @ApiBody({
    schema: ProfileSwaggerSchema.passwordDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.passwordDtoSwaggerExample,
  })
  createPassword(
    @Param('userId') userId: string,
    @Body() passwordDtoSchema: ProfilesDtoSchema.passwordDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.passwordDtoSchema.parse(passwordDtoSchema);
    return this.profilesService.createPassword(+userId, validatedData);
  }

  @Patch(':userId/password')
  @ApiBody({
    schema: ProfileSwaggerSchema.passwordDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.passwordDtoSwaggerExample,
  })
  updatePassword(
    @Param('userId') userId: string,
    @Body() updatePasswordDto: ProfilesDtoSchema.passwordDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.passwordDtoSchema.parse(updatePasswordDto);
    return this.profilesService.updatePassword(+userId, validatedData);
  }

  /**
   * Address
   */
  @Get(':userId/address')
  findAddress(@Param('userId') userId: string) {
    return this.profilesService.findAddress(+userId);
  }

  @Post(':userId/address')
  @ApiBody({
    schema: ProfileSwaggerSchema.addressDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.addressDtoSwaggerExample,
  })
  createAddress(
    @Param('userId') userId: string,
    @Body() createAddressDto: ProfilesDtoSchema.AddressDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.addressDtoSchema.parse(createAddressDto);
    return this.profilesService.createAddress(+userId, validatedData);
  }

  @Patch(':userId/address')
  @ApiBody({
    schema: ProfileSwaggerSchema.addressDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.addressDtoSwaggerExample,
  })
  updateAddress(
    @Param('userId') userId: string,
    @Body() updateAddressDto: ProfilesDtoSchema.AddressDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.addressDtoSchema.parse(updateAddressDto);
    return this.profilesService.updateAddress(+userId, validatedData);
  }

  /**
   * Work Experience
   */
  @Get(':userId/work-experience')
  findWorkExperience(@Param('userId') userId: string) {
    return this.profilesService.findWorkExperience(+userId);
  }

  @Post(':userId/work-experience')
  @ApiBody({
    schema: ProfileSwaggerSchema.workExperienceDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.workExperienceDtoSwaggerExample,
  })
  createWorkExperience(
    @Param('userId') userId: string,
    @Body() createWorkExperienceDto: ProfilesDtoSchema.WorkExperienceDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.workExperienceDtoSchema.parse(
      createWorkExperienceDto,
    );
    return this.profilesService.createWorkExperience(+userId, validatedData);
  }

  @Patch(':userId/work-experience/:workExperienceId')
  @ApiBody({
    schema: ProfileSwaggerSchema.workExperienceDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.workExperienceDtoSwaggerExample,
  })
  updateWorkExperience(
    @Param('userId') userId: string,
    @Param('workExperienceId') workExperienceId: string,
    @Body() updateWorkExperienceDto: ProfilesDtoSchema.WorkExperienceDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.workExperienceDtoSchema.parse(
      updateWorkExperienceDto,
    );
    return this.profilesService.updateWorkExperience(
      +userId,
      +workExperienceId,
      validatedData,
    );
  }

  @Delete(':userId/work-experience/:workExperienceId')
  deleteWorkExperience(
    @Param('userId') userId: string,
    @Param('workExperienceId') workExperienceId: string,
  ) {
    return this.profilesService.deleteWorkExperience(
      +userId,
      +workExperienceId,
    );
  }

  /**
   * Project
   */
  @Get(':userId/project')
  findProject(@Param('userId') userId: string) {
    return this.profilesService.findProject(+userId);
  }

  @Post(':userId/project')
  @ApiBody({
    schema: ProfileSwaggerSchema.projectDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.projectDtoSwaggerExample,
  })
  createProject(
    @Param('userId') userId: string,
    @Body() createProjectDto: ProfilesDtoSchema.ProjectDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.projectDtoSchema.parse(createProjectDto);
    return this.profilesService.createProject(+userId, validatedData);
  }

  @Patch(':userId/project/:projectId')
  @ApiBody({
    schema: ProfileSwaggerSchema.projectDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.projectDtoSwaggerExample,
  })
  updateProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
    @Body() updateProjectDto: ProfilesDtoSchema.ProjectDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.projectDtoSchema.parse(updateProjectDto);
    return this.profilesService.updateProject(
      +userId,
      +projectId,
      validatedData,
    );
  }

  @Delete(':userId/project/:projectId')
  deleteProject(
    @Param('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.profilesService.deleteProject(+userId, +projectId);
  }

  /**
   * License and Certification
   */
  @Get(':userId/license-certification')
  findLicenseCertification(@Param('userId') userId: string) {
    return this.profilesService.findLicenseCertification(+userId);
  }

  @Post(':userId/license-certification')
  @ApiBody({
    schema: ProfileSwaggerSchema.licenseCertificationDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.licenseCertificationDtoSwaggerExample,
  })
  createLicenseCertification(
    @Param('userId') userId: string,
    @Body()
    createLicenseCertificationDto: ProfilesDtoSchema.LicenseCertificationDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.licenseCertificationDtoSchema.parse(
      createLicenseCertificationDto,
    );
    return this.profilesService.createLicenseCertification(
      +userId,
      validatedData,
    );
  }

  @Patch(':userId/license-certification/:licenseCertificationId')
  @ApiBody({
    schema: ProfileSwaggerSchema.licenseCertificationDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.licenseCertificationDtoSwaggerExample,
  })
  updateLicenseCertification(
    @Param('userId') userId: string,
    @Param('licenseCertificationId') licenseCertificationId: string,
    @Body()
    updateLicenseCertificationDto: ProfilesDtoSchema.LicenseCertificationDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.licenseCertificationDtoSchema.parse(
      updateLicenseCertificationDto,
    );
    return this.profilesService.updateLicenseCertification(
      +userId,
      +licenseCertificationId,
      validatedData,
    );
  }

  @Delete(':userId/license-certification/:licenseCertificationId')
  deleteLicenseCertification(
    @Param('userId') userId: string,
    @Param('licenseCertificationId') licenseCertificationId: string,
  ) {
    return this.profilesService.deleteLicenseCertification(
      +userId,
      +licenseCertificationId,
    );
  }

  /**
   * Education
   */
  @Get(':userId/education')
  findEducation(@Param('userId') userId: string) {
    return this.profilesService.findEducation(+userId);
  }

  @Post(':userId/education')
  @ApiBody({
    schema: ProfileSwaggerSchema.educationDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.educationDtoSwaggerExample,
  })
  createEducation(
    @Param('userId') userId: string,
    @Body()
    createEducationDto: ProfilesDtoSchema.EducationDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.educationDtoSchema.parse(createEducationDto);
    return this.profilesService.createEducation(+userId, validatedData);
  }

  @Patch(':userId/education/:educationId')
  @ApiBody({
    schema: ProfileSwaggerSchema.educationDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.educationDtoSwaggerExample,
  })
  updateEducation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
    @Body() updateEducationDto: ProfilesDtoSchema.EducationDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.educationDtoSchema.parse(updateEducationDto);
    return this.profilesService.updateEducation(
      +userId,
      +educationId,
      validatedData,
    );
  }

  @Delete(':userId/education/:educationId')
  deleteEducation(
    @Param('userId') userId: string,
    @Param('educationId') educationId: string,
  ) {
    return this.profilesService.deleteEducation(+userId, +educationId);
  }

  /**
   * Award and Achievement
   */
  @Get(':userId/award-achievement')
  findAwardAchievement(@Param('userId') userId: string) {
    return this.profilesService.findAwardAchievement(+userId);
  }

  @Post(':userId/award-achievement')
  @ApiBody({
    schema: ProfileSwaggerSchema.awardAchievementDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.awardAchievementDtoSwaggerExample,
  })
  createAwardAchievement(
    @Param('userId') userId: string,
    @Body()
    createAwardAchievementDto: ProfilesDtoSchema.AwardAchievementDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.awardAchievementDtoSchema.parse(
      createAwardAchievementDto,
    );
    return this.profilesService.createAwardAchievement(+userId, validatedData);
  }

  @Patch(':userId/award-achievement/:awardAchievementId')
  @ApiBody({
    schema: ProfileSwaggerSchema.awardAchievementDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.awardAchievementDtoSwaggerExample,
  })
  updateAwardAchievement(
    @Param('userId') userId: string,
    @Param('awardAchievementId') awardAchievementId: string,
    @Body() updateAwardAchievement: ProfilesDtoSchema.AwardAchievementDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.awardAchievementDtoSchema.parse(
      updateAwardAchievement,
    );
    return this.profilesService.updateAwardAchievement(
      +userId,
      +awardAchievementId,
      validatedData,
    );
  }

  @Delete(':userId/award-achievement/:awardAchievementId')
  deleteAwardAchievement(
    @Param('userId') userId: string,
    @Param('awardAchievementId') awardAchievementId: string,
  ) {
    return this.profilesService.deleteAwardAchievement(
      +userId,
      +awardAchievementId,
    );
  }

  //electives

  // @Get(':userId/electives/:tier1Id')
  // findElectiveList(
  //   @Param('userId') userId: string,
  //   @Param('tier1Id') tier1Id: string,
  // ) {
  //   return this.profilesService.findElectiveList(+userId, +tier1Id);
  // }

  @Get(':userId/electives/:tier1Id')
  async findElectiveList(
    @Param('userId') userId: string,
    @Param('tier1Id') tier1Id: string,
  ) {
    return this.profilesService.findElectiveList(+userId, +tier1Id);
  }

  @Patch(':userId/electives/:electiveId')
  @ApiBody({
    schema: ProfileSwaggerSchema.electiveDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.electiveDtoSwaggerExample,
  })
  updateElective(
    @Param('userId') userId: string,
    @Param('electiveId') electiveId: string,
    @Body() updateElectiveDto: ProfilesDtoSchema.ElectiveDtoSchema,
  ) {
    try {
      const validatedData =
        ProfilesDtoSchema.electiveDtoSchema.parse(updateElectiveDto);

      return this.profilesService.updateElective(
        +userId,
        +electiveId,
        validatedData,
      );
    } catch {
      throw new Error('Wrong body in api call');
    }
  }

  @Delete(':userId/elective/tier1/:tier1Id/tier2/:tier2Id/tier3/:tier3Id')
  async deleteElectiveTier3(
    @Param('userId') userId: string,
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Param('tier3Id') tier3Id: string,
  ) {
    return this.profilesService.deleteElectiveTier3ForUser(
      +userId,
      +tier1Id,
      +tier2Id,
      +tier3Id,
    );
  }

  @Delete(':userId/elective/tier1/:tier1Id/tier2/:tier2Id/')
  async deleteElective(
    @Param('userId') userId: string,
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
  ) {
    return this.profilesService.deleteElectiveForUser(
      +userId,
      +tier1Id,
      +tier2Id,
    );
  }

  @Post(':userId/electives/:tier1Id/tier2/:tier2Id')
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiParam({ name: 'tier1Id', type: 'string' })
  @ApiParam({ name: 'tier2Id', type: 'string' })
  @ApiBody({
    schema: ProfileSwaggerSchema.electiveDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.electiveDtoSwaggerExample,
  })
  async addElectiveOnboarding(
    @Param('userId') userId: string,
    @Param('tier1Id') tier1Id: string,
    @Param('tier2Id') tier2Id: string,
    @Body() createElectiveDto: ProfilesDtoSchema.ElectiveDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.electiveDtoSchema.parse(createElectiveDto);

    return this.profilesService.createElective(
      +userId,
      validatedData,
      +tier1Id,
      +tier2Id,
    );
  }

  @Get('notification-preference/:userId')
  @ApiParam({ name: 'userId', type: 'string' })
  async getNotificationPreference(@Param('userId') userId: string) {
    return await this.profilesService.getNotificationPreference(+userId);
  }

  @Post('notification-preference/:userId')
  @ApiBody({
    schema: ProfileSwaggerSchema.notificationPreferenceSwaggerSchema,
    examples: ProfilesSwaggerExample.updateNotifPreferenceExample,
  })
  async updateNotificationPreference(
    @Param('userId') userId: string,
    @Body()
    updateNotificationPreferenceDto: ProfilesDtoSchema.NotificationPreferenceDto,
  ) {
    return await this.profilesService.updateNotificationSettings(
      +userId,
      updateNotificationPreferenceDto,
    );
  }

  @Get('getAcquisitionChannel/:userId')
  async getAcquisitionChannel(@Param('userId') userId: string) {
    return await this.profilesService.getAcquisitionChannel(+userId);
  }

  @Put(':userId/upload-resume')
  @ApiBody({
    schema: ProfileSwaggerSchema.uploadResumeSwaggerSchema,
    examples: ProfilesSwaggerExample.uploadResumeSwaggerExample,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadResume(
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 9000000 }),
          new FileTypeValidator({ fileType: 'pdf' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.profilesService.uploadResume(userId, file);
  }

  @Put(':userId/profile-image')
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiBody({
    schema: ProfileSwaggerSchema.uploadProfileImageSwaggerSchema,
    examples: ProfilesSwaggerExample.uploadProfileImageSwaggerExample,
  })
  @UseInterceptors(FileInterceptor('file'))
  async updateProfileImage(
    @Param('userId') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.profilesService.updateProfileImage(userId, file);
  }

  @Get(':userId/profile-image')
  @ApiParam({ name: 'userId', type: 'string' })
  async getProfileImage(@Param('userId') userId: string) {
    return await this.profilesService.getProfileImage(userId);
  }

  @Get(':userId/profile-resume')
  @ApiParam({ name: 'userId', type: 'string' })
  async getProfileResume(@Param('userId') userId: string) {
    return await this.profilesService.getProfileResume(userId);
  }

  @Delete(':userId/profile-image')
  @ApiParam({ name: 'userId', type: 'string' })
  async deleteProfileImage(@Param('userId') userId: string) {
    return await this.profilesService.deleteProfileImage(userId);
  }

  @Delete(':userId/profile-resume')
  @ApiParam({ name: 'userId', type: 'string' })
  async deleteProfileResume(@Param('userId') userId: string) {
    return await this.profilesService.deleteProfileResume(userId);
  }

  @Get('/hear-about-us')
  async getAllHearAboutUs() {
    return await this.profilesService.getAllHearAboutUs();
  }

  @Get('/current-role')
  async getAllCurrentRole() {
    return await this.profilesService.getAllCurrentRole();
  }

  @Post(':userId/hear-about-us')
  async updateUserHearAboutUs(
    @Param('userId') userId: number,
    @Body() updateHearAbtUsDto: ProfilesDtoSchema.HearAbtUsSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.hearAbtUsDtoSchema.parse(updateHearAbtUsDto);
    return await this.profilesService.updateUserHearAboutUs(
      userId,
      validatedData,
    );
  }
  @Patch(':userId/hear-about-us')
  async UserHearAboutUs(
    @Param('userId') userId: string,
    @Body() updateHearAbtUsDto: ProfilesDtoSchema.HearAbtUsSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.hearAbtUsDtoSchema.parse(updateHearAbtUsDto);
    return await this.profilesService.UserHearAboutUs(+userId, validatedData);
  }

  @Put(':userId/current-role')
  async updateUserCurrentRole(
    @Param('userId') userId: number,
    @Body() updateUserRoleDto: ProfilesDtoSchema.UpdateUserInfoRequestDto,
  ) {
    const validatedData =
      ProfilesDtoSchema.roleDtoSchema.parse(updateUserRoleDto);
    return await this.profilesService.updateUserCurrentRole(
      userId,
      validatedData,
    );
  }

  @Get('/:userId/onboarding-status')
  async getOnboardingStatus(@Param('userId') userId: string) {
    return await this.profilesService.getOnboardingStatus(userId);
  }

  @Patch('/:userId/onboarding-status')
  @ApiBody({
    schema: ProfileSwaggerSchema.updateOnboardingStatusDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.updateOnboardingStatusDtoSwaggerExample,
  })
  async updateOnboardingStatus(
    @Param('userId') userId: string,
    @Body()
    updateOnboardingStatusDto: ProfilesDtoSchema.OnboardingStatusDtoSchema,
  ) {
    const validatedData = ProfilesDtoSchema.onboardingStatusDtoSchema.parse(
      updateOnboardingStatusDto,
    );
    return await this.profilesService.updateOnboardingStatus(
      userId,
      validatedData,
    );
  }

  @Get('pincode/:pincode')
  @ApiParam({ name: 'pincode', type: 'string' })
  async getCityStateByPincode(@Param('pincode') pincode: number) {
    return await this.profilesService.getCityStateByPincode(pincode);
  }

  @Put(':userId/update-user-info')
  @ApiBody({
    schema: ProfileSwaggerSchema.updateOnboardingProfileInfoSwaggerSchema,
    examples: ProfilesSwaggerExample.updateOnboardingProfileInfoSwaggerExample,
  })
  async updateUserInfo(
    @Param('userId') userId: number,
    @Body() updateProfileDto: ProfilesDtoSchema.UpdateUserInfoRequestDto,
  ) {
    const validatedData =
      ProfilesDtoSchema.UpdateUserInfoRequestDto.parse(updateProfileDto);
    return await this.profilesService.updateUserInfo(userId, validatedData);
  }

  @Get('/facets-info')
  async getFACETSinfoOnboarding() {
    return await this.profilesService.getFACETSinfoOnboarding();
  }

  @Get('/career-issue-options')
  async getCareerIssuesOptions() {
    return await this.profilesService.getCareerIssueOptions();
  }

  @Post(':userId/user-career-issues')
  @ApiBody({
    schema: ProfileSwaggerSchema.careerIssuesDtoSwaggerSchema,
    examples: ProfilesSwaggerExample.careerIssuesDtoSwaggerExample,
  })
  async userCareerIssues(
    @Param('userId') userId: number,
    @Body() careerIssuesDto: ProfilesDtoSchema.careerIssuesDtoSchema,
  ) {
    const validatedData =
      ProfilesDtoSchema.careerIssuesDtoSchema.parse(careerIssuesDto);
    return await this.profilesService.userCareerIssues(userId, validatedData);
  }

  // @Put(':userId/push-notifications')
  // @ApiBody({
  //   schema: ProfileSwaggerSchema.pushNotificationsDtoSwaggerSchema,
  //   examples: ProfilesSwaggerExample.pushNotificationsDtoSwaggerExample,
  // })
  // async updatePushNotificationPermission(
  //   @Param('userId') userId: number,
  //   @Body() pushNotificationsDto: ProfilesDtoSchema.pushNotificationsDtoSchema,
  // ) {
  //   const validatedData =
  //     ProfilesDtoSchema.pushNotificationsDtoSchema.parse(pushNotificationsDto);
  //   return this.profilesService.pushNotificationsPermission(
  //     userId,
  //     validatedData,
  //   );
  // }

  @Get(':userId/notifications')
  async getInAppNotifications(@Param('userId') userId: number) {
    return await this.profilesService.getInAppNotifications(userId);
  }

  @Post(':userId/subscribe-push-notification')
  @ApiBody({
    schema: ProfileSwaggerSchema.pushNotificationSubscriptionDtoSwaggerSchema,
    examples:
      ProfilesSwaggerExample.pushNotificationSubscriptionDtoSwaggerExample,
  })
  async subscribePushNotification(
    @Param('userId') userId: number,
    @Body()
    pushNotificationSubscriptionDto: ProfilesDtoSchema.PushNotificationSubscriptionDto,
  ) {
    const validatedData =
      ProfilesDtoSchema.pushNotificationSubscriptionDtoSchema.parse(
        pushNotificationSubscriptionDto,
      );
    return await this.profilesService.subscribePushNotification(
      userId,
      validatedData,
    );
  }

  // @Get(':userId/send-notification')
  // async getNotification(
  //   @Param('userId') userId: string,
  // ) {
  //   return await this.profilesService.sendNotification(userId)
  // }
}
