#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkWorkshopStack } from '../lib/cdk-entry-stack';

const app = new cdk.App();
new CdkWorkshopStack(app, 'CdkEntryStack', {
  env: {
    account: "add your account id here",
    region: "add your region here",
  },
});
