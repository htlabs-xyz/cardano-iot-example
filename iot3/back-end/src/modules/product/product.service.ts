import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import ProductEntity from '../../entities/product.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) { }

    findAll() {
        return this.productRepository.find();
    }

    findOne(product_id: number) {
        return this.productRepository.findOneBy({ product_id });
    }

    create(productData: Partial<ProductEntity>) {
        const product = this.productRepository.create(productData);
        product.created_at = new Date();
        product.updated_at = new Date();
        return this.productRepository.save(product);
    }

    async update(product_id: number, productData: Partial<ProductEntity>) {
        productData.updated_at = new Date();
        await this.productRepository.update(product_id, productData);
        return this.productRepository.findOneBy({ product_id });
    }

    async delete(product_id: number) {
        const product = this.productRepository.findOneBy({ product_id });
        await this.productRepository.delete(product_id);
        return product;
    }
}
