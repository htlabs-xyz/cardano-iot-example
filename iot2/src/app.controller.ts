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
  @Patch('update-status')
  updateStatusDevice(@Body() lockRequestModel: LockRequestModel) {
    return this.appService.updateStatusDevice(lockRequestModel);
  }

  @ApiOperation({ summary: 'Used to authorize to other to access the lock device' })
  @Post('authorize')
  authorize(@Body() authorizeRequestModel: AuthorizeRequestModel) {
    return this.appService.authorize(authorizeRequestModel);
  }
}
