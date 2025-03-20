import { ApiProperty } from '@nestjs/swagger';

export default class DeviceModel {
  @ApiProperty({ description: 'The ID of the device', example: 'DV00111' })
  protected device_id: string;

  @ApiProperty({ description: 'The name of the device', example: 'Device 01' })
  protected device_name: string;

  @ApiProperty({
    description: 'The device IP address in the network',
    example: '192.168.1.1',
  })
  protected device_ip: string;

  @ApiProperty({
    description: 'Location of the device',
    example: 'Thanh Xuân, Hà Nội',
  })
  protected device_location: string;

  @ApiProperty({ description: 'Device type', example: 'Electric Locker device' })
  protected device_type: number;

  @ApiProperty({ description: 'Device version', example: 'v1.0' })
  protected device_version: number;
}
