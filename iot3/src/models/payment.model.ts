import { ApiProperty } from '@nestjs/swagger';
import ProductModel from './product.model';
import VendingDeviceModel from './vending-device.model';

export enum PaymentMethod {
    COIN = 1,
    QR = 2,
    CASH = 3
}


export class ProductOrderDetailsModel {
    @ApiProperty({ description: 'Product information', example: new ProductModel() })
    product: ProductModel;

    @ApiProperty({ description: 'product quantity', example: 3 })
    quantity: number;
}

export class ProductOrderModel {
    @ApiProperty({ description: 'Device information' })
    order_device: VendingDeviceModel;

    @ApiProperty({ description: 'List Product', type: [ProductOrderDetailsModel], example: [{ id: 1, name: 'Product A', quantity: 2, price: 10.99 }] })
    order_product: ProductOrderDetailsModel[];

    @ApiProperty({ description: 'payment method', example: PaymentMethod.QR })
    order_payment: PaymentMethod;

    @ApiProperty({ description: 'Date time request', example: new Date() })
    order_at: Date;
}



export class BillModel {
    @ApiProperty({ description: 'Product' })
    bill_order_product: ProductOrderModel;

    @ApiProperty({ description: 'Total price', example: 3000 })
    bill_total_price: number;

    @ApiProperty({ description: 'QR code', example: '12030mndsjkf-23020dkosdfisdfis00-320-21e023jsdijcsjid0' })
    bill_qr_code: string;
}