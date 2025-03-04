import { ApiProperty } from '@nestjs/swagger';
import LockDeviceModel from './lock-device.model';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';


export default class LockRequestModel {
  @ApiProperty({ description: 'Device information' })
  device_info: LockDeviceModel;

  @ApiProperty({ description: 'Unlock request', example: true })
  @IsBoolean({ message: 'Status must be true/false (unlock/lock)' })
  is_unlock: boolean;

  @ApiProperty({ description: 'The address wallet of unlocker', example: 'addr_test1qptfdrrl....' })
  unlocker_addr: string;

  @ApiProperty({
    description: 'Timestamp of the measurement',
    example: new Date(),
  })
  timestamp: Date;
}
