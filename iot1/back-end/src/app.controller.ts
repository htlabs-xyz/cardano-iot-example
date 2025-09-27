import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseModel } from './common/response.interceptor';
import { TemperatureRequestModel } from './models/temperature.model';

@ApiTags('Temperature')
@Controller('api/temperature-sensor')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Used to get all temperature' })
  @ApiResponse({
    status: 200,
    description: 'Temperature received',
    type: ApiResponseModel<string>,
  })
  @Get()
  getAllTemperature() {
    return this.appService.getAllTemperature();
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
}
