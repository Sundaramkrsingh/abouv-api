import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new BadRequestException({
        validationErrors: errorMessages,
      });
    }
    return result.data;
  }
}
