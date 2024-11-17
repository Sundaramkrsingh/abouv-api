import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import * as userValidation from './user.validation';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    const onboardingSlug = 'SignUp';

    createUserDto.onboardingSlug = onboardingSlug;

    const validatedData = userValidation.userValidation.parse(createUserDto);

    return this.userService.create(validatedData);
  }

  @Post(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    const validatedData = userValidation.userValidation.parse(updateUserDto);

    return this.userService.update(+id, validatedData);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }
}
