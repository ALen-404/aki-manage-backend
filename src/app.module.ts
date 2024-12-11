import config from './common/configs/config';
import { GraphQLSetupModule } from './graphql/graphql-setup.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirestoreConfig } from './firestore.config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AppResolver } from './app.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    ScheduleModule.forRoot(),
    GraphQLSetupModule,
    JwtModule.register({
      secret: '4YnqqKz8lqdtqasjNCyOOZRDHz4lWyKw', // 请使用更安全的密钥
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FirestoreConfig,
    PrismaService,
    JwtStrategy,
    AppResolver,
  ],
})
export class AppModule {}
