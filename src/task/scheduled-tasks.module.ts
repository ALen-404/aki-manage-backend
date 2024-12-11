import { Module } from '@nestjs/common';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { ScheduleModule } from '@nestjs/schedule';
import { FirestoreConfig } from 'src/firestore.config';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [ScheduledTasksService, FirestoreConfig],
})
export class ScheduledTasksModule {}
