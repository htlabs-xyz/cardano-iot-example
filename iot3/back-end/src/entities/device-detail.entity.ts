import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('device_detail')
export default class DeviceDetailsEntity {
  @ApiProperty({ description: 'The id of the device', example: 'DV01' })
  @PrimaryColumn()
  device_id: number;

  @ApiProperty({ description: 'The id of the product', example: '1' })
  @PrimaryColumn()
  product_id: number;

  @ApiProperty({ description: 'The quantity of the product', example: '5' })
  @Column()
  product_quantity: number;

  @ApiProperty({ description: 'Product row number', example: 3 })
  @Column()
  row: number;

  @ApiProperty({ description: 'Product colums number', example: 4 })
  @Column()
  column: number;

  @ApiProperty({ description: 'Device created at', example: new Date() })
  @Column()
  created_at: Date;

  @ApiProperty({ description: 'Device updated at', example: new Date() })
  @Column()
  updated_at: Date;
}
