import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import DeviceEntity from '../../entities/device.entity';
import { DevicesService } from './device.service';
import { DevicesController } from './device.controller';

@Module({
    controllers: [DevicesController],
    providers: [DevicesService],
    imports: [TypeOrmModule.forFeature([DeviceEntity]), ConfigModule.forRoot()],
})
export class DevicesModule { }
