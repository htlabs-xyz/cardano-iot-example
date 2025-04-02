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
import DeviceEntity from '../../entities/device.entity';
import { DevicesService } from './device.service';

@ApiTags('Device')
@Controller('api/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiOkResponse({ type: [DeviceEntity] })
  @Get()
  findAll(@Req() req: Request & { user: string }) {
    console.log(req.user);
    return this.devicesService.findAll();
  }

  @ApiCreatedResponse({
    description: 'created successfully',
    type: DeviceEntity,
  })
  @Get(':device_id')
  async findOne(@Param('device_id') device_id: number) {
    const device = await this.devicesService.findOne(device_id);
    if (!device)
      throw new HttpException('Device not found!', HttpStatus.NOT_FOUND);
    return device;
  }

  @ApiOperation({ summary: 'Used to be create a new device' })
  @ApiResponse({
    status: 201,
    description: 'Device created',
    type: DeviceEntity,
  })
  @Post()
  create(@Body() deviceData: DeviceEntity) {
    return this.devicesService.create(deviceData);
  }

  @Patch(':device_id')
  update(
    @Body() deviceData: DeviceEntity,
    @Param('device_id') device_id: number,
  ) {
    return this.devicesService.update(device_id, deviceData);
  }

  @Delete(':device_id')
  remove(@Param('device_id') device_id: number) {
    return this.devicesService.delete(device_id);
  }
}
