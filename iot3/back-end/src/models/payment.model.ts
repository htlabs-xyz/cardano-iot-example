import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethod {
  COIN = 1,
  QR = 2,
  CASH = 3,
}

export class ProductOrderDetailsModel {
  @ApiProperty({ description: 'Product id', example: 1 })
  product_id: number;

  @ApiProperty({ description: 'product quantity', example: 3 })
  quantity: number;
}

export class ProductOrderModel {
  @ApiProperty({ description: 'Device information' })
  device_id: number;

  @ApiProperty({
    description: 'List Product',
    type: [ProductOrderDetailsModel],
    example: [{ id: 1, quantity: 2 }],
  })
  order_product: ProductOrderDetailsModel[];

  @ApiProperty({ description: 'payment method', example: PaymentMethod.QR })
  order_payment?: PaymentMethod;

  @ApiProperty({ description: 'Date time request', example: new Date() })
  order_at?: Date;
}
