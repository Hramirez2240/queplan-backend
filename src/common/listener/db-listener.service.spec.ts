import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { DbListenerService } from './db-listener.service';

jest.mock('pg', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    end: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  };
  return { Client: jest.fn(() => mockClient) };
});

describe('DbListenerService', () => {
  let service: DbListenerService;
  let mockClient: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DbListenerService],
    }).compile();

    service = module.get<DbListenerService>(DbListenerService);
    const { Client } = require('pg');
    mockClient = Client.mock.results[0]?.value || Client();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to PostgreSQL and listen to channel', async () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.PG_CHANNEL = 'test_channel';

      await service.onModuleInit();

      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('LISTEN test_channel');
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('notification', expect.any(Function));
    });

    it('should use default channel if PG_CHANNEL env var not set', async () => {
      delete process.env.PG_CHANNEL;
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';

      await service.onModuleInit();

      expect(mockClient.query).toHaveBeenCalledWith('LISTEN db_changes');
    });
  });

  describe('notification handling', () => {
    it('should parse and emit valid JSON payload', async () => {
      const onChange = jest.fn();
      service.onChange = onChange;

      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      await service.onModuleInit();

      const notificationHandler = mockClient.on.mock.calls.find(
        (call: any[]) => call[0] === 'notification',
      )?.[1];
      const payload = { action: 'INSERT', table: 'users' };

      notificationHandler({ payload: JSON.stringify(payload) });

      expect(onChange).toHaveBeenCalledWith(payload);
    });

    it('should handle empty payload gracefully', async () => {
      const onChange = jest.fn();
      service.onChange = onChange;

      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      await service.onModuleInit();

      const notificationHandler = mockClient.on.mock.calls.find(
        (call: any[]) => call[0] === 'notification',
      )?.[1];

      notificationHandler({ payload: null });

      expect(onChange).toHaveBeenCalledWith({});
    });

    it('should log error on invalid JSON', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      await service.onModuleInit();

      const notificationHandler = mockClient.on.mock.calls.find(
        (call: any[]) => call[0] === 'notification',
      )?.[1];

      notificationHandler({ payload: 'invalid json' });

      expect(errorSpy).toHaveBeenCalledWith(
        'Invalid JSON payload in NOTIFY',
        expect.any(Error),
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should close database connection', async () => {
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockClient.end).toHaveBeenCalled();
    });

    it('should not throw if client is undefined', async () => {
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});
