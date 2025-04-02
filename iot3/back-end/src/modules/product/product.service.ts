import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import DeviceDetailsEntity from '../../entities/device-detail.entity';
import DeviceEntity from '../../entities/device.entity';
import ProductEntity from '../../entities/product.entity';
import {
  DeviceDetailsModel,
  ProductDetailModel,
} from '../../models/device-details.model';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(DeviceDetailsEntity)
    private readonly deviceDetailsRepository: Repository<DeviceDetailsEntity>,
  ) {}

  findAll() {
    return this.productRepository.find();
  }

  async findByDeviceId(device_id: number) {
    const deviceInfo = await this.deviceRepository.findOneBy({ device_id });
    const lstDetails = await this.deviceDetailsRepository.find({
      where: { device_id },
    });
    const productIds = lstDetails.map((item) => item.product_id);
    const lstProducts: ProductEntity[] = await this.productRepository.find({
      where: {
        product_id: In(productIds),
      },
    });

    const lstProductDetailModels: ProductDetailModel[] = lstProducts.map(
      (product: ProductEntity) => {
        const productDetail = new ProductDetailModel();
        Object.assign(productDetail, product);
        const detail = lstDetails.find(
          (x) => x.product_id == product.product_id,
        );
        productDetail.product_quantity = detail?.product_quantity ?? 0;
        productDetail.row = detail?.row ?? 0;
        productDetail.column = detail?.column ?? 0;
        return productDetail;
      },
    );
    const deviceDetail = new DeviceDetailsModel();
    Object.assign(deviceDetail, deviceInfo);
    deviceDetail.products = lstProductDetailModels;

    return deviceDetail;
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
