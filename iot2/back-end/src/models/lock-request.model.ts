import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export enum AccessRole {
  NEW_USER = -1,
  OWNER = 0,
  AUTHORITY = 1,
  UNKNOWN = 2,
}

export enum LockStatus {
  NEW_LOCK = -1,
  CLOSE = 0,
  OPEN = 1,
}

export const parseLockStatus = (status: number): LockStatus => {
  switch (status) {
    case -1:
      return LockStatus.NEW_LOCK;
    case 0:
      return LockStatus.CLOSE;
    case 1:
      return LockStatus.OPEN;
    default:
      return LockStatus.CLOSE;
  }
};

export class LoginResponseModel {
  access_role: AccessRole;
  lock_status?: LockStatus;
}
export class LoginRequestModel {
  @ApiProperty({ example: AccessRole.OWNER })
  access_role: AccessRole;

  @ApiProperty({
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  user_addr: string;

  @ApiProperty({
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  owner_addr: string;

  @ApiProperty({ example: 'The Lock' })
  lock_name: string;
}

export class RegisterNewLockRequestModel {
  @ApiProperty({
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  owner_addr: string;

  @ApiProperty({ example: 'The Lock 2' })
  lock_name: string;
}

export class RegisterNewLockResponseModel {
  new_user_unsigned_tx?: string;
}

export default class LockRequestModel {
  @ApiProperty({ description: 'Unlock request', example: true })
  @IsBoolean({ message: 'Status must be true/false (unlock/lock)' })
  is_unlock: boolean;

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

export class LockStatusModel {
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

export class LockInfoRequestModel {
  @ApiProperty({
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  owner_addr: string;

  @ApiProperty({ example: 'The Lock' })
  lock_name: string;
}
