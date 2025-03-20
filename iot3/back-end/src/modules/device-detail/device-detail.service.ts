import { Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import DeviceDetailsEntity from '../../entities/device-detail.entity';
import DeviceEntity from '../../entities/device.entity';
import ProductEntity from '../../entities/product.entity';
import { DeviceDetailsModel, ProductDetailModel } from '../../models/device-details.model';

@Injectable()
export class DeviceDetailsService {
    constructor(
        @InjectRepository(DeviceDetailsEntity)
        private readonly deviceDetailsRepository: Repository<DeviceDetailsEntity>,

        @InjectRepository(DeviceEntity)
        private readonly deviceRepository: Repository<DeviceEntity>,

        @InjectRepository(ProductEntity)
        private readonly productRepository: Repository<ProductEntity>,
    ) { }


    async getDetailsDevice(device_id: number) {
        const deviceInfo = await this.deviceRepository.findOneBy({ device_id });
        const lstDetails = await this.deviceDetailsRepository.find({ where: { device_id } });
        const productIds = lstDetails.map(item => item.product_id);
        const lstProducts: ProductEntity[] = await this.productRepository.find({
            where: {
                product_id: In(productIds),
            },
        });

        const lstProductDetailModels: ProductDetailModel[] = lstProducts.map((product: ProductEntity) => {
            const productDetail = new ProductDetailModel();
            Object.assign(productDetail, product);
            productDetail.product_quantity = lstDetails.find(x => x.product_id == product.product_id)?.product_quality ?? 0;
            return productDetail;
        });
        const deviceDetail = new DeviceDetailsModel();
        Object.assign(deviceDetail, deviceInfo);
        deviceDetail.products = lstProductDetailModels;

        return deviceDetail;
    }


    addProductToDevice(deviceDetailsData: Partial<DeviceDetailsEntity>) {
        const details = this.deviceDetailsRepository.create(deviceDetailsData);
        details.created_at = new Date();
        details.updated_at = new Date();
        return this.deviceDetailsRepository.save(details);
    }

    async update(deviceDetailsData: Partial<DeviceDetailsEntity>) {
        deviceDetailsData.updated_at = new Date();
        await this.deviceDetailsRepository.update({ device_id: deviceDetailsData.device_id, product_id: deviceDetailsData.product_id }, deviceDetailsData);
        return this.deviceDetailsRepository.findOneBy({ device_id: deviceDetailsData.device_id, product_id: deviceDetailsData.product_id });
    }

    async delete(device_id: number, product_id: number) {
        const device = this.deviceDetailsRepository.findOneBy({ device_id, product_id });
        await this.deviceDetailsRepository.delete({ device_id, product_id });
        return device;
    }
}
