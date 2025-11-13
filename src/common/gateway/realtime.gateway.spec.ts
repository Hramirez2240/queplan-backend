import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { RealtimeGateway } from './realtime.gateway';
import { DbListenerService } from '../listener/db-listener.service';

describe('RealtimeGateway', () => {
  let gateway: RealtimeGateway;
  let dbListenerService: DbListenerService;
  let mockServer: Partial<Server>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    mockServer = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RealtimeGateway,
        {
          provide: DbListenerService,
          useValue: {
            onChange: undefined,
          },
        },
      ],
    }).compile();

    gateway = module.get<RealtimeGateway>(RealtimeGateway);
    dbListenerService = module.get<DbListenerService>(DbListenerService);
    gateway.server = mockServer as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('afterInit', () => {
    it('should set onChange callback on dbListenerService', () => {
      gateway.afterInit();

      expect(dbListenerService.onChange).toBeDefined();
      expect(typeof dbListenerService.onChange).toBe('function');
    });

    it('should emit db-change event when onChange is triggered', () => {
      gateway.afterInit();

      const payload = { action: 'INSERT', table: 'friends' };
      dbListenerService.onChange?.(payload);

      expect(mockServer.emit).toHaveBeenCalledWith('db-change', payload);
    });

    it('should log event emission', () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      gateway.afterInit();

      const payload = { action: 'UPDATE', id: 1 };
      dbListenerService.onChange?.(payload);

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Emitido evento db-change'),
      );
    });

    it('should handle multiple onChange calls', () => {
      gateway.afterInit();

      const payload1 = { action: 'INSERT', table: 'users' };
      const payload2 = { action: 'DELETE', id: 5 };

      dbListenerService.onChange?.(payload1);
      dbListenerService.onChange?.(payload2);

      expect(mockServer.emit).toHaveBeenCalledTimes(2);
      expect(mockServer.emit).toHaveBeenNthCalledWith(1, 'db-change', payload1);
      expect(mockServer.emit).toHaveBeenNthCalledWith(2, 'db-change', payload2);
    });

    it('should handle null payload', () => {
      gateway.afterInit();

      dbListenerService.onChange?.(null);

      expect(mockServer.emit).toHaveBeenCalledWith('db-change', null);
    });
  });
});
