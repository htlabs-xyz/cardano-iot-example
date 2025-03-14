import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import TemperatureModel from './models/temperature.model';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseModel } from './common/response.interceptor';

@ApiTags('Temperature')
@Controller('api/temperature-sensor')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({ summary: 'Used to be submit a new temperature' })
  @ApiResponse({
    status: 201,
    description: 'Temperature received',
    type: ApiResponseModel<string>,
  })
  @Post()
  submitTemperature(@Body() temperatureModel: TemperatureModel) {
    return this.appService.submitTemperature(temperatureModel);
  }
}
