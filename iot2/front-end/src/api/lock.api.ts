
import http from "@/lib/http";
import { ApiResponse, SubmitTxRequest, SubmitTxResponse } from "@/types/response.type";
import { AuthorizeRequest } from "../types/authorize-request.type";
import { LockRequest, LockStatus } from "../types/lock-request.type";

const lockApiRequest = {
    getAccessLock: (wallet_address: string) => http.get<ApiResponse<number>>(`/lock-device/get-access/${wallet_address}`),
    requestUpdateStatusDevice: (body: LockRequest) => http.post<ApiResponse<string>>('/lock-device/update-status', body),
    requestAuthorize: (body: AuthorizeRequest) => http.post<ApiResponse<string>>('/lock-device/authorize', body),
    submitTransaction: (body: SubmitTxRequest) => http.post<ApiResponse<SubmitTxResponse>>('/lock-device/submit-transaction', body),
    getAllLockHistory: () => http.get<ApiResponse<LockStatus[]>>(`/lock-device/history`),
    getLockStatus: () => http.get<ApiResponse<LockStatus>>(`/lock-device/lock-status`),
};

export default lockApiRequest;