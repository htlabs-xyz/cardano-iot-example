import { ApiProperty } from '@nestjs/swagger';
import DeviceModel from './device.model';

export default class VendingDeviceModel extends DeviceModel {
  @ApiProperty({ description: 'Max product quantity', example: 96 })
  device_max_quantity: number;

  @ApiProperty({ description: 'Max row of machine', example: 10 })
  device_max_rows: number;

  @ApiProperty({ description: 'Max columns of machine', example: 10 })
  device_max_columns: number;

  @ApiProperty({ description: 'Device wallet address', example: 'addr_test1qptfdrrl....' })
  device_wallet_addr: number;
}
