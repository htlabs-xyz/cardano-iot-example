import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import ProductEntity from '../../entities/product.entity';
import { ProductsService } from './product.service';


@ApiTags('Product')
@Controller('api/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @ApiOkResponse({ type: [ProductEntity] })
    @Get()
    findAll(@Req() req: Request & { user: string }) {
        console.log(req.user);
        return this.productsService.findAll();
    }

    @ApiCreatedResponse({
        description: 'created successfully',
        type: ProductEntity,
    })
    @Get(':product_id')
    async findOne(@Param('product_id') product_id: number) {
        const product = await this.productsService.findOne(product_id);
        if (!product)
            throw new HttpException('Sản phẩm không tìm thấy', HttpStatus.NOT_FOUND);
        return product;
    }

    @ApiOperation({ summary: 'Used to be create a new product' })
    @ApiResponse({
        status: 201,
        description: 'Product created',
        type: ProductEntity,
    })
    @Post()
    create(@Body() productData: ProductEntity) {
        return this.productsService.create(productData);
    }

    @Patch(':product_id')
    update(@Body() productData: ProductEntity, @Param('product_id') product_id: number) {
        return this.productsService.update(product_id, productData);
    }

    @Delete(':product_id')
    remove(@Param('product_id') product_id: number) {
        return this.productsService.delete(product_id);
    }
}
