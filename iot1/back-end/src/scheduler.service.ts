import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppService } from './app.service';

/**
 * @description SchedulerService — manages automated cron jobs for temperature data processing.
 *
 * Responsibilities:
 * - Initialize and configure periodic cron jobs for temperature data aggregation
 * - Process cached temperature readings at regular intervals
 * - Handle error logging and recovery for scheduled tasks
 * - Manage background processing job lifecycle
 *
 * Notes:
 * - Integrates with NestJS scheduler registry for job management
 * - Uses configurable cron expressions via environment variables
 */
@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  /**
   * @constructor
   * @description Initializes a new instance of SchedulerService.
   *
   * @param {SchedulerRegistry} schedulerRegistry - NestJS scheduler registry for managing cron job lifecycle.
   * @param {AppService} appService - Provides temperature data operations and blockchain interactions.
   *
   * @example
   * const service = new SchedulerService(schedulerRegistry, appService);
   */
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private appService: AppService,
  ) {}

  /**
   * @description Initializes automated cron job for temperature data processing when the module starts.
   *
   * Details:
   * 1. Configures cron expression from environment variables (defaults to every 5 minutes)
   * 2. Creates job that processes cached temperature data via updateTemperature
   * 3. Registers and starts job with NestJS scheduler registry
   * 4. Implements error handling and logging for job failures
   *
   * @returns {void}
   */
  onModuleInit() {
    const cronExpression = process.env.CRON_EXPRESSION || '0 */5 * * * *';
    const job = new CronJob(cronExpression, async () => {
      try {
        await this.appService.updateTemperature();
      } catch (err: unknown) {
        if (err instanceof Error) {
          this.logger.error(`Cronjob error: ${err.message}`, err.stack);
        } else {
          this.logger.error(`Cronjob error: ${JSON.stringify(err)}`);
        }
      }
    });

    this.schedulerRegistry.addCronJob('main-cron-job', job);
    job.start();

    this.logger.log(
      `SchedulerService is running with expression: ${cronExpression}`,
    );
  }
}
