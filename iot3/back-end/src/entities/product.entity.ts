import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')
export default class ProductEntity {

    @ApiProperty({ description: 'Product ID', example: 1 })
    @PrimaryGeneratedColumn()
    product_id: number;

    @ApiProperty({ description: 'Product name', example: 10 })
    @Column()
    product_name: number;

    @ApiProperty({ description: 'Product price', example: 10 })
    @Column()
    product_price: number;

    @ApiProperty({ description: 'Product image', example: 10 })
    @Column()
    product_image: string;

    @ApiProperty({ description: 'Product row number', example: 3 })
    @Column()
    product_row_number: number;

    @ApiProperty({ description: 'Product colums number', example: 4 })
    @Column()
    product_col_number: number;

    @ApiProperty({ description: 'Product created at', example: new Date() })
    @Column()
    created_at: Date;

    @ApiProperty({ description: 'Product updated at', example: new Date() })
    updated_at: Date;
}
