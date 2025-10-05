import { ApiProperty } from '@nestjs/swagger';
import { LockStatus } from './lock.model';

export enum AccessRole {
  NEW_USER = -1,
  OWNER = 0,
  AUTHORITY = 1,
  UNKNOWN = 2,
}

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
