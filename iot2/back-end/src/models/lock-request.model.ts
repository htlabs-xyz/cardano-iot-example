import { ApiProperty } from '@nestjs/swagger';
import LockDeviceModel from './lock-device.model';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';


export default class LockRequestModel {
  @ApiProperty({ description: 'Unlock request', example: true })
  @IsBoolean({ message: 'Status must be true/false (unlock/lock)' })
  is_unlock: boolean;

  @ApiProperty({ description: 'The address wallet of unlocker', example: 'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh' })
  unlocker_addr: string;

  @ApiProperty({
    description: 'Timestamp of the measurement',
    example: new Date(),
  })
  timestamp: Date;
}
