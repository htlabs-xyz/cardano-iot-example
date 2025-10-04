import { ApiProperty } from '@nestjs/swagger';

export default class AuthorizeRequestModel {
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
