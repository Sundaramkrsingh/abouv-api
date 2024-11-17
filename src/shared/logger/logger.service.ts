import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private getCallerInfo(): string {
    const oldStackTraceLimit = Error.stackTraceLimit;
    Error.stackTraceLimit = 15; // Increase the stack trace limit if needed
    const obj: { stack?: string } = {};
    Error.captureStackTrace(obj, this.getCallerInfo);
    const stack = obj.stack.split('\n');
    Error.stackTraceLimit = oldStackTraceLimit;

    // Find the actual caller's stack frame
    let callerFrame;
    for (let i = 2; i < stack.length; i++) {
      if (!stack[i].includes('node_modules')) {
        callerFrame = stack[i];
        break;
      }
    }

    // Extract relevant information (file path and line number)
    if (callerFrame) {
      const match = callerFrame.match(/\((.*):(\d+):(\d+)\)/);
      if (match) {
        return `${match[1]}:${match[2]}`;
      } else {
        return callerFrame.trim();
      }
    } else {
      return 'unknown';
    }
  }

  logInfo(message: string, data: Record<string, unknown> = {}) {
    const callerInfo = this.getCallerInfo();
    this.logger.info(message, { ...data, caller: callerInfo });
  }

  logError(message: string, data: Record<string, unknown> = {}) {
    const callerInfo = this.getCallerInfo();
    this.logger.error(message, { ...data, caller: callerInfo });
  }

  logDebug(message: string, data: Record<string, unknown> = {}) {
    const callerInfo = this.getCallerInfo();
    this.logger.debug(message, { ...data, caller: callerInfo });
  }

  logWarn(message: string, data: Record<string, unknown> = {}) {
    const callerInfo = this.getCallerInfo();
    this.logger.warn(message, { ...data, caller: callerInfo });
  }
}
