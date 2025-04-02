import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as device_details_data from '../data/device-details.json';
import * as device_data from '../data/device.json';
import * as product_data from '../data/product.json';
import DeviceDetailsEntity from './entities/device-detail.entity';
import DeviceEntity from './entities/device.entity';
import ProductEntity from './entities/product.entity';
@Injectable()
export class AppService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(DeviceDetailsEntity)
    private readonly deviceDetailsRepository: Repository<DeviceDetailsEntity>,
    private dataSource: DataSource,
  ) {}

  async seedingData() {
    const parsedDeviceData: DeviceEntity[] = JSON.parse(
      JSON.stringify(device_data),
    ).device.map((x) => ({
      ...x,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const parsedProductData: ProductEntity[] = JSON.parse(
      JSON.stringify(product_data),
    ).product.map((x) => ({
      ...x,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const parsedDeviceDetailsData: DeviceDetailsEntity[] = JSON.parse(
      JSON.stringify(device_details_data),
    ).device_details.map((x) => ({
      ...x,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    await this.dataSource.transaction(async () => {
      await this.deviceDetailsRepository.clear();
      await this.deviceRepository.clear();
      await this.productRepository.clear();

      await this.deviceRepository.insert(parsedDeviceData);
      await this.productRepository.insert(parsedProductData);
      await this.deviceDetailsRepository.insert(parsedDeviceDetailsData);

      // await transactionalEntityManager.save(devices);
      // await transactionalEntityManager.save(products);
      // await transactionalEntityManager.save(deviceDetails);
    });
    return 'OK';
  }
}
