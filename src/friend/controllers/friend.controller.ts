import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { FriendService } from "../services/friend.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Friend } from "src/model/entities/friend";
import { BaseResponseListDto } from "src/model/dto/common/base-response-list.dto";

@Controller('friends')
export class FriendController{
    constructor(
        private readonly friendService: FriendService
    ){}

    @ApiOperation({summary: 'Get all friends'})
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns friends list',
    })
    async getAll(): Promise<BaseResponseListDto<Friend>>{
        return await this.friendService.findAll();
    }
}