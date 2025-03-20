import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import DeviceEntity from '../../entities/device.entity';
import { DeviceDetailsService } from './device-detail.service';
import { DeviceDetailsController } from './device-detail.controller';
import DeviceDetailsEntity from '../../entities/device-detail.entity';
import ProductEntity from '../../entities/product.entity';

@Module({
    controllers: [DeviceDetailsController],
    providers: [DeviceDetailsService],
    imports: [TypeOrmModule.forFeature([DeviceDetailsEntity, ProductEntity, DeviceEntity]),
    ConfigModule.forRoot()],
})
export class DeviceDetailsModule { }
