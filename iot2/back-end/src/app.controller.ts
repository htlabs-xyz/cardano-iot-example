import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseModel } from './common/response.interceptor';
import {
  AuthorizeRequestModel,
  LockInfoRequestModel,
  LockRequestModel,
  SubmitTxModel,
} from './models/lock.model';
import {
  LoginRequestModel,
  LoginResponseModel,
  RegisterNewLockRequestModel,
} from './models/auth.model';

/**
 * @description AppController — handles HTTP endpoints for IoT lock device management and blockchain operations.
 *
 * Responsibilities:
 * - Exposes REST API endpoints for lock authentication and registration
 * - Manages lock status updates and authorization requests
 * - Handles transaction submission and status retrieval
 * - Provides lock history and current status information
 *
 * Notes:
 * - All endpoints are prefixed with '/api/lock-device'
 * - Integrates with AppService for business logic execution
 * - Uses Swagger decorators for API documentation
 */
@ApiTags('The locker')
@Controller('api/lock-device')
export class AppController {
  /**
   * @constructor
   * @description Initializes a new instance of AppController with the required service dependency.
   *
   * @param {AppService} appService - Service layer that handles business logic for lock operations.
   *
   * @example
   * const controller = new AppController(appService);
   */
  constructor(private readonly appService: AppService) {}

  /**
   * @description Authenticates a user for a specific lock and returns their access permissions.
   *
   * Details:
   * 1. Validates user credentials against lock ownership
   * 2. Determines user access role (owner, authority, or unknown)
   * 3. Returns current lock status if user has access
   *
   * @param {LoginRequestModel} loginModel - Contains user address, owner address, and lock name.
   * @returns {Promise<LoginResponseModel>} User access role and current lock status.
   *
   * @example
   * POST /api/lock-device/login
   * Body: { user_addr: "addr1...", owner_addr: "addr1...", lock_name: "MyLock" }
   */
  @ApiOperation({ summary: 'Used to login to the lock' })
  @ApiResponse({
    status: 200,
    description: 'Unlock status',
    type: ApiResponseModel<LoginResponseModel>,
  })
  @Post('login')
  login(@Body() loginModel: LoginRequestModel) {
    return this.appService.login(loginModel);
  }

  /**
   * @description Registers a new IoT lock device on the blockchain for the specified owner.
   *
   * Details:
   * 1. Validates that lock name is unique for the owner
   * 2. Creates new lock contract on blockchain
   * 3. Returns transaction result for the registration
   *
   * @param {RegisterNewLockRequestModel} registerModel - Contains owner address and unique lock name.
   * @returns {Promise<any>} Transaction result from blockchain registration.
   *
   * @example
   * POST /api/lock-device/register
   * Body: { owner_addr: "addr1...", lock_name: "MyNewLock" }
   */
  @ApiOperation({ summary: 'Used to register a new lock' })
  @Post('register')
  register(@Body() registerModel: RegisterNewLockRequestModel) {
    return this.appService.registerNewLock(registerModel);
  }

  /**
   * @description Generates an unsigned transaction to change the lock device status (open/close).
   *
   * Details:
   * 1. Validates user permissions to modify lock status
   * 2. Creates appropriate lock or unlock transaction
   * 3. Returns unsigned transaction for client to sign
   *
   * @param {LockRequestModel} lockRequestModel - Contains lock details, user address, and desired status.
   * @returns {Promise<string>} Unsigned transaction ready for signing.
   *
   * @example
   * POST /api/lock-device/update-status
   * Body: { owner_addr: "addr1...", lock_name: "MyLock", unlocker_addr: "addr1...", lock_status: "OPEN" }
   */
  @ApiOperation({
    summary: 'Used to change status lock/unlock of the lock device',
  })
  @ApiResponse({
    status: 201,
    description: 'Unlock status',
    type: ApiResponseModel<string>,
  })
  @Post('update-status')
  requestUpdateStatusDevice(@Body() lockRequestModel: LockRequestModel) {
    return this.appService.updateStatusDevice(lockRequestModel);
  }

  /**
   * @description Generates an unsigned transaction to authorize or revoke access for another user.
   *
   * Details:
   * 1. Validates owner permissions for authorization changes
   * 2. Creates authorization transaction for specified licensee
   * 3. Returns unsigned transaction for owner to sign
   *
   * @param {AuthorizeRequestModel} authorizeRequestModel - Contains owner address, lock name, and licensee address.
   * @returns {Promise<string>} Unsigned authorization transaction.
   *
   * @example
   * POST /api/lock-device/authorize
   * Body: { owner_addr: "addr1...", lock_name: "MyLock", licensee_addr: "addr1..." }
   */
  @ApiOperation({
    summary:
      'Used to authorize or remove authorize to other to access the lock device',
  })
  @Post('authorize')
  requestAuthorize(@Body() authorizeRequestModel: AuthorizeRequestModel) {
    return this.appService.requestAuthorize(authorizeRequestModel);
  }

  /**
   * @description Submits a signed transaction to the blockchain and broadcasts status updates.
   *
   * Details:
   * 1. Submits signed transaction to Cardano blockchain
   * 2. Waits for transaction confirmation
   * 3. Emits real-time status updates via WebSocket
   *
   * @param {SubmitTxModel} submitModel - Contains user address, signed transaction, and status data.
   * @returns {Promise<{tx_hash: string, tx_ref: string}>} Transaction hash and explorer reference.
   *
   * @example
   * POST /api/lock-device/submit-transaction
   * Body: { user_addr: "addr1...", signedTx: "84a3...", data: {...} }
   */
  @ApiOperation({ summary: 'Used to submit transaction' })
  @Post('submit-transaction')
  submitTransaction(@Body() submitModel: SubmitTxModel) {
    return this.appService.submitTransaction(submitModel);
  }

  /**
   * @description Retrieves the complete history of status changes for a specified lock device.
   *
   * Details:
   * 1. Fetches all blockchain transactions for the lock
   * 2. Processes transaction data to extract status changes
   * 3. Returns chronologically sorted history with user information
   *
   * @param {LockInfoRequestModel} lockInfoModel - Contains owner address and lock name for history lookup.
   * @returns {Promise<LockStatusResponseModel[]>} Array of lock status changes with timestamps.
   *
   * @example
   * GET /api/lock-device/history?owner_addr=addr1...&lock_name=MyLock
   */
  @ApiOperation({ summary: 'Used to get the history status of the lock' })
  @Get('history')
  getAllLockHistory(@Query() lockInfoModel: LockInfoRequestModel) {
    return this.appService.getAllLockHistory(lockInfoModel);
  }

  /**
   * @description Retrieves the current status of a specified lock device from the blockchain.
   *
   * Details:
   * 1. Queries blockchain for latest lock state
   * 2. Extracts current status and timestamp information
   * 3. Returns formatted status response with transaction reference
   *
   * @param {LockInfoRequestModel} lockInfoModel - Contains owner address and lock name for status lookup.
   * @returns {Promise<LockStatusResponseModel>} Current lock status with timestamp and transaction reference.
   *
   * @example
   * GET /api/lock-device/lock-status?owner_addr=addr1...&lock_name=MyLock
   */
  @ApiOperation({ summary: 'Used to get the status of the lock' })
  @Get('lock-status')
  getLockStatus(@Query() lockInfoModel: LockInfoRequestModel) {
    return this.appService.getLockStatus(lockInfoModel);
  }
}
