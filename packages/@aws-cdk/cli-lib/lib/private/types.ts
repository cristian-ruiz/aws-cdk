// eslint-disable-next-line import/no-extraneous-dependencies
import * as cxapi from '@aws-cdk/cx-api';
import { AwsCdkCliFromDirectoryProps } from '../cli';

/**
 * Internal props for a private constructor
 */
export interface InternalAwsCdkCliProps extends AwsCdkCliFromDirectoryProps {
  readonly synthesizer?: () => Promise<cxapi.CloudAssembly>
}
