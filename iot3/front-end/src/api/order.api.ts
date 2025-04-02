
import http from "@/lib/http";
import { ProductOrder } from "../types/order.type";
import { ApiResponse } from "../types/response.type";

const orderApiRequest = {
    orderProduct: (body: ProductOrder) => http.post<ApiResponse<boolean>>("/order", body),
};

export default orderApiRequest;