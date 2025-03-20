import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { TemperatureRequestModel } from './models/temperature.model';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseModel } from './common/response.interceptor';

@ApiTags('Temperature')
@Controller('api/temperature-sensor')
export class AppController {
  constructor(private readonly appService: AppService) { }
  @ApiOperation({ summary: 'Used to get all devices' })
  @ApiResponse({
    status: 200,
    description: 'Devices received',
    type: ApiResponseModel<string>,
  })
  @Get('test')
  getAllTempTest() {
    return this.appService.getListDeviceInfo();
  }

  @ApiOperation({ summary: 'Used to get all devices' })
  @ApiResponse({
    status: 200,
    description: 'Devices received',
    type: ApiResponseModel<string>,
  })
  @Get('devices')
  getListDeviceInfo() {
    return this.appService.getListDeviceInfo();
  }

  @ApiOperation({ summary: 'Used to get all temperature' })
  @ApiResponse({
    status: 200,
    description: 'Temperature received',
    type: ApiResponseModel<string>,
  })
  @Get(':device_address')
  getAllTemperature(@Param('device_address') device_address: string) {
    return this.appService.getAllTemperature(device_address);
  }

  @ApiOperation({ summary: 'Used to get base temperature' })
  @ApiResponse({
    status: 200,
    description: 'Temperature received',
    type: ApiResponseModel<string>,
  })
  @Get('base')
  getBaseTemperature() {
    return this.appService.getBaseTemperature();
  }

  @ApiOperation({ summary: 'Used to be submit a new temperature' })
  @ApiResponse({
    status: 201,
    description: 'Temperature received',
    type: ApiResponseModel<string>,
  })
  @Post()
  submitTemperature(@Body() temperatureModel: TemperatureRequestModel) {
    return this.appService.submitTemperature(temperatureModel);
  }

  // @ApiOperation({ summary: 'Used to be update base temperature' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Base template updated',
  //   type: ApiResponseModel<string>,
  // })
  // @Put()
  // updateBaseTemperature(@Body() temperatureModel: TemperatureRequestModel) {
  //   return this.appService.updateBaseTemperature(temperatureModel);
  // }


}
