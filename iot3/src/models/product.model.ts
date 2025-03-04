import { ApiProperty } from '@nestjs/swagger';

export default class ProductModel {
    @ApiProperty({ description: 'Product ID', example: 1 })
    product_id: number;

    @ApiProperty({ description: 'Product name', example: 10 })
    product_name: number;

    @ApiProperty({ description: 'Product price', example: 10 })
    product_price: number;

    @ApiProperty({ description: 'Product row number', example: 3 })
    product_row_number: number;

    @ApiProperty({ description: 'Product colums number', example: 4 })
    product_col_number: number;
}
