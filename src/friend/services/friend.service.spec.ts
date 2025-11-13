import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { HttpStatus } from '@nestjs/common';

import { FriendService } from './friend.service';
import { Friend } from '../../model/entities/friend';

describe('FriendService', () => {
  let service: FriendService;
  let mockRepo: { findAll: jest.Mock };

  beforeEach(async () => {
    mockRepo = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendService,
        { provide: getModelToken(Friend), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FriendService>(FriendService);
  });

  it('should return list on success', async () => {
    const friends = [{ id: '378fb7a1-cf3d-4cb4-ac40-9c41c5199b6d', name: 'Alice', gender: 'Femenino' }];
    mockRepo.findAll.mockResolvedValue(friends);

    const res = await service.findAll();

    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(res.statusCode).toBe(HttpStatus.OK);
    expect(res.data).toBe(friends);
  });

  it('should handle errors', async () => {
    mockRepo.findAll.mockRejectedValue(new Error('DB error'));

    const res = await service.findAll();

    expect(mockRepo.findAll).toHaveBeenCalled();
    expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.data).toBeNull();
  });
});
