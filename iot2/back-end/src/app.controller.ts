import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseModel } from './common/response.interceptor';
import AuthorizeRequestModel from './models/authorize-request.model';
import LockRequestModel, { SubmitTxModel } from './models/lock-request.model';

@ApiTags('The locker')
@Controller('api/lock-device')
export class AppController {
  constructor(private readonly appService: AppService) {}
  @ApiOperation({ summary: 'Used to check permission to access the lock' })
  @ApiResponse({
    status: 201,
    description: 'Unlock status',
    type: ApiResponseModel<boolean>,
  })
  @Get('get-access/:wallet_address')
  getAccessLock(@Param('wallet_address') wallet_address: string) {
    return this.appService.getAccessLock(wallet_address);
  }

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

  @ApiOperation({
    summary:
      'Used to authorize or remove authorize to other to access the lock device',
  })
  @Post('authorize')
  requestAuthorize(@Body() authorizeRequestModel: AuthorizeRequestModel) {
    return this.appService.requestAuthorize(authorizeRequestModel);
  }

  @ApiOperation({ summary: 'Used to submit transaction' })
  @Post('submit-transaction')
  submitTransaction(@Body() submitModel: SubmitTxModel) {
    return this.appService.submitTransaction(submitModel);
  }

  @ApiOperation({ summary: 'Used to get the history status of the lock' })
  @Get('history')
  getAllLockHistory() {
    return this.appService.getAllLockHistory();
  }

  @ApiOperation({ summary: 'Used to get the status of the lock' })
  @Get('lock-status')
  getLockStatus() {
    return this.appService.getLockStatus();
  }
}
