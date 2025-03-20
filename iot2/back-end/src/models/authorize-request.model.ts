import { ApiProperty } from '@nestjs/swagger';
import LockDeviceModel from './lock-device.model';
import { IsBoolean, IsEnum, IsNumber } from 'class-validator';

export default class AuthorizeRequestModel {
    @ApiProperty({ description: 'Device information' })
    device_info: LockDeviceModel;

    @ApiProperty({ description: 'The address wallet of authorizer', example: 'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh' })
    authorizer_addr: string;

    @ApiProperty({ description: 'The address wallet of licensee', example: 'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh' })
    licensee_addr: string;

    @ApiProperty({
        description: 'Timestamp of the measurement',
        example: new Date(),
    })
    timestamp: Date;
}