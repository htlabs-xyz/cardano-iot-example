import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import SensorDeviceModel from './sensor-device.model';

export enum TemperatureUnit {
  CELSIUS = 0,
  FAHRENHEIT = 1,
  KELVIN = 2,
}

export default class TemperatureModel {
  @ApiProperty({ description: 'Device information' })
  device_info: SensorDeviceModel;

  @ApiProperty({ description: 'Measured temperature', example: 36 })
  @IsNumber({}, { message: 'Temperature value must be a number' })
  heat: number;

  @ApiProperty({ description: 'Measured humidity', example: 36 })
  humidity: number;

  @ApiProperty({
    description: 'Temperature unit',
    example: TemperatureUnit.CELSIUS,
  })
  @IsEnum(TemperatureUnit, {
    message: 'temperature unit must be Celsius (0), Fahrenheit (1), Kelvin (2)',
  })
  unit: TemperatureUnit;

  @ApiProperty({
    description: 'Timestamp of the measurement',
    example: new Date(),
  })
  timestamp: Date;
}
