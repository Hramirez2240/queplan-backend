import { Module } from "@nestjs/common";
import { FriendService } from "./services/friend.service";
import { FriendController } from "./controllers/friend.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { Friend } from "src/model/entities/friend";
import { DatabaseModule } from "src/database/database.module";

@Module({
    imports: [SequelizeModule.forFeature([Friend]), DatabaseModule],
    providers: [FriendService],
    controllers: [FriendController],
})

export class FriendModule {}