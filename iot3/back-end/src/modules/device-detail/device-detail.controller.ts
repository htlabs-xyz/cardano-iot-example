import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import DeviceDetailsEntity from '../../entities/device.entity';
import { DeviceDetailsService } from './device-detail.service';
import { DeviceDetailsModel } from '../../models/device-details.model';


@ApiTags('Device Details')
@Controller('api/device-details')
export class DeviceDetailsController {
    constructor(private readonly deviceDetailsService: DeviceDetailsService) { }

    @ApiOkResponse({ type: DeviceDetailsModel })
    @Get(':device_id')
    async findOne(@Param('device_id') device_id: number) {
        const device = await this.deviceDetailsService.getDetailsDevice(device_id);
        if (!device)
            throw new HttpException('Lỗi', HttpStatus.NOT_FOUND);
        return device;
    }

    @ApiOperation({ summary: 'Used to be add a new product to device' })
    @ApiResponse({
        status: 200,
        description: 'product added to device',
        type: DeviceDetailsEntity,
    })
    @Post()
    create(@Body() deviceDetailsData: DeviceDetailsEntity) {
        return this.deviceDetailsService.addProductToDevice(deviceDetailsData);
    }

    @Patch()
    update(@Body() deviceData: DeviceDetailsEntity) {
        return this.deviceDetailsService.update(deviceData);
    }

    @Delete(':device_id/:product_id')
    remove(@Param('device_id') device_id: number, @Param('product_id') product_id: number) {
        return this.deviceDetailsService.delete(device_id, product_id);
    }
}
