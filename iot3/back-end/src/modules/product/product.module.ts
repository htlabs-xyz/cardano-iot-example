import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import DeviceDetailsEntity from '../../entities/device-detail.entity';
import DeviceEntity from '../../entities/device.entity';
import ProductEntity from '../../entities/product.entity';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      DeviceDetailsEntity,
      DeviceEntity,
    ]),
    ConfigModule.forRoot(),
  ],
})
export class ProductsModule {}
