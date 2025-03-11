import { ApiProperty } from "@nestjs/swagger";

export default class UserInfoModel {
    @ApiProperty({ description: 'The identity of person', example: '0013812389912' })
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