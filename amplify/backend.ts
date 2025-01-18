import { defineBackend } from '@aws-amplify/backend';
import { Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  Cors,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";

import { auth } from './auth/resource';
import { data } from './data/resource';
import { apiTestFunction } from './functions/api-test/resource';
import { apiTest2Function } from './functions/api-test2/resource';

const backend = defineBackend({
  auth,
  data,
  apiTestFunction,
  apiTest2Function,
});

// Create API stack
const apiStack = backend.createStack("api-stack");

// Create REST API
const testApi = new RestApi(apiStack, "TestApi", {
  restApiName: "test-api",
  deploy: true,
  deployOptions: {
    stageName: "dev",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

// Create Lambda integrations
const lambdaIntegration = new LambdaIntegration(
  backend.apiTestFunction.resources.lambda
);
const lambda2Integration = new LambdaIntegration(
  backend.apiTest2Function.resources.lambda
);

// Create test endpoints with NO auth
const testPath = testApi.root.addResource("test", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});

const test2Path = testApi.root.addResource("test2", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE,
  },
});

// Add GET methods
testPath.addMethod("GET", lambdaIntegration);
test2Path.addMethod("GET", lambda2Integration);

// Add outputs
backend.addOutput({
  custom: {
    API: {
      [testApi.restApiName]: {
        endpoint: testApi.url,
        region: Stack.of(testApi).region,
        apiName: testApi.restApiName,
      },
    },
  },
});
