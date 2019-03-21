const AWS = require('aws-sdk')
const cloudformation = new AWS.CloudFormation({apiVersion: '2010-05-15'})

exports.handler = async (event, context) => {
  console.log('adding nat to authStack')
  var params = {
    StackName: process.env.authStackName,
    TemplateURL: process.env.natOn,
  };
  return await cloudformation.updateStack(params).promise()
}
