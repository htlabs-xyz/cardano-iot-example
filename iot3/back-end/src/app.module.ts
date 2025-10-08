import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import DeviceDetailsEntity from './entities/device-detail.entity';
import DeviceEntity from './entities/device.entity';
import ProductEntity from './entities/product.entity';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.env' // tuỳ chỉnh nếu cần
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const portStr = config.get<string>('DB_PORT');
        const username = config.get<string>('DB_USER');
        const password = config.get<string>('DB_PASSWORD');
        const database = config.get<string>('DB_NAME');

        if (!portStr) {
          throw new Error('DB_PORT environment variable is required');
        }
        const port = Number(portStr);
        if (Number.isNaN(port)) {
          throw new Error('DB_PORT must be a valid number');
        }

        return {
          type: 'mysql' as const,
          host,
          port,
          username,
          password,
          database,
          entities: [ProductEntity, DeviceEntity, DeviceDetailsEntity],
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([
      ProductEntity,
      DeviceDetailsEntity,
      DeviceEntity,
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
