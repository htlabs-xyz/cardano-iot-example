import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import DeviceEntity from '../entities/device.entity';
import ProductEntity from '../entities/product.entity';

export class ProductDetailModel extends ProductEntity {
  @ApiPropertyOptional({ description: 'number of product', example: 10 })
  product_quantity: number;

  @ApiProperty({ description: 'Product row number', example: 3 })
  row: number;

  @ApiProperty({ description: 'Product colums number', example: 4 })
  column: number;
}

export class DeviceDetailsModel extends DeviceEntity {
  @ApiPropertyOptional({
    description: 'list products in vending machine',
    example: [new ProductDetailModel()],
  })
  products?: ProductDetailModel[];
}
