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

/**
 * @description AppService — core business logic service for IoT vending machine operations with Cardano blockchain integration.
 *
 * Responsibilities:
 * - Manages device, product, and inventory data operations
 * - Processes customer orders and validates payment through Cardano UTXOs
 * - Integrates with Blockfrost API for blockchain transaction verification
 * - Provides real-time updates via WebSocket gateway for device state changes
 * - Handles data seeding and database transaction management
 *
 * Notes:
 * - Uses TypeORM repositories for database operations with transactional support
 * - Implements time-based UTXO validation for payment confirmation
 * - Emits real-time events for inventory updates to connected clients
 */
@Injectable()
export class AppService {
  private blockfrostProvider: BlockfrostProvider;
  private blockfrostAPI: BlockFrostAPI;
  private acceptedSecond: number;

  /**
   * @constructor
   * @description Initializes a new instance of AppService with required repositories and blockchain providers.
   *
   * @param {Repository<ProductEntity>} productRepository - Repository for product data operations.
   * @param {Repository<DeviceEntity>} deviceRepository - Repository for device management operations.
   * @param {Repository<DeviceDetailsEntity>} deviceDetailsRepository - Repository for device inventory details.
   * @param {DataSource} dataSource - TypeORM data source for transaction management.
   * @param {AppGateway} appGateway - WebSocket gateway for real-time communication.
   *
   * @example
   * // Automatically injected by NestJS dependency injection
   * const appService = new AppService(productRepo, deviceRepo, detailsRepo, dataSource, gateway);
   */
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

  /**
   * @description Initializes the database with seed data from JSON files for devices, products, and inventory details.
   *
   * Details:
   * 1. Parses JSON seed data and adds timestamps
   * 2. Clears existing data in transaction
   * 3. Inserts fresh seed data atomically
   *
   * @returns {Promise<string>} Returns 'OK' when seeding operation completes successfully.
   *
   * @example
   * const result = await appService.seedingData();
   * console.log(result); // 'OK'
   */
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

  /**
   * @description Retrieves all registered IoT vending devices from the database.
   *
   * @returns {Promise<DeviceEntity[]>} Array of all device entities with their basic information.
   *
   * @example
   * const devices = await appService.findAllDevices();
   */
  findAllDevices() {
    return this.deviceRepository.find();
  }

  /**
   * @description Retrieves comprehensive device information including inventory details and product data.
   *
   * Details:
   * 1. Fetches device basic information
   * 2. Retrieves associated product inventory details
   * 3. Enriches product data with quantity and position information
   *
   * @param {number} device_id - Unique identifier of the device to retrieve.
   * @returns {Promise<DeviceDetailsModel>} Complete device model with products, quantities, and positioning data.
   *
   * @example
   * const deviceInfo = await appService.findByDeviceId(123);
   * console.log(deviceInfo.products.length); // Number of products in device
   */
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

  /**
   * @description Processes a customer order by validating payment, updating inventory, and notifying connected clients.
   *
   * Details:
   * 1. Validates order data and product availability
   * 2. Calculates total price and checks inventory quantities
   * 3. Verifies Cardano payment through UTXO validation
   * 4. Updates device inventory and broadcasts changes via WebSocket
   *
   * @param {Partial<ProductOrderModel>} orderData - Order information containing device ID and product selections.
   * @returns {Promise<void>} Completes when order is processed and inventory updated.
   *
   * @throws {HttpException} When device/products not found, insufficient inventory, or payment validation fails.
   *
   * @example
   * await appService.createOrder({
   *   device_id: 1,
   *   order_product: [{ product_id: 5, quantity: 2 }]
   * });
   */
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
      await this.updateDeviceDetails(
        orderData.device_id,
        detail.product_id,
        detail.updated_quantity,
      );
    }

    this.appGateway.server.emit('onUpdatedProduct', updatedDetails);
  }

  /**
   * @description Validates if a Cardano wallet address has sufficient recent payment for the order amount.
   *
   * Details:
   * 1. Retrieves wallet UTXOs using MeshWallet
   * 2. Checks if latest UTXO contains sufficient ADA amount
   * 3. Validates transaction timestamp within acceptable time window
   *
   * @param {string} walletAddress - Cardano wallet address to check for payment.
   * @param {number} amount_ada - Required payment amount in ADA.
   * @returns {Promise<boolean>} True if valid payment found within time limit, false otherwise.
   *
   * @example
   * const isValid = await appService.checkIfAddressHasValidUTXO('addr1...', 5.5);
   * if (isValid) { // Process order }
   */
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

  /**
   * @description Updates the inventory quantity for a specific product in a device and returns the updated record.
   *
   * Details:
   * 1. Updates the product quantity in device details table
   * 2. Sets updated timestamp to current time
   * 3. Returns the freshly updated device detail record
   *
   * @param {number} device_id - Identifier of the device containing the product.
   * @param {number} product_id - Identifier of the product to update.
   * @param {number} product_quantity - New quantity value for the product.
   * @returns {Promise<DeviceDetailsEntity | null>} Updated device detail entity or null if not found.
   *
   * @example
   * const updated = await appService.updateDeviceDetails(1, 5, 10);
   * console.log(updated.product_quantity); // 10
   */
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

  /**
   * @description Creates a MeshWallet instance for interacting with a Cardano wallet address.
   *
   * @param {string} walletAddress - Cardano wallet address to create wallet instance for.
   * @returns {MeshWallet} Configured MeshWallet instance for testnet operations.
   *
   * @example
   * const wallet = appService.getWallet('addr1test...');
   * const utxos = await wallet.getUtxos();
   */
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
