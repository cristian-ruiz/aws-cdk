# AWS CDK CLI Library
<!--BEGIN STABILITY BANNER-->

---

![cdk-constructs: Experimental](https://img.shields.io/badge/cdk--constructs-experimental-important.svg?style=for-the-badge)

> The APIs of higher level constructs in this module are experimental and under active development.
> They are subject to non-backward compatible changes or removal in any future version. These are
> not subject to the [Semantic Versioning](https://semver.org/) model and breaking changes will be
> announced in the release notes. This means that while you may use them, you may need to update
> your source code when upgrading to a newer version of this package.

---

<!--END STABILITY BANNER-->

## Overview

This package provides a library to interact with the AWS CDK CLI programmatically.

Currently this package provides integrations for:

- `cdk deploy`
- `cdk synth`
- `cdk destroy`
- `cdk list`

## Usage

First create a new `AwsCdkCli` construct from an existing `App` or `Stage`:

```ts fixture=imports
declare const app: core.App;
const cdk = AwsCdkCli.fromApp(app);
```

```ts fixture=imports
declare const stage: core.Stage;
const cdk = AwsCdkCli.fromStage(stage);
```

### list

```ts
await cdk.list({
  stacks: ['*'],
});
```

### synth

```ts
await cdk.synth({
  stacks: ['MyTestStack'],
});
```

### deploy

```ts
await cdk.deploy({
  stacks: ['MyTestStack'],
});
```

### destroy

```ts
await cdk.destroy({
  stacks: ['MyTestStack'],
});
```
