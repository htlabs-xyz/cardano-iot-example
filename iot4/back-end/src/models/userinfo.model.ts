import { ApiProperty } from '@nestjs/swagger';

export class UserInfoRequestModel {
  @ApiProperty({
    description: 'The identity of person',
    example: '0013812389912',
  })
  user_id: string;

  @ApiProperty({ description: 'The name of person', example: 'Peter Pan JM' })
  user_fullname: string;

  @ApiProperty({ description: 'The date of birth', example: new Date() })
  user_birthday: Date;

  @ApiProperty({ description: 'The gender of person', example: 'male' })
  user_gender: string;

  @ApiProperty({ description: 'The country of person', example: 'Viet Nam' })
  user_country: string;
}

export class UserVerifyRequestModel {
  @ApiProperty({
    description: 'The identity of person',
    example: '0013812389912',
  })
  user_id: string;

  @ApiProperty({ description: 'The name of person', example: 'Peter Pan JM' })
  user_fullname: string;
}

export class UserVerifyResponseModel {
  @ApiProperty({
    description: 'The result of validation user',
    example: true,
  })
  is_valid: boolean;
}
