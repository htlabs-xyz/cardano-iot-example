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

@ApiTags('The locker')
@Controller('api/lock-device')
export class AppController {
  constructor(private readonly appService: AppService) {}
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

  @ApiOperation({ summary: 'Used to register a new lock' })
  @Post('register')
  register(@Body() registerModel: RegisterNewLockRequestModel) {
    return this.appService.registerNewLock(registerModel);
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
  getAllLockHistory(@Query() lockInfoModel: LockInfoRequestModel) {
    return this.appService.getAllLockHistory(lockInfoModel);
  }

  @ApiOperation({ summary: 'Used to get the status of the lock' })
  @Get('lock-status')
  getLockStatus(@Query() lockInfoModel: LockInfoRequestModel) {
    return this.appService.getLockStatus(lockInfoModel);
  }
}
