/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  Param,
  Res,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SingInDto,
  SingUpDto,
  LoginDto,
  loginDto,
  // RequestDTO,
  // RequestPasswordResetDto,
  passwordDto,
  GoogleSigninDtoSchema,
  googleSigninDtoSchema,
  loginEmailDto,
  LoginEmailDtoSchema,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt.guard';
import { Response } from 'express';

import { ApiHeader } from '@nestjs/swagger';
import { ApiBody } from '@nestjs/swagger';
import * as AuthSwaggerSchema from './auth.swagger.schema';
import * as AuthSwaggerExample from './auth.swagger.example';

import { loginDataSwaggerSchema } from './auth.swagger.schema';
import { loginSwaggerExample } from './auth.swagger.example';
import { checkTestUser } from 'src/shared/utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  @ApiBody({
    schema: AuthSwaggerSchema.signUpDtoSwaggerSchema,
    examples: AuthSwaggerExample.signUpDtoSwaggerExample,
  })
  async signUp(
    @Headers() headers: Record<string, string>,
    @Body() userInfo: typeof SingUpDto,
  ) {
    try {
      SingUpDto.parse(userInfo);
      return await this.authService.signUp(userInfo);
    } catch (error) {
      throw error;
    }
  }

  @Post('/sign-up-temp')
  async tempSignUp(
    @Headers() headers: Record<string, string>,
    @Body() userInfo: typeof SingUpDto,
  ) {
    try {
      SingUpDto.parse(userInfo);
      return await this.authService.tempSignUp(userInfo);
    } catch (error) {
      throw error;
    }
  }

  @Post('/sign-in')
  @ApiBody({
    schema: AuthSwaggerSchema.signInDtoSwaggerSchema,
    examples: AuthSwaggerExample.signInDtoSwaggerExample,
  })
  async singIn(
    @Body() userInfo: typeof SingInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      SingInDto.parse(userInfo);
      const res = await this.authService.signIn(userInfo);
      if (res) {
        response.header('x-access-token', res?.token);
        response.header('x-refresh-token', res?.refreshToken);
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  @Post('email-signin')
  @ApiBody({
    schema: AuthSwaggerSchema.loginEmailDtoSwaggerSchema,
    examples: AuthSwaggerExample.loginEmailDtoSwaggerExample,
  })
  async loginEmail(@Body() loginUserDto: LoginEmailDtoSchema) {
    try {
      const parsedData = loginEmailDto.parse(loginUserDto);
      return await this.authService.loginEmail(parsedData);
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @ApiBody({
    examples: loginSwaggerExample,
    schema: loginDataSwaggerSchema,
  })
  async loginUser(@Body() loginUserDto: LoginDto) {
    try {
      const parsedData = checkTestUser(loginUserDto?.email)
        ? loginUserDto
        : loginDto.parse(loginUserDto);
      return await this.authService.loginUser(parsedData);
    } catch (error) {
      throw error;
    }
  }

  @Get('/:userId/refresh-token')
  async generateTokenByRefreshToken(
    @Headers() headers: Headers,
    @Param('userId') userId: number,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const res = await this.authService.generateTokenByRefreshToken(
        headers,
        userId,
      );
      if (res) {
        response.header('x-access-token', res?.token);
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  @Post('/sign-out')
  @UseGuards(JwtAuthGuard)
  async singOut(@Headers() header: Headers) {
    try {
      return await this.authService.signOut(header);
    } catch (error) {
      throw error;
    }
  }

  @Post('/send-otp')
  @ApiBody({
    schema: AuthSwaggerSchema.sendOTPDtoSwaggerSchema,
    examples: AuthSwaggerExample.sendOTPDtoSwaggerExample,
  })
  async generateOtp(
    @Headers() headers: Record<string, string>,
    @Body() userInfo: typeof SingUpDto,
  ) {
    try {
      SingUpDto.parse(userInfo);
      return await this.authService.generateOtp(userInfo);
    } catch (error) {
      throw error;
    }
  }

  @Post('/reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiHeader({ name: 'Authorization' })
  @ApiBody({
    schema: AuthSwaggerSchema.passwordResetSwaggerSchema,
    examples: AuthSwaggerExample.passwordResetDtoSwaggerExample,
  })
  async resetPassword(@Request() req, @Body() passwordResetDTO: passwordDto) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.resetPassword(token, passwordResetDTO);
  }

  // @Post('/request-reset-password')
  // @ApiBody({
  //   schema: AuthSwaggerSchema.resetRequestDtoSwaggerSchema,
  //   examples: AuthSwaggerExample.resetRequestDtoSwaggerExample,
  // })
  // async requestResetPassword(@Body() userInfo: RequestDTO) {
  //   try {
  //     const parsedData = RequestPasswordResetDto.parse(userInfo);
  //     return await this.authService.requestPasswordReset(parsedData);
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  @Post('/:userId/first-time-user')
  async updateFirstTimeUser(@Param('userId') userId: string) {
    try {
      return await this.authService.updateFirstTimeUser(userId);
    } catch (error) {
      throw error;
    }
  }

  @Get('/:userId/first-time-user')
  async findFirstUser(@Param('userId') userId: string) {
    try {
      return await this.authService.findFirstUser(userId);
    } catch (error) {
      throw error;
    }
  }

  @Post('/:userId/google-signup')
  @ApiBody({
    schema: AuthSwaggerSchema.googleSigninDtoSwaggerSchema,
    examples: AuthSwaggerExample.googleSigninDtoSwaggerExample,
  })
  async googleSignup(
    @Param('userId') userId: number,
    @Body() googleSigninDto: GoogleSigninDtoSchema,
  ) {
    const validatedData = googleSigninDtoSchema.parse(googleSigninDto);
    return await this.authService.googleSignup(+userId, validatedData);
  }

  @Post('/google-login')
  @ApiBody({
    schema: AuthSwaggerSchema.googleSigninDtoSwaggerSchema,
    examples: AuthSwaggerExample.googleSigninDtoSwaggerExample,
  })
  async googleLogin(@Body() googleSigninDto: GoogleSigninDtoSchema) {
    const validatedData = googleSigninDtoSchema.parse(googleSigninDto);
    return await this.authService.googleLogin(validatedData);
  }
}
