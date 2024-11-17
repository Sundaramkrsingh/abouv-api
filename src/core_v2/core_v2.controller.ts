import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('core-v2')
@Controller('v2/core')
export class CoreV2Controller {}
