import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseModel } from './common/response.interceptor';
import {
  UserInfoRequestModel,
  UserVerifyRequestModel,
} from './models/userinfo.model';

@ApiTags('User-identity')
@Controller('api/user-identity')
/**
 * @description AppController — REST API controller for user identity management on Cardano blockchain.
 *
 * Responsibilities:
 * - Handle HTTP requests for user identity operations
 * - Validate request data and delegate to AppService
 * - Provide Swagger API documentation
 *
 * Notes:
 * - All endpoints are POST requests for blockchain write/read operations
 * - Uses Swagger decorators for API documentation
 */
export class AppController {
  /**
   * @constructor
   * @description Initializes a new instance of AppController.
   *
   * @param {AppService} appService - The service layer for user identity operations.
   *
   * @example
   * const controller = new AppController(appService);
   */
  constructor(private readonly appService: AppService) {}
  @ApiOperation({ summary: 'Used to be submit a new user information' })
  @ApiResponse({
    status: 201,
    type: ApiResponseModel<string>,
  })
  /**
   * @description Submits new user identity information to the Cardano blockchain.
   *
   * Details:
   * 1. Validates user information from request body
   * 2. Delegates to AppService for blockchain write operation
   * 3. Returns transaction URL for confirmation
   *
   * @param {UserInfoRequestModel} userRequestModel - The user identity data to be stored on-chain.
   * @returns {Promise<string>} Transaction explorer URL for the submitted identity transaction.
   *
   * @throws {Error} If user data validation fails or blockchain operation fails.
   *
   * @example
   * POST /api/user-identity
   * Body: { user_id: "user123", name: "John Doe", ... }
   */
  @Post()
  writeUserData(@Body() userRequestModel: UserInfoRequestModel) {
    return this.appService.writeUserIdentityData(userRequestModel);
  }

  @ApiOperation({ summary: 'Used to get user information by asset name' })
  @ApiResponse({
    status: 200,
    type: ApiResponseModel<string>,
  })
  /**
   * @description Verifies and retrieves user identity information from the Cardano blockchain.
   *
   * Details:
   * 1. Validates user verification request from body
   * 2. Delegates to AppService for blockchain read operation
   * 3. Returns user metadata if found on-chain
   *
   * @param {UserVerifyRequestModel} userVerifyModel - The user verification request containing user ID.
   * @returns {Promise<any>} User metadata retrieved from blockchain.
   *
   * @throws {Error} If user ID validation fails or user not found on blockchain.
   *
   * @example
   * POST /api/user-identity/verify
   * Body: { user_id: "user123" }
   */
  @Post('verify')
  verifyUser(@Body() userVerifyModel: UserVerifyRequestModel) {
    return this.appService.verifyUserIdentity(userVerifyModel);
  }
}
