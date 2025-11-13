import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';

import { FriendController } from './friend.controller';
import { FriendService } from '../services/friend.service';

describe('FriendController', () => {
  let controller: FriendController;
  const mockFriendService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendController],
      providers: [{ provide: FriendService, useValue: mockFriendService }],
    }).compile();

    controller = module.get<FriendController>(FriendController);
  });

  it('getAll should return service response', async () => {
    const resp = {
      statusCode: HttpStatus.OK,
      message: 'Friends retrieved successfully',
      data: [{ id: '378fb7a1-cf3d-4cb4-ac40-9c41c5199b6d', name: 'Alice', gender: 'Femenino' }],
    };
    mockFriendService.findAll.mockResolvedValue(resp);

    const result = await controller.getAll();

    expect(mockFriendService.findAll).toHaveBeenCalled();
    expect(result).toEqual(resp);
  });
});
