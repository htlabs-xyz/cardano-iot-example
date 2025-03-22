
import { ApiResponse, SubmitTxResponse, UnsignTxResponse } from "@/types/response.type";
import http from "@/lib/http";
import { LockRequest } from "../types/lock-request.type";
import { AuthorizeRequest } from "../types/authorize-request.type";

const lockApiRequest = {
    requestUpdateStatusDevice: (body: LockRequest) => http.post<ApiResponse<UnsignTxResponse>>('/update-status', body),
    requestAuthorize: (body: AuthorizeRequest) => http.post<ApiResponse<UnsignTxResponse>>('/authorize', body),
    submitTransaction: (body: string) => http.post<ApiResponse<SubmitTxResponse>>('/submit-transaction', body),
};

export default lockApiRequest;