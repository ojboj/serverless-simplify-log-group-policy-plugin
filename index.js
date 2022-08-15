"use strict";

const simplifiableLogGroupActions = [
  "logs:CreateLogStream",
  "logs:CreateLogGroup",
  "logs:PutLogEvents",
];

const policyStatements = [
  {
    Effect: "Allow",
    Action: simplifiableLogGroupActions,
    Resource: [
      {
        "Fn::Sub":
          "arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:*",
      },
    ],
  },
];

class SimplifyDefaultExecRole {
  constructor(serverless) {
    this.hooks = {
      "before:package:finalize": function () {
        simplifyBaseIAMLogGroups(serverless);
      },
    };
  }
}

function simplifyBaseIAMLogGroups(serverless) {
  const resourceSection =
    serverless.service.provider.compiledCloudFormationTemplate.Resources;

  for (const key in resourceSection) {
    if (key === "IamRoleLambdaExecution") {
      // Get current statement
      const statement = [
        ...resourceSection[key].Properties.Policies[0].PolicyDocument.Statement,
      ];
      // Filter out any statemets that are just log group related
      const logGroupLessStatement = statement.filter(
        (s) => !s.Action.every((a) => reducableLogGroupActions.includes(a))
      );
      // Build new statement, adding the simplified log group statements
      const newStatement = [...logGroupLessStatement, ...policyStatements];

      // Set new statement, now with simplified log group statement
      resourceSection[
        key
      ].Properties.Policies[0].PolicyDocument.Statement = newStatement;
    }
  }
}

module.exports = SimplifyDefaultExecRole;
