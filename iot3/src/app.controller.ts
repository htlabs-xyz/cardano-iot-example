import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BillModel, ProductOrderModel } from './models/payment.model';
import { ApiResponseModel } from './common/response.interceptor';

@ApiTags('The vending')
@Controller('api/vending-device')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({ summary: 'Used to request an order of products' })
  @ApiResponse({
    status: 201,
    description: 'Return bill',
    type: ApiResponseModel<BillModel>,
  })
  @Post('order')
  orderProduct(@Body() orderModel: ProductOrderModel) {
    var sample_order = new BillModel();
    sample_order.bill_order_product = new ProductOrderModel();
    sample_order.bill_qr_code = "sdjnawdji8209e1je12ije12km1k2e...";
    sample_order.bill_total_price = 500;
    return sample_order;
  }
}
