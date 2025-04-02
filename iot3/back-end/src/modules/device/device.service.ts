import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import DeviceEntity from '../../entities/device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
  ) {}

  findAll() {
    return this.deviceRepository.find();
  }

  findOne(device_id: number) {
    return this.deviceRepository.findOneBy({ device_id });
  }

  create(deviceData: Partial<DeviceEntity>) {
    const device = this.deviceRepository.create(deviceData);
    device.created_at = new Date();
    device.updated_at = new Date();
    return this.deviceRepository.save(device);
  }

  async update(device_id: number, deviceData: Partial<DeviceEntity>) {
    deviceData.updated_at = new Date();
    await this.deviceRepository.update(device_id, deviceData);
    return this.deviceRepository.findOneBy({ device_id });
  }

  async delete(device_id: number) {
    const device = this.deviceRepository.findOneBy({ device_id });
    await this.deviceRepository.delete(device_id);
    return device;
  }
}
