/* eslint-disable prettier/prettier */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Request } from 'express';

@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getUserHomeData(@Req() req: Request) {
    return await this.homeService.getHomeData(req as Request);
  }

  @Get('/quote')
  async getDailyQuote() {
    return await this.homeService.getCurrentQuote();
  }
}
