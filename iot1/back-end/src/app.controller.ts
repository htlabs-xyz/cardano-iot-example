import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseModel } from './common/response.interceptor';
import { TemperatureRequestModel } from './models/temperature.model';

/**
 * @description AppController — REST API gateway for IoT temperature sensor operations.
 *
 * Responsibilities:
 * - Expose HTTP endpoints for temperature data retrieval and submission
 * - Handle request/response validation and transformation
 * - Integrate with Swagger documentation for API testing
 * - Delegate business logic to AppService layer
 *
 * Notes:
 * - Uses NestJS decorators for routing and API documentation
 * - All endpoints return standardized ApiResponseModel format
 */
@ApiTags('Temperature')
@Controller('api/temperature-sensor')
export class AppController {
  /**
   * @constructor
   * @description Initializes a new instance of AppController.
   *
   * @param {AppService} appService - Provides business logic for temperature data operations and blockchain interactions.
   *
   * @example
   * const controller = new AppController(appService);
   */
  constructor(private readonly appService: AppService) {}

  /**
   * @description Retrieves all historical temperature readings from Cardano blockchain for the configured sensor.
   *
   * Details:
   * 1. Queries blockchain for temperature data transactions
   * 2. Returns structured data with timestamps and transaction references
   * 3. Includes temperature, humidity, and blockchain metadata
   *
   * @returns {Promise<TemperatureResponseModel[]>} Array of temperature readings with blockchain metadata.
   */
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

  /**
   * @description Submits new temperature reading from IoT device to system cache for batch processing.
   *
   * Details:
   * 1. Accepts temperature and humidity data with device metadata
   * 2. Stores data in memory cache for periodic blockchain persistence
   * 3. Returns confirmation of successful cache submission
   *
   * @param {TemperatureRequestModel} temperatureModel - Contains device ID, timestamp, temperature, and humidity values.
   * @returns {Promise<string>} Confirmation message indicating successful submission to cache.
   */
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
