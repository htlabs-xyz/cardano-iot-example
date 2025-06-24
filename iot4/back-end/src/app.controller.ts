import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseModel } from './common/response.interceptor';
import {
  UserInfoRequestModel,
  UserVerifyRequestModel,
} from './models/userinfo.model';

@ApiTags('User-identity')
@Controller('api/user-identity')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Used to get all users' })
  @ApiResponse({
    status: 200,
    description: 'Users received',
    type: ApiResponseModel<string>,
  })
  @Get()
  getAllUsers() {
    return [];
  }

  @ApiOperation({ summary: 'Used to be submit a new user information' })
  @ApiResponse({
    status: 201,
    type: ApiResponseModel<string>,
  })
  @Post()
  submitTemperature(@Body() userRequestModel: UserInfoRequestModel) {
    return this.appService.writeUserIdentityData(userRequestModel);
  }

  @ApiOperation({ summary: 'Used to get user information by asset name' })
  @ApiResponse({
    status: 200,
    type: ApiResponseModel<string>,
  })
  @Post('verify')
  verifyUser(@Body() userVerifyModel: UserVerifyRequestModel) {
    return this.appService.verifyUserIdentity(userVerifyModel);
  }
}
