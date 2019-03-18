const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    convertEmptyValues: true
})

module.exports = async (keyName, obj, tableName) => {
  const attributeUpdates = Object.assign(
    ...Object.entries(obj).map( ob =>
      ({[ob[0]]:{ Action: 'PUT', Value: ob[1] }})
    )
  )
  const dynamoParamsb = {
    Key : Object.assign({[keyName]: String(obj.id)}),
    AttributeUpdates : attributeUpdates,
    TableName : tableName
  };
  return await dynamo.update(dynamoParamsb).promise()
    .then(data => { console.log('processed queue: ', obj.id) })
    .catch(err => { console.log('dynamo err', obj.id, err) })
}
