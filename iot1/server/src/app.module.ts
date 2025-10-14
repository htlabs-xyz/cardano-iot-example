import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { CacheModule } from '@nestjs/cache-manager';
import { MemoryCacheService } from './memoryCache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, SchedulerService, MemoryCacheService],
})
export class AppModule {}
