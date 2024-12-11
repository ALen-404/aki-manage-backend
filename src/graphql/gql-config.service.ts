import { GraphqlConfig } from '../common/configs/config.interface';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlOptionsFactory } from '@nestjs/graphql';

@Injectable()
export class GqlCodeFirstConfigService implements GqlOptionsFactory {
  constructor(private configService: ConfigService) {}
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql');
    return {
      // schema options
      autoSchemaFile: graphqlConfig.codefirst.schemaDestination,
      sortSchema: graphqlConfig.codefirst.sortSchema,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      // subscription
      installSubscriptionHandlers: true,
      includeStacktraceInErrorResponses: graphqlConfig.codefirst.debug,
      playground: graphqlConfig.codefirst.playgroundEnabled,
      context: ({ req }) => ({ req }),
    };
  }
}

@Injectable()
export class GqlSchemaFirstConfigService implements GqlOptionsFactory {
  constructor(private configService: ConfigService) {}
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql');

    return {
      typePaths: graphqlConfig.schemafirst.typePaths,
      definitions: graphqlConfig.schemafirst.definitions,
      playground: graphqlConfig.schemafirst.playgroundEnabled,
    };
  }
}
