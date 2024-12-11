import { GqlSchemaFirstConfigService } from './gql-config.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GqlSchemaFirstConfigService,
    }),
    ConfigModule,
  ],
  providers: [GqlSchemaFirstConfigService],
  exports: [GraphQLModule],
})
export class GraphQLSetupModule {}
