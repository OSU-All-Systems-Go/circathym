import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { TimerServiceStruct } from '../structs/timer';
import { AccountStageRegionSettings } from '../types';

// const ALLOWED_STAGES = ['stg', 'dev', 'prd'];

const ACCOUNT_STAGE_SETTINGS: AccountStageRegionSettings = {
  prd: {
    'us-east-2': {
      accountId: '429912451987',
      domainName: 'api.crt.osu-allsystemsgo.com',
      certificateArn:
        'arn:aws:acm:us-east-2:429912451987:certificate/816f9e20-4dc1-477e-9eac-a58e3a3ffe72',
    },
  },
};

class TimerService extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props);

    // const stage = this.node.tryGetContext('stage');

    // if (!stage || !ALLOWED_STAGES.includes(stage)) {
    //   throw new Error('Invalid stage. Must be one of: [stg, dev, prd]');
    // }

    // const region: string = this.node.tryGetContext('region') ?? 'us-east-1';

    const stage = 'prd';
    const region = 'us-east-2';

    const accountSettings = ACCOUNT_STAGE_SETTINGS[stage][region];

    new TimerServiceStruct(this, 'TimerServiceStruct', {
      region,
      stage,
      accountSettings,
    });
  }
}

const app = new cdk.App();

const accountEnv =
  process.env.CDK_DEPLOY_ACCOUNT_ID ??
  process.env.CDK_DEFAULT_ACCOUNT_ID ??
  process.env.AWS_DEFAULT_ACCOUNT;
const regionEnv =
  process.env.CDK_DEPLOY_REGION ??
  process.env.CDK_DEFAULT_REGION ??
  process.env.AWS_DEFAULT_REGION ??
  'us-east-1';

new TimerService(app, 'TimerServiceStack', {
  stackName: 'TimerServiceStack',
  env: {
    account: accountEnv,
    region: regionEnv,
  },
});

app.synth();
