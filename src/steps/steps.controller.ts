import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

type HealthCheckResult = Record<string, unknown> | string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasHealthCheck(
  obj: unknown,
): obj is { healthCheck: () => Promise<HealthCheckResult> } {
  return isRecord(obj) && typeof obj['healthCheck'] === 'function';
}

function hasFindAll(obj: unknown): obj is { findAll: () => Promise<unknown> } {
  return isRecord(obj) && typeof obj['findAll'] === 'function';
}

@Controller('steps')
export class StepsController {
  private readonly logger = new Logger(StepsController.name);

  constructor(private readonly stepsService: StepsService) {}

  private formatError(err: unknown): string {
    if (err instanceof Error) return err.stack ?? err.message;
    try {
      return typeof err === 'string' ? err : JSON.stringify(err);
    } catch {
      return String(err);
    }
  }

  @Get()
  async findAll() {
    this.logger.log('GET /steps - findAll');
    try {
      const res = await this.stepsService.findAll();
      this.logger.debug(
        `findAll result count=${Array.isArray(res) ? res.length : 'n/a'}`,
      );
      return res;
    } catch (err: unknown) {
      const details = this.formatError(err);
      this.logger.error('findAll failed', details);
      throw err;
    }
  }

  @Post()
  async create(@Body() createStepDto: CreateStepDto) {
    this.logger.log(
      `POST /steps - create payload=${JSON.stringify(createStepDto)}`,
    );
    try {
      const res = await this.stepsService.create(createStepDto);
      const createdId =
        isRecord(res) && 'id' in res
          ? String((res as Record<string, unknown>).id)
          : 'n/a';
      this.logger.log(`create succeeded id=${createdId}`);
      return res;
    } catch (err: unknown) {
      const details = this.formatError(err);
      this.logger.error('create failed', details);
      throw err;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`GET /steps/${id} - findOne`);
    try {
      const res = await this.stepsService.findOne(id);
      if (!res) this.logger.warn(`findOne not found id=${id}`);
      return res;
    } catch (err: unknown) {
      const details = this.formatError(err);
      this.logger.error(`findOne failed id=${id}`, details);
      throw err;
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStepDto: UpdateStepDto) {
    this.logger.log(
      `PUT /steps/${id} - update payload=${JSON.stringify(updateStepDto)}`,
    );
    try {
      const res = await this.stepsService.update(id, updateStepDto);
      this.logger.log(`update succeeded id=${id}`);
      return res;
    } catch (err: unknown) {
      const details = this.formatError(err);
      this.logger.error(`update failed id=${id}`, details);
      throw err;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`DELETE /steps/${id} - remove`);
    try {
      const res = await this.stepsService.remove(id);
      this.logger.log(`remove succeeded id=${id}`);
      return res;
    } catch (err: unknown) {
      const details = this.formatError(err);
      this.logger.error(`remove failed id=${id}`, details);
      throw err;
    }
  }

  @Get('health/live')
  liveness() {
    this.logger.log('GET /steps/health/live - liveness check');
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/ready')
  async readiness() {
    this.logger.log('GET /steps/health/ready - readiness check');
    const svc: unknown = this.stepsService;

    if (hasHealthCheck(svc)) {
      try {
        const checks = await svc.healthCheck();
        this.logger.log('service healthCheck succeeded');
        return { status: 'ok', checks, timestamp: new Date().toISOString() };
      } catch (err: unknown) {
        const details =
          err instanceof Error ? err.message : this.formatError(err);
        this.logger.error('service healthCheck failed', details);
        throw new HttpException(
          { status: 'error', message: 'dependency failure', details },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    if (hasFindAll(svc)) {
      try {
        await Promise.resolve(svc.findAll());
        this.logger.log('readiness fallback (findAll) succeeded');
        return { status: 'ok', timestamp: new Date().toISOString() };
      } catch (err: unknown) {
        const details =
          err instanceof Error ? err.message : this.formatError(err);
        this.logger.error('readiness fallback failed', details);
        throw new HttpException(
          { status: 'error', message: 'dependency failure', details },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }

    this.logger.log('readiness default ok');
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
