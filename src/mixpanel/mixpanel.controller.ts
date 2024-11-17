import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MixpanelService } from './mixpanel.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import * as MixpanelDtoSchema from './mixpanel.dto';
import * as MixpanelSwaggerSchema from './mixpanel.swagger.schema';
import * as MixpanelSwaggerExample from './mixpanel.swagger.example';
import { LoggerService } from 'src/shared/logger/logger.service';

@ApiTags('mixpanel')
@Controller('mixpanel')
export class MixpanelController {
  constructor(
    private readonly mixpanelService: MixpanelService,
    private readonly logger: LoggerService,
  ) {}
  @Post('/track')
  @ApiBody({
    schema: MixpanelSwaggerSchema.trackDtoSwaggerSchema,
    examples: MixpanelSwaggerExample.trackDtoSwaggerExample,
  })
  async track(@Body() trackDtoSchema: MixpanelDtoSchema.TrackDtoSchema) {
    const validatedData =
      MixpanelDtoSchema.trackDtoSchema.safeParse(trackDtoSchema);

    if (validatedData.success) {
      try {
        await this.mixpanelService.track(validatedData.data);

        this.logger.logInfo(
          '[PWA-API][MixpanelController -> track] - success',
          {
            data: validatedData.data,
          },
        );

        return 'Mixpanel event(s) sent successfully!';
      } catch (error) {
        this.logger.logError('[PWA-API][MixpanelService -> track] - error', {
          status: error?.status,
          error,
        });
        throw error;
      }
    } else {
      this.logger.logError('[PWA-API][MixpanelService -> track] - error', {
        error: validatedData.error.errors,
      });
      throw new BadRequestException(validatedData.error.errors);
    }
  }
}
