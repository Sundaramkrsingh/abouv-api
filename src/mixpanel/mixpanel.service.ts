import { Injectable } from '@nestjs/common';
import { mixpanelClient } from './mixpanel.config';
import { LoggerService } from 'src/shared/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MixpanelService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async setPeople(properties: Record<string, any>) {
    const { distinct_id, ip, $device_id, $device, $os, $browser } = properties;

    const { phoneNumber } = await this.prismaService.user.findUnique({
      where: { id: distinct_id },
    });

    const profile = await this.prismaService.profile.findUnique({
      where: { userId: distinct_id },
    });

    const { email, fullName, firstName, lastName, gender } = profile || {};

    await mixpanelClient.people.set(
      distinct_id.toString(),
      {
        $email: email,
        $name: fullName,
        $first_name: firstName,
        $last_name: lastName,
        $gender: gender,
        $phone: phoneNumber,
        $device_id,
        $device,
        $os,
        $browser,
        $created: new Date().toISOString(),
      },
      {
        $ip: ip,
      },
    );
  }

  async track(data) {
    try {
      // track
      await mixpanelClient.track_batch(data);

      // set people
      const { properties } = data[0];

      if (!properties?.isAnonymousUser) {
        await this.setPeople(properties);
      }
    } catch (error) {
      this.logger.logError('[PWA-API][MixpanelService -> track] - error', {
        status: error?.status,
        error,
      });
      throw error;
    }
  }
}
