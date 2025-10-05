import http from "@/lib/http";
import { ApiResponse } from "@/types/response.type";
import { UserInfoRequest, UserVerifyRequest, UserVerifyResponse } from "@/types/user.type";


const userIdentityApiRequest = {
    submitUserIdentityInfo: (body: UserInfoRequest) => http.post<ApiResponse<string>>(`/user-identity`, body),
    verifyUserInfo: (body: UserVerifyRequest) => http.post<ApiResponse<UserVerifyResponse>>(`/user-identity/verify`, body),
};

export default userIdentityApiRequest;