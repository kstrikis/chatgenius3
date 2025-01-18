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
import { chatFunction } from './functions/chat/resource';



const backend = defineBackend({
  auth,
  data,
  apiTestFunction,
  apiTest2Function,
  chatFunction,
});

// Create API stack
const apiStack = backend.createStack("api-stack");

// Create REST API
const testApi = new RestApi(apiStack, "TestApi", {
  restApiName: "test-api",
  deploy: true,
  deployOptions: {
    stageName: process.env.NODE_ENV === "development" ? "dev" : "prod",
  },
  defaultCorsPreflightOptions: {
    allowOrigins: [
      process.env.NODE_ENV === "development" 
        ? "http://localhost:5173"
        : "https://chatgenius.kriss.cc"
    ],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "X-Amz-Date",
      "Authorization",
      "X-Api-Key",
      "X-Amz-Security-Token"
    ],
  },
});

// Create Lambda integrations
const lambdaIntegration = new LambdaIntegration(
  backend.apiTestFunction.resources.lambda
);
const lambda2Integration = new LambdaIntegration(
  backend.apiTest2Function.resources.lambda
);
const chatIntegration = new LambdaIntegration(
  backend.chatFunction.resources.lambda
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

const chatPath = testApi.root.addResource("chat", {
  defaultMethodOptions: {
    authorizationType: AuthorizationType.NONE, // Future: Change to COGNITO
  },
});

// Add methods
testPath.addMethod("GET", lambdaIntegration);
test2Path.addMethod("GET", lambda2Integration);
chatPath.addMethod("POST", chatIntegration);

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
