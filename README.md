# serverless-simplify-log-group-policy-plugin

> Fixes "IamRoleLambdaExecution - Maximum policy size of 10240 bytes exceeded" error

This plugin works by modifying the CloudFormation stack before deployment.

It searches for the `IamRoleLambdaExecution` resource and modifies the only policy attached to this role.

Notably, it simplifies any logGroup statements, keeping other statements that may be a part of this same policy.

## Install

```
$ yarn add --dev @ojboj/serverless-simplify-log-group-policy-plugin
```

## Usage

In your `serverless.yml` file:

```yaml
plugins:
  - "@ojboj/serverless-simplify-log-group-policy-plugin"
```

## Explanation

By default, Serverless framework creates such roles:

```json5
{
  Effect: "Allow",
  Action: ["logs:CreateLogStream", "logs:CreateLogGroup"],
  Resource: [
    {
      "Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/production-users-createUser:*",
    },
    {
      "Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/production-users-updateUser:*",
    },
    {
      "Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/production-users-deleteUser:*",
    },
    // dozens of identical lines
  ],
}
```

When you reach a certain project size, deployment will fail since this role will exceed 10 KB limit.

This plugin simplifies the above execution role something akin to this:

```json5
{
  Effect: "Allow",
  Action: ["logs:CreateLogStream", "logs:CreateLogGroup"],
  Resource: [
    {
      "Fn::Sub": "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:*",
    },
  ],
}
```

## Publish

```sh
$ git checkout master
$ yarn version
$ yarn publish
$ git push origin master --tags
```

## License

Originally:
MIT © [Shelf](https://shelf.io) - [shelfio/serverless-simplify-default-exec-role-plugin](https://github.com/shelfio/serverless-simplify-default-exec-role-plugin)

Modified to keep other statements on same policy by ojboj.
