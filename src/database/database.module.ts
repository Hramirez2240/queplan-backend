import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CommonModule } from "src/common/common.module";
import { Friend } from "src/model/entities/friend";

@Module({
    imports: [
        CommonModule,
        SequelizeModule.forRoot({
            dialect: 'postgres',
            uri: process.env.DATABASE_URL || '',
            host: process.env.DATABASE_HOST || 'local',
            port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
            username: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'postgres',
            database: process.env.DATABASE_NAME || 'local_db',
            models: [Friend],
            autoLoadModels: false,
            synchronize: false
        })
    ]
})

export class DatabaseModule {}