import { ApiProperty } from '@nestjs/swagger';
import LockDeviceModel from './lock-device.model';
import { IsBoolean, IsEnum, IsNumber } from 'class-validator';

export default class AuthorizeRequestModel {
    @ApiProperty({ description: 'Device information' })
    device_info: LockDeviceModel;

    @ApiProperty({ description: 'The address wallet of authorizer', example: 'addr_test1qptfdrrl....' })
    authorizer_addr: string;

    @ApiProperty({ description: 'The address wallet of licensee', example: 'addr_test1qptfdrrl....' })
    licensee_addr: string;

    @ApiProperty({
        description: 'Timestamp of the measurement',
        example: new Date(),
    })
    timestamp: Date;
}