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

@ApiTags('IOT3 - The API for IOT3 project')
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @ApiOkResponse({ type: [DeviceEntity] })
  @Get('devices')
  findAll(@Req() req: Request & { user: string }) {
    console.log(req.user);
    return this.appService.findAllDevices();
  }

  @Get('products/device/:device_id')
  async findByDeviceId(@Param('device_id') device_id: number) {
    const product = await this.appService.findByDeviceId(device_id);
    if (!product)
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    return product;
  }

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
