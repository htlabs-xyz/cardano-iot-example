import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('device')
export default class DeviceEntity {
  @ApiProperty({ description: 'The ID of the device', example: 'DV00111' })
  @PrimaryColumn()
  device_id: number;

  @ApiProperty({ description: 'The name of the device', example: 'Device 01' })
  @Column()
  device_name: string;

  @ApiProperty({
    description: 'The wallet_address of the device',
    example: 'Device 01',
  })
  @Column()
  wallet_address: string;

  @ApiProperty({
    description: 'The device IP address in the network',
    example: '192.168.1.1',
  })
  @Column()
  device_ip: string;

  @ApiProperty({
    description: 'Location of the device',
    example: 'Thanh Xuân, Hà Nội',
  })
  @Column()
  device_location: string;

  @ApiProperty({ description: 'Device type', example: 'Vending machine' })
  @Column()
  device_type: number;

  @ApiProperty({ description: 'Device version', example: 'v1.0' })
  @Column()
  device_version: number;

  @ApiProperty({ description: 'Device created at', example: new Date() })
  @Column()
  created_at: Date;

  @ApiProperty({ description: 'Device updated at', example: new Date() })
  updated_at: Date;
}
