import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { BaseResponseListDto } from "src/model/dto/common/base-response-list.dto";
import { Friend } from "src/model/entities/friend";

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(Friend)
    private readonly friendRepository: typeof Friend,
  ) {}

  async findAll(): Promise<BaseResponseListDto<Friend>> {
    try {
      const friends = await this.friendRepository.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Friends retrieved successfully',
        data: friends,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error retrieving friends',
        data: null,
      };
    }
  }
}