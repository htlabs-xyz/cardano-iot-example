import { BlockFrostAPI } from '@blockfrost/blockfrost-js';
import { BlockfrostProvider, MeshWallet } from '@meshsdk/core';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import * as device_details_data from '../data/device-details.json';
import * as device_data from '../data/device.json';
import * as product_data from '../data/product.json';
import DeviceDetailsEntity from './entities/device-detail.entity';
import DeviceEntity from './entities/device.entity';
import ProductEntity from './entities/product.entity';
import {
  DeviceDetailsModel,
  ProductDetailModel,
} from './models/device-details.model';
import { DeviceDetailsDto } from './models/dtos/deviceDetails.dto';
import { ProductOrderModel } from './models/payment.model';
import { AppGateway } from './app.gateway';
@Injectable()
export class AppService {
  private blockfrostProvider: BlockfrostProvider;
  private blockfrostAPI: BlockFrostAPI;
  private acceptedSecond: number;
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(DeviceDetailsEntity)
    private readonly deviceDetailsRepository: Repository<DeviceDetailsEntity>,
    private dataSource: DataSource,
    private readonly appGateway: AppGateway,
  ) {
    this.blockfrostProvider = new BlockfrostProvider(
      process.env.BLOCKFROST_API_KEY || '',
    );
    this.blockfrostAPI = new BlockFrostAPI({
      projectId: process.env.BLOCKFROST_API_KEY ?? '',
    });
    this.acceptedSecond =
      Number(process.env.LAST_TRANSACTION_OFFSET_SECONDS) || 120;
  }

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

  findAllDevices() {
    return this.deviceRepository.find();
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

  async createOrder(orderData: Partial<ProductOrderModel>) {
    if (!orderData.device_id || !orderData.order_product)
      throw new HttpException(
        'Device or product is empty',
        HttpStatus.BAD_REQUEST,
      );
    const productIds = orderData.order_product.map((item) => item.product_id);
    const lstProducts: ProductEntity[] = await this.productRepository.find({
      where: {
        product_id: In(productIds),
      },
    });
    const selectedDevice = await this.deviceRepository.findOneBy({
      device_id: orderData.device_id,
    });

    if (!selectedDevice)
      throw new HttpException('Device not found', HttpStatus.BAD_REQUEST);
    if (!lstProducts || lstProducts.length == 0)
      throw new HttpException('Products not found', HttpStatus.BAD_REQUEST);
    let totalPrice = 0;
    for (const product of orderData.order_product) {
      const selectedProduct = lstProducts.find(
        (x) => x.product_id == product.product_id,
      );
      if (selectedProduct) {
        totalPrice += product.quantity * selectedProduct.product_price;
      }
    }

    const updatedDetails: DeviceDetailsDto[] = [];
    for (const product of orderData.order_product) {
      const selectedDetails = await this.deviceDetailsRepository.findOneBy({
        device_id: orderData.device_id,
        product_id: product.product_id,
      });
      if (selectedDetails) {
        const updatedQuantity =
          selectedDetails.product_quantity - product.quantity;
        if (updatedQuantity < 0)
          throw new HttpException(
            `The number of product ${product.product_id} is not enough`,
            HttpStatus.BAD_REQUEST,
          );
        updatedDetails.push({
          product_id: product.product_id,
          updated_quantity: updatedQuantity,
          device_id: orderData.device_id,
          row: selectedDetails.row,
          column: selectedDetails.column,
          release_quantity: product.quantity,
        });
      }
    }

    const isContainUTXO = await this.checkIfAddressHasValidUTXO(
      selectedDevice.wallet_address,
      totalPrice,
    );
    if (!isContainUTXO) {
      throw new HttpException(
        'Transaction was not updated yet! Please wait some minutes',
        HttpStatus.NOT_FOUND,
      );
    }

    for (const detail of updatedDetails) {
      this.updateDeviceDetails(
        orderData.device_id,
        detail.product_id,
        detail.updated_quantity,
      );
    }

    this.appGateway.server.emit('onUpdatedProduct', updatedDetails);
  }

  async checkIfAddressHasValidUTXO(
    walletAddress: string,
    amount_ada: number,
  ): Promise<boolean> {
    const wallet = this.getWallet(walletAddress);
    const utxos = await wallet.getUtxos();
    const last_index = utxos.length - 1;
    try {
      if (
        Number(utxos[last_index].output.amount[0].quantity) >=
        amount_ada * 1000000
      ) {
        const transaction = await this.blockfrostAPI.txs(
          utxos[last_index].input.txHash,
        );
        const currentTimeMs = Date.now();
        const transactionTimeMs = transaction.block_time * 1000;
        if (currentTimeMs - transactionTimeMs <= this.acceptedSecond * 1000) {
          console.log('Time ok');
          return true;
        } else {
          console.log('Time over');
          return false;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async updateDeviceDetails(
    device_id: number,
    product_id: number,
    product_quantity: number,
  ) {
    await this.deviceDetailsRepository.update(
      { device_id, product_id },
      {
        device_id,
        product_id,
        product_quantity,
        updated_at: new Date(),
      },
    );
    return this.deviceDetailsRepository.findOneBy({ device_id, product_id });
  }

  getWallet(walletAddress: string) {
    return new MeshWallet({
      networkId: 0,
      fetcher: this.blockfrostProvider,
      submitter: this.blockfrostProvider,
      key: {
        type: 'address',
        address: walletAddress,
      },
    });
  }
}
