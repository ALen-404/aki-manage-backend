import type { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 3000,
  },
  cors: {
    enabled: true,
  },
  graphql: {
    codefirst: {
      playgroundEnabled: true,
      debug: true,
      schemaDestination: 'src/graphql/schemas/schema.graphql',
      sortSchema: true,
    },
    schemafirst: {
      playgroundEnabled: true,
      typePaths: ['src/graphql/schemas/schema.graphql'],
      definitions: {
        path: 'src/graphql/types/graphql-types.ts',
      },
    },
  },
};

export default (): Config => config;
