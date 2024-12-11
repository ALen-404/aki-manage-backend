export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  graphql: GraphqlConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface GraphqlConfig {
  codefirst: {
    playgroundEnabled: boolean;
    debug: boolean;
    schemaDestination: string;
    sortSchema: boolean;
  };
  schemafirst: {
    playgroundEnabled: boolean;
    typePaths: string[];
    definitions: {
      path: string;
    };
  };
}
