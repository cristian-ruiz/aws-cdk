/* eslint-disable jest/no-commented-out-tests */
import { join } from 'path';
import * as core from '@aws-cdk/core';
import * as cli from 'aws-cdk/lib';
import { AwsCdkCli } from '../lib';

// These tests synthesize an actual CDK app and take a bit longer
jest.setTimeout(20_000);

jest.mock('aws-cdk/lib', () => {
  const original = jest.requireActual('aws-cdk/lib');
  return {
    ...original,
    exec: jest.fn(original.exec),
  };
});
const stdoutMock = jest.spyOn(process.stdout, 'write').mockImplementation(() => { return true; });

beforeEach(() => {
  stdoutMock.mockClear();
  jest.mocked(cli.exec).mockClear();
});

describe('fromApp', () => {
  const app = new core.App();
  new core.Stack(app, 'Stack1');
  new core.Stack(app, 'Stack2');

  const cdk = AwsCdkCli.fromApp(app);

  test('can list all stacks in app', async () => {
    // WHEN
    await cdk.list();

    // THEN
    expect(jest.mocked(cli.exec)).toHaveBeenCalledWith(
      ['ls', '--all'],
      expect.anything(),
    );
    expect(stdoutMock.mock.calls[0][0]).toContain('Stack1');
    expect(stdoutMock.mock.calls[1][0]).toContain('Stack2');
  });
});

describe('fromStage', () => {
  const stage = new core.Stage(new core.App(), 'Stage');
  new core.Stack(stage, 'Stack1');
  new core.Stack(stage, 'Stack2');

  const cdk = AwsCdkCli.fromStage(stage);

  test('can list all stacks in stage', async () => {
    // WHEN
    await cdk.list();

    // THEN
    expect(jest.mocked(cli.exec)).toHaveBeenCalledWith(
      ['ls', '--all'],
      expect.anything(),
    );
    expect(stdoutMock.mock.calls[0][0]).toContain('Stage/Stack1');
    expect(stdoutMock.mock.calls[1][0]).toContain('Stage/Stack2');
  });
});


describe('fromDirectory', () => {
  const cdk = AwsCdkCli.fromDirectory({
    directory: join(__dirname, 'test-app'),
  });

  test('can list all stacks in cdk app', async () => {
    // WHEN
    await cdk.list();

    // THEN
    expect(jest.mocked(cli.exec)).toHaveBeenCalledWith(
      ['ls', '--all'],
      undefined,
    );
    expect(stdoutMock.mock.calls[0][0]).toContain('AppStack1');
    expect(stdoutMock.mock.calls[1][0]).toContain('AppStack2');
  });
});

describe('fromDirectory with custom app', () => {
  const cdk = AwsCdkCli.fromDirectory({
    directory: join(__dirname, 'test-app'),
    app: 'node -r ts-node/register app.ts',
  });


  test('can list all stacks in cdk app', async () => {
    // WHEN
    await cdk.list();

    // THEN
    expect(jest.mocked(cli.exec)).toHaveBeenCalledWith(
      ['ls', '--app', 'node -r ts-node/register app.ts', '--all'],
      undefined,
    );
    expect(stdoutMock.mock.calls[0][0]).toContain('AppStack1');
    expect(stdoutMock.mock.calls[1][0]).toContain('AppStack2');
  });
});
