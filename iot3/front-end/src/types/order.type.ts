export type ProductOrderDetails = {
    product_id: number;
    quantity: number;
}

export type ProductOrder = {
    device_id: number;
    order_product: ProductOrderDetails[]
}