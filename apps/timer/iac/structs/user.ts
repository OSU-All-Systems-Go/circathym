import * as path from 'node:path';

import { Duration, Stack, RemovalPolicy } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as api from 'aws-cdk-lib/aws-apigatewayv2';
import * as apiIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';

import { TimerServiceProps } from '../types';

export class TimerServiceStruct extends Construct {
  constructor(parent: Stack, name: string, props: TimerServiceProps) {
    super(parent, name);

    const timerTable = new dynamodb.Table(this, 'TimerTable', {
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      tableName: `crt-timer-${props.stage}-${props.region}`,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const restLambda = new lambdaNodeJs.NodejsFunction(this, 'timerRest', {
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'apps/timer/src/lambda.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist'), {
        bundling: {
          image: lambda.Runtime.NODEJS_24_X.bundlingImage,
          timer: 'root',
          command: [
            'bash',
            '-c',
            [
              'npm install --production', // Optional: compile TS to JS
              'cp -au . /asset-output', // Copy all built files to output
            ].join(' && '),
          ],
        },
      }),
      environment: {
        DEBUG: '*',
        USE_AWS: 'true',
        USERS_TABLE_NAME: timerTable.tableName,
      },
      timeout: Duration.seconds(300),
      functionName: `crt-timer-${props.region}`,
      bundling: {
        externalModules: ['@aws-sdk/*'],
      },
    });

    restLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:*'],
        resources: [timerTable.tableArn],
      }),
    );

    const integration = new apiIntegrations.HttpLambdaIntegration(
      'crtTimerRestApiIntegration',
      restLambda,
    );
    const httpApi = new api.HttpApi(this, 'crtTimerRestApi', {
      apiName: 'crtTimerRestApi',
      createDefaultStage: true,
      disableExecuteApiEndpoint: true,
      defaultIntegration: integration,
    });

    httpApi.addRoutes({
      integration,
      path: '/{proxy+}',
      methods: [api.HttpMethod.ANY],
    });
  }
}

export default TimerServiceStruct;
