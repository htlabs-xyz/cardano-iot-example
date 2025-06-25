import { ApiProperty } from '@nestjs/swagger';

export default class NFCReaderDeviceModel {
  @ApiProperty({
    description: 'The unique ID of the NFC device',
    example: 'NFC00123',
  })
  protected device_id: string;

  @ApiProperty({
    description: 'The name of the device',
    example: 'NFC Reader A1',
  })
  protected device_name: string;

  @ApiProperty({
    description: 'IP address of the device on the local network',
    example: '192.168.100.10',
  })
  protected device_ip: string;

  @ApiProperty({
    description: 'Physical location of the device',
    example: 'Floor 1, Entrance Area A',
  })
  protected device_location: string;

  @ApiProperty({ description: 'Type of the device', example: 'NFC Reader' })
  protected device_type: string;

  @ApiProperty({
    description: 'Firmware or software version of the device',
    example: 'v2.1.3',
  })
  protected device_version: string;

  @ApiProperty({
    description: 'Average card reading speed in milliseconds',
    example: 200,
  })
  protected read_speed_ms: number;

  @ApiProperty({
    description: 'Supported protocol standard',
    example: 'ISO/IEC 14443A',
  })
  protected protocol_standard: string;

  @ApiProperty({
    description: 'Physical connection interface (e.g., USB, Serial)',
    example: 'USB',
  })
  protected connection_interface: string;

  @ApiProperty({
    description: 'Current status of the device',
    example: 'active',
  })
  protected status: 'active' | 'inactive' | 'error';
}
