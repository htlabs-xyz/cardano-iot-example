import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export enum LockStatus {
  NEW_LOCK = -1,
  OPEN = 0,
  CLOSE = 1,
}

export const parseLockStatus = (status: number): LockStatus => {
  switch (status) {
    case -1:
      return LockStatus.NEW_LOCK;
    case 1:
      return LockStatus.CLOSE;
    case 0:
      return LockStatus.OPEN;
    default:
      return LockStatus.CLOSE;
  }
};

export class LockRequestModel {
  @ApiProperty({ description: 'Unlock request', example: LockStatus.CLOSE })
  lock_status: LockStatus;

  @ApiProperty({ example: 'The Lock' })
  lock_name: string;

  @ApiProperty({
    description: 'The address wallet of unlocker',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  unlocker_addr: string;

  @ApiProperty({
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  owner_addr: string;

  @ApiProperty({
    description: 'Time of the measurement',
    example: new Date(),
  })
  time: Date;
}

export class AuthorizeRequestModel {
  @ApiProperty({
    description: 'Check if remove or add authorizor',
    example: false,
  })
  is_remove_authorize: boolean;

  @ApiProperty({ example: 'The Lock' })
  lock_name: string;

  @ApiProperty({
    description: 'The address wallet of owner',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  owner_addr: string;

  @ApiProperty({
    description: 'The address wallet of owner',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  licensee_addr: string;

  @ApiProperty({
    description: 'Timestamp of the measurement',
    example: new Date(),
  })
  time: Date;
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

export class LockStatusResponseModel {
  @ApiProperty({ description: 'status of lock', example: LockStatus.CLOSE })
  @IsBoolean({ message: 'Status must be true/false (unlock/lock)' })
  lock_status: LockStatus;

  @ApiProperty({
    description: 'The address wallet of locker/unlocker',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  user_addr?: string;

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

export class LockInfoRequestModel {
  @ApiProperty({
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  owner_addr: string;

  @ApiProperty({ example: 'The Lock' })
  lock_name: string;
}
