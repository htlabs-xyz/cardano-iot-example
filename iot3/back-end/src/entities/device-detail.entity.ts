import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('device_detail')
export default class DeviceDetailsEntity {
    @ApiProperty({ description: 'The id of the device', example: 'DV01' })
    @PrimaryColumn()
    device_id: number;

    @ApiProperty({ description: 'The id of the product', example: '1' })
    @PrimaryColumn()
    product_id: number;

    @ApiProperty({ description: 'The quality of the product', example: '5' })
    @Column()
    product_quality: number;

    @ApiProperty({ description: 'Device created at', example: new Date() })
    @Column()
    created_at: Date;

    @ApiProperty({ description: 'Device updated at', example: new Date() })
    updated_at: Date;
}
