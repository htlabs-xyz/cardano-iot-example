import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppService } from './app.service';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private appService: AppService,
  ) {}

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
