// import { GraphQLDefinitionsFactory } from '@nestjs/graphql';

// const definitionsFactory = new GraphQLDefinitionsFactory();

// definitionsFactory.generate({
//   typePaths: ['src/graphql/schemas/schema.graphql'],
//   path: 'src/graphql/types/graphql-types.ts',
//   outputAs: 'class',
//   emitTypenameField: true,
// });

import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/schemas/schema.graphql',
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/graphql/types/graphql-types.ts': {
      plugins: ['typescript', 'typescript-operations'],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
