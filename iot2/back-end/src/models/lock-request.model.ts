import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export default class LockRequestModel {
  @ApiProperty({ description: 'Unlock request', example: true })
  @IsBoolean({ message: 'Status must be true/false (unlock/lock)' })
  is_unlock: boolean;

  @ApiProperty({
    description: 'The address wallet of unlocker',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  unlocker_addr: string;

  @ApiProperty({
    description: 'Time of the measurement',
    example: new Date(),
  })
  time: Date;
}

export class LockStatusModel {
  @ApiProperty({ description: 'status of lock', example: true })
  @IsBoolean({ message: 'Status must be true/false (unlock/lock)' })
  lock_status: boolean;

  @ApiProperty({
    description: 'The address wallet of locker/unlocker',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  user_addr: string;

  @ApiProperty({
    description: 'Timestamp of the measurement',
    example: new Date(),
  })
  time: Date;

  @ApiProperty({
    description: 'transaction tracking',
    example:
      'https://preprod.cexplorer.io/tx/85936c1350cf50ab5ec69d5c30dd8d2a023cf88251a2463c3fbe6c1da871d5e1',
  })
  tx_ref: string;
}

export class SubmitTxModel {
  @ApiProperty({
    description: 'The address wallet of locker/unlocker',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  user_addr: string;

  @ApiProperty({ description: '', example: 'jdfissijsfiop239023fgw....' })
  signedTx: string;

  @ApiProperty({ description: 'data', example: '{}' })
  data: any;
}
