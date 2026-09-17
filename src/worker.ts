import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  Logger.log('Worker process started, listening for jobs...', 'Worker');

  // Keep the process alive
  process.on('SIGINT', () => {
    void (async () => {
      await app.close();
      process.exit(0);
    })();
  });
}

void bootstrap();
