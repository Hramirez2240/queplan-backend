import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DbListenerService implements OnModuleInit, OnModuleDestroy {
  private client!: Client;
  private readonly logger = new Logger(DbListenerService.name);
  onChange?: (payload: any) => void;

  async onModuleInit() {
    const channel = process.env.PG_CHANNEL || 'db_changes';
    const connStr = process.env.DATABASE_URL;

    this.client = new Client({ connectionString: connStr });
    await this.client.connect();
    this.logger.log(`Connected to Postgres. LISTEN ${channel}`);

    await this.client.query(`LISTEN ${channel}`);

    this.client.on('error', (err) => {
      this.logger.error('Error in PG client', err);
    });

    this.client.on('notification', (msg) => {
      try {
        const payload = JSON.parse(msg.payload ?? '{}');
        this.onChange?.(payload);
      } catch (e) {
        this.logger.error('Invalid JSON payload in NOTIFY', e as Error);
      }
    });
  }

  async onModuleDestroy() {
    await this.client?.end();
  }
}
