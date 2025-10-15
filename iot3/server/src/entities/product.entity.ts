import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('product')
export default class ProductEntity {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @PrimaryColumn()
  product_id: number;

  @ApiProperty({ description: 'Product name', example: 10 })
  @Column()
  product_name: string;

  @ApiProperty({ description: 'Product price', example: 10 })
  @Column()
  product_price: number;

  @ApiProperty({ description: 'Product image', example: 10 })
  @Column()
  product_image: string;

  @ApiProperty({ description: 'Product created at', example: new Date() })
  @Column()
  created_at: Date;

  @ApiProperty({ description: 'Product updated at', example: new Date() })
  updated_at: Date;
}
