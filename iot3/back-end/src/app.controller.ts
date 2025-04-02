import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponseModel } from './common/response.interceptor';

@ApiTags('Data')
@Controller('api/seeding-data')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Used to seeding data tyo db if not exist' })
  @ApiResponse({
    status: 201,
    description: 'Seeding data success!',
    type: ApiResponseModel<boolean>,
  })
  @Post()
  async seedingData() {
    return await this.appService.seedingData();
  }
}
