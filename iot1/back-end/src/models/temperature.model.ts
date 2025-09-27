import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TemperatureRequestModel {
  @ApiProperty({
    description: 'The id of device',
    example: 'SENSOR-01',
  })
  device_id: string;

  @ApiProperty({ description: 'Measured temperature', example: 36 })
  @IsNumber({}, { message: 'Temperature value must be a number' })
  temperature: number;

  @ApiProperty({ description: 'Measured humidity', example: 36 })
  @IsNumber({}, { message: 'Humidity value must be a number' })
  humidity: number;

  @ApiProperty({
    description: 'Time of the measurement',
    example: new Date(),
  })
  time: Date;
}

export class TemperatureResponseModel {
  @ApiProperty({ description: 'Measured temperature', example: 36 })
  @IsNumber({}, { message: 'Temperature value must be a number' })
  temperature: number;

  @ApiProperty({ description: 'Measured humidity', example: 36 })
  @IsNumber({}, { message: 'Humidity value must be a number' })
  humidity: number;

  @ApiProperty({
    description: 'Time of the measurement',
    example: new Date(),
  })
  time: Date;

  @ApiProperty({
    description: 'transaction tracking',
    example:
      'https://preprod.cexplorer.io/tx/85936c1350cf50ab5ec69d5c30dd8d2a023cf88251a2463c3fbe6c1da871d5e1',
  })
  tx_ref: string;
}
