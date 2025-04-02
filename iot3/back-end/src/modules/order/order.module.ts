import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppGateway } from '../../app.gateway';
import DeviceDetailsEntity from '../../entities/device-detail.entity';
import DeviceEntity from '../../entities/device.entity';
import ProductEntity from '../../entities/product.entity';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, AppGateway],
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      DeviceDetailsEntity,
      DeviceEntity,
    ]),
    ConfigModule.forRoot(),
  ],
})
export class OrderModule {}
