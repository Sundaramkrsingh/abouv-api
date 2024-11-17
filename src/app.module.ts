import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
// import { UserModule } from './user/user.module';
// import { AuthModule } from './auth/auth.module';
import { StageModule } from './stage/stage.module';
import { QaModule } from './qahistory/qahistory.module';
import { SkillsModule } from './skills/skills.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './shared/utils/response.interceptor';
import { UserListModule } from './user-list/user-list.module';
import { FeedBackModule } from './feed-back/feed-back.module';
import { QuestionModule } from './question/question.module';
import { S3Module } from './s3/s3.module';
import { AuthModule } from './auth/auth.module';
import { WinstonModule } from 'nest-winston';

import { CoreModule } from './core/core.module';
import { InqModule } from './core/inq/inq.module';
import { PreqModule } from './core/preq/preq.module';
import { FacetsReportsModule } from './facets-reports/facets-reports.module';
import { HomeModule } from './home/home.module';
import { StatsModule } from './stats/stats.module';
import { loggerConfig } from './shared/logger/logger.config';
import { CoreV2Module } from './core_v2/core_v2.module';
import { TestsModule } from './tests/tests.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsageFeedbackModule } from './usage-feedback/usage-feedback.module';

import { MixpanelModule } from './mixpanel/mixpanel.module';

@Module({
  imports: [
    PrismaModule,
    // AuthModule,
    ProfilesModule,
    // UserModule,
    StageModule,
    QaModule,
    SkillsModule,
    UserListModule,
    FeedBackModule,
    QuestionModule,
    S3Module,
    AuthModule,
    InqModule,
    PreqModule,
    CoreModule,
    InqModule,
    PreqModule,
    CoreModule,
    FacetsReportsModule,
    HomeModule,
    StatsModule,
    WinstonModule.forRoot(loggerConfig),
    CoreV2Module,
    TestsModule,
    MixpanelModule,
    EventEmitterModule.forRoot(),
    UsageFeedbackModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
