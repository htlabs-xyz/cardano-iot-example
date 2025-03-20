import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import ProductEntity from '../../entities/product.entity';
import { ProductsService } from './product.service';
import { ProductsController } from './product.controller';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],
    imports: [TypeOrmModule.forFeature([ProductEntity]), ConfigModule.forRoot()],
})
export class ProductsModule { }
