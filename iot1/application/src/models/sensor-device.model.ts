import { ApiProperty } from '@nestjs/swagger';
import DeviceModel from './device.model';

export default class SensorDeviceModel extends DeviceModel {
  @ApiProperty({ description: 'Sensor threshold', example: 30 })
  device_threshold: number;

  @ApiProperty({ description: 'Battery level', example: 96 })
  device_battery: number;

  @ApiProperty({ description: 'Sampling frequency (realtime=0)', example: '0' })
  device_sampling_rate: number;
}
