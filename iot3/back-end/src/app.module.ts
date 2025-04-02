import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import DeviceDetailsEntity from './entities/device-detail.entity';
import DeviceEntity from './entities/device.entity';
import ProductEntity from './entities/product.entity';
import { DevicesModule } from './modules/device/device.module';
import { OrderModule } from './modules/order/order.module';
import { ProductsModule } from './modules/product/product.module';

if (!process.env.DB_PORT) {
  throw new Error('DB_PORT environment variable is required');
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [ProductEntity, DeviceEntity, DeviceDetailsEntity], // DS các entity sẽ ánh xạ
      synchronize: true, //tự tạo bảng từ entity
    }),
    TypeOrmModule.forFeature([
      ProductEntity,
      DeviceDetailsEntity,
      DeviceEntity,
    ]),
    OrderModule,
    DevicesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
