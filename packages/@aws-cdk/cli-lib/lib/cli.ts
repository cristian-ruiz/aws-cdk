import * as core from '@aws-cdk/core';
import { StageSynthesisOptions } from '@aws-cdk/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import { exec as runCli } from 'aws-cdk/lib';
import { Construct } from 'constructs';
import { SharedOptions, DeployOptions, DestroyOptions, SynthOptions, ListOptions, StackActivityProgress } from './commands';
import { InternalAwsCdkCliProps } from './private/types';

/**
 * AWS CDK CLI operations
 */
export interface IAwsCdk {
  /**
   * cdk list
   */
  list(options?: ListOptions): Promise<void>;

  /**
   * cdk synth
   */
  synth(options?: SynthOptions): Promise<void>;

  /**
   * cdk deploy
   */
  deploy(options?: DeployOptions): Promise<void>;

  /**
   * cdk destroy
   */
  destroy(options?: DestroyOptions): Promise<void>;
}

/**
 * Options to create an AWS CDK API from a directory
 */
export interface AwsCdkCliFromDirectoryProps {
  /**
   * the directory the AWS CDK app is in
   *
   * @default - current working directory
   */
  readonly directory?: string

  /**
   * command-line for executing your app or a cloud assembly directory
   * e.g. "node bin/my-app.js"
   * or
   * "cdk.out"
   *
   * @default - read from cdk.json
   */
  readonly app?: string
}

/**
 * Provides a programmatic interface for interacting with the CDK CLI by
 * wrapping the CLI with exec
 */
export class AwsCdkCli extends Construct implements IAwsCdk {

  /**
   * Create an AwsCdkCli from an App
   */
  public static fromApp(app: core.App, id?: string, options: StageSynthesisOptions = {}) {
    return AwsCdkCli.fromStage(app, id, options);
  }

  /**
   * Create an AwsCdkCli from a Stage
   */
  public static fromStage(stage: core.Stage, id?: string, options: StageSynthesisOptions = {}) {
    const cx = stage.synth(options);
    return new AwsCdkCli(stage, id ?? 'AwsCdkCli', {
      synthesizer: async () => cx,
    });
  }

  /**
   * Create an AwsCdkCli from a directory
   */
  public static fromDirectory(props: AwsCdkCliFromDirectoryProps = {}) {
    return new AwsCdkCli(undefined as any, 'AwsCdkCli', props);
  }

  private constructor(scope: Construct, id: string, private readonly props: InternalAwsCdkCliProps) {
    super(scope, id);
  }

  private async exec(args: string[]) {
    const originalWorkingDir = process.cwd();
    if (this.props.directory) {
      process.chdir(this.props.directory);
    }

    const result = await runCli(args, this.props.synthesizer as any);

    if (this.props.directory) {
      process.chdir(originalWorkingDir);
    }

    return result;
  }

  public async list(options: ListOptions = {}) {
    const listCommandArgs: string[] = [
      ...renderBooleanArg('long', options.long),
      ...this.createDefaultArguments(options),
    ];

    await this.exec(['ls', ...listCommandArgs]);
  }
  /**
   * cdk deploy
   */
  public async deploy(options: DeployOptions = {}) {
    const deployCommandArgs: string[] = [
      ...renderBooleanArg('ci', options.ci),
      ...renderBooleanArg('execute', options.execute),
      ...renderBooleanArg('exclusively', options.exclusively),
      ...renderBooleanArg('force', options.force),
      ...renderBooleanArg('previous-parameters', options.usePreviousParameters),
      ...renderBooleanArg('rollback', options.rollback),
      ...renderBooleanArg('staging', options.staging),
      ...options.reuseAssets ? renderArrayArg('--reuse-assets', options.reuseAssets) : [],
      ...options.notificationArns ? renderArrayArg('--notification-arns', options.notificationArns) : [],
      ...options.parameters ? renderMapArrayArg('--parameters', options.parameters) : [],
      ...options.outputsFile ? ['--outputs-file', options.outputsFile] : [],
      ...options.requireApproval ? ['--require-approval', options.requireApproval] : [],
      ...options.changeSetName ? ['--change-set-name', options.changeSetName] : [],
      ...options.toolkitStackName ? ['--toolkit-stack-name', options.toolkitStackName] : [],
      ...options.progress ? ['--progress', options.progress] : ['--progress', StackActivityProgress.EVENTS],
      ...this.createDefaultArguments(options),
    ];

    await this.exec(['deploy', ...deployCommandArgs]);
  }

  /**
   * cdk destroy
   */
  public async destroy(options: DestroyOptions = {}) {
    const destroyCommandArgs: string[] = [
      ...options.requireApproval ? [] : ['--force'],
      ...renderBooleanArg('exclusively', options.exclusively),
      ...this.createDefaultArguments(options),
    ];

    await this.exec(['destroy', ...destroyCommandArgs]);
  }

  /**
   * cdk synth
   */
  public async synth(options: SynthOptions = {}) {
    const synthCommandArgs: string[] = [
      ...renderBooleanArg('validation', options.validation),
      ...renderBooleanArg('quiet', options.quiet),
      ...renderBooleanArg('exclusively', options.exclusively),
      ...this.createDefaultArguments(options),
    ];

    await this.exec(['synth', ...synthCommandArgs]);
  }

  /**
   * Configure default arguments shared by all commands
   */
  private createDefaultArguments(options: SharedOptions): string[] {
    const stacks = options.stacks ?? ['--all'];
    return [
      ...this.defaultAppArgument(),
      ...renderBooleanArg('strict', options.strict),
      ...renderBooleanArg('trace', options.trace),
      ...renderBooleanArg('lookups', options.lookups),
      ...renderBooleanArg('ignore-errors', options.ignoreErrors),
      ...renderBooleanArg('json', options.json),
      ...renderBooleanArg('verbose', options.verbose),
      ...renderBooleanArg('debug', options.debug),
      ...renderBooleanArg('ec2creds', options.ec2Creds),
      ...renderBooleanArg('version-reporting', options.versionReporting),
      ...renderBooleanArg('path-metadata', options.pathMetadata),
      ...renderBooleanArg('asset-metadata', options.assetMetadata),
      ...renderBooleanArg('notices', options.notices),
      ...renderBooleanArg('color', options.color),
      ...options.context ? renderMapArrayArg('--context', options.context) : [],
      ...options.profile ? ['--profile', options.profile] : [],
      ...options.proxy ? ['--proxy', options.proxy] : [],
      ...options.caBundlePath ? ['--ca-bundle-path', options.caBundlePath] : [],
      ...options.roleArn ? ['--role-arn', options.roleArn] : [],
      ...options.output ? ['--output', options.output] : [],
      ...stacks,
    ];
  }

  private defaultAppArgument(): string[] {
    if (this.props.synthesizer || !this.props.app) {
      return [];
    }

    return ['--app', this.props.app];
  }
}

function renderMapArrayArg(flag: string, parameters: { [name: string]: string | undefined }): string[] {
  const params: string[] = [];
  for (const [key, value] of Object.entries(parameters)) {
    params.push(`${key}=${value}`);
  }
  return renderArrayArg(flag, params);
}

function renderArrayArg(flag: string, values?: string[]): string[] {
  let args: string[] = [];
  for (const value of values ?? []) {
    args.push(flag, value);
  }
  return args;
}

function renderBooleanArg(arg: string, value?: boolean): string[] {
  if (value) {
    return [`--${arg}`];
  } else if (value === undefined) {
    return [];
  } else {
    return [`--no-${arg}`];
  }
}