import { ApiProperty } from '@nestjs/swagger';
import DeviceModel from './device.model';

export default class SensorDeviceModel extends DeviceModel {
  @ApiProperty({
    description: 'The address of device',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  device_address: string;

  @ApiProperty({ description: 'Sensor threshold', example: 30 })
  device_threshold: number;

  @ApiProperty({ description: 'Battery level', example: 96 })
  device_battery: number;

  @ApiProperty({ description: 'Sampling frequency (realtime=0)', example: '0' })
  device_sampling_rate: number;
}
