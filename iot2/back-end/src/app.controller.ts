import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseModel } from './common/response.interceptor';
import LockRequestModel from './models/lock-request.model';
import AuthorizeRequestModel from './models/authorize-request.model';

@ApiTags('The locker')
@Controller('api/lock-device')
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({ summary: 'Used to change status lock/unlock of the lock device' })
  @ApiResponse({
    status: 201,
    description: 'Unlock status',
    type: ApiResponseModel<string>,
  })
  @Post('update-status')
  requestUpdateStatusDevice(@Body() lockRequestModel: LockRequestModel) {
    return this.appService.updateStatusDevice(lockRequestModel);
  }

  @ApiOperation({ summary: 'Used to authorize or remove authorize to other to access the lock device' })
  @Post('authorize')
  requestAuthorize(@Body() authorizeRequestModel: AuthorizeRequestModel) {
    return this.appService.requestAuthorize(authorizeRequestModel);
  }

  @ApiOperation({ summary: 'Used to submit transaction' })
  @Post('submit-transaction')
  submitTransaction(@Body() signedTx: string) {
    return this.appService.submitTransaction(signedTx);
  }
}
