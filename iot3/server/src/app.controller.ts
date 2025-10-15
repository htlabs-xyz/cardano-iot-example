import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseModel } from './common/response.interceptor';
import { ProductOrderModel } from './models/payment.model';
import DeviceEntity from './entities/device.entity';

/**
 * @description AppController — REST API controller for IoT vending machine operations and data management.
 *
 * Responsibilities:
 * - Handles HTTP requests for device and product management
 * - Provides endpoints for order processing and payment validation
 * - Manages data seeding operations for development/testing
 * - Implements RESTful API patterns with proper error handling
 *
 * Notes:
 * - Uses NestJS decorators for routing and Swagger documentation
 * - Integrates with AppService for business logic execution
 * - Implements standardized API response formats
 */
@ApiTags('IOT3 - The API for IOT3 project')
@Controller('api')
export class AppController {
  /**
   * @constructor
   * @description Initializes a new instance of AppController with the required service dependency.
   *
   * @param {AppService} appService - Service layer for business logic and data operations.
   *
   * @example
   * // Automatically injected by NestJS dependency injection
   * const controller = new AppController(appService);
   */
  constructor(private readonly appService: AppService) {}

  /**
   * @description Initializes the database with seed data for development and testing purposes.
   *
   * Details:
   * 1. Clears existing database records
   * 2. Populates tables with predefined device, product, and inventory data
   * 3. Returns success confirmation when complete
   *
   * @returns {Promise<string>} Returns 'OK' when seeding operation completes successfully.
   *
   * @example
   * POST /api/seeding-data
   * Response: "OK"
   */
  @ApiOperation({ summary: 'Used to seeding data tyo db if not exist' })
  @ApiResponse({
    status: 201,
    description: 'Seeding data success!',
    type: ApiResponseModel<boolean>,
  })
  @Post('seeding-data')
  async seedingData() {
    return await this.appService.seedingData();
  }

  /**
   * @description Retrieves all registered IoT vending devices in the system.
   *
   * @param {Request & { user: string }} req - HTTP request object with user authentication data.
   * @returns {Promise<DeviceEntity[]>} Array of all device entities with their configuration data.
   *
   * @example
   * GET /api/devices
   * Response: [{ device_id: 1, name: "Vending Machine A", ... }]
   */
  @ApiOkResponse({ type: [DeviceEntity] })
  @Get('devices')
  findAll(@Req() req: Request & { user: string }) {
    console.log(req.user);
    return this.appService.findAllDevices();
  }

  /**
   * @description Retrieves comprehensive product information and inventory details for a specific device.
   *
   * Details:
   * 1. Fetches device information by ID
   * 2. Aggregates associated product data with current inventory
   * 3. Returns enriched device model with product positioning and quantities
   *
   * @param {number} device_id - Unique identifier of the device to query.
   * @returns {Promise<DeviceDetailsModel>} Complete device information including products and inventory.
   *
   * @throws {HttpException} When device or products are not found (404 NOT_FOUND).
   *
   * @example
   * GET /api/products/device/123
   * Response: { device_id: 123, products: [{ product_id: 1, quantity: 5, ... }] }
   */
  @Get('products/device/:device_id')
  async findByDeviceId(@Param('device_id') device_id: number) {
    const product = await this.appService.findByDeviceId(device_id);
    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return product;
  }

  /**
   * @description Processes a new customer order with Cardano payment validation and inventory management.
   *
   * Details:
   * 1. Validates order data and product availability
   * 2. Verifies Cardano payment through blockchain UTXO validation
   * 3. Updates device inventory and broadcasts changes to connected clients
   * 4. Handles order fulfillment workflow
   *
   * @param {ProductOrderModel} orderData - Complete order information including device ID and product selections.
   * @returns {Promise<void>} Completes when order is successfully processed and inventory updated.
   *
   * @throws {HttpException} When validation fails, insufficient inventory, or payment issues occur.
   *
   * @example
   * POST /api/order
   * Body: { device_id: 1, order_product: [{ product_id: 5, quantity: 2 }] }
   */
  @ApiOperation({ summary: 'Used to be create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created',
    type: ProductOrderModel,
  })
  @Post('order')
  create(@Body() orderData: ProductOrderModel) {
    return this.appService.createOrder(orderData);
  }
}
