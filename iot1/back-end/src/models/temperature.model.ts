import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import SensorDeviceModel from './sensor-device.model';

export enum TemperatureUnit {
  CELSIUS = 0,
  FAHRENHEIT = 1,
  KELVIN = 2,
}

export class TemperatureRequestModel {
  @ApiProperty({
    description: 'The address of device',
    example:
      'addr_test1qrkuhqzeg2c4fcwcn8nklgdvzgfsjd95dnzg0gf3x2vrkljal42832fu44020sefy9538j2yq7s2temv20l4haxzkwxsx732dh',
  })
  device_address: string;

  @ApiProperty({ description: 'Measured temperature', example: 36 })
  @IsNumber({}, { message: 'Temperature value must be a number' })
  value: number;

  @ApiProperty({
    description: 'Temperature unit',
    example: TemperatureUnit.CELSIUS,
  })
  @IsEnum(TemperatureUnit, {
    message: 'temperature unit must be Celsius (0), Fahrenheit (1), Kelvin (2)',
  })
  unit: TemperatureUnit;

  @ApiProperty({
    description: 'Time of the measurement',
    example: new Date(),
  })
  time: Date;
}

export class TemperatureResponseModel {
  @ApiProperty({ description: 'Measured temperature', example: 36 })
  @IsNumber({}, { message: 'Temperature value must be a number' })
  value: number;

  @ApiProperty({
    description: 'Temperature unit',
    example: TemperatureUnit.CELSIUS,
  })
  @IsEnum(TemperatureUnit, {
    message: 'temperature unit must be Celsius (0), Fahrenheit (1), Kelvin (2)',
  })
  unit: TemperatureUnit;

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

export class DeviceResultResponseModel {
  @ApiProperty({ description: 'Device information' })
  device_info: SensorDeviceModel | null;

  @ApiProperty({ description: 'List temperature of device' })
  temperatures: TemperatureResponseModel[] | null | undefined;
}
