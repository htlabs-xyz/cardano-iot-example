import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductOrderModel } from '../../models/payment.model';
import { OrderService } from './order.service';

@ApiTags('Order')
@Controller('api/order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}
  @ApiOperation({ summary: 'Used to be create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created',
    type: ProductOrderModel,
  })
  @Post()
  create(@Body() orderData: ProductOrderModel) {
    return this.orderService.create(orderData);
  }
}
