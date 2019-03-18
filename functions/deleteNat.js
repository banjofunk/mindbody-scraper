const AWS = require('aws-sdk')
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const params = {
    Filter: [
      { Name: "vpc-id", Values: [ process.env.vpcId ] },
      { Name: "state", Values: [ "pending", "available" ] }
    ]
  }
  const natIds = await ec2.describeNatGateways(params).promise()
    .then(data => {
      return data.NatGateways.map(nat => nat.NatGatewayId)
    })
  const routeTableIds = []
  await Promise.all(natIds.map(natId => {
    const params = {
      Filters: [
        { Name: "route.nat-gateway-id", Values: [ natId ] }
      ]
    }
    return ec2.describeRouteTables(params).promise()
      .then(data => {
        data.RouteTables.forEach(table => {
          routeTableIds.push(table.RouteTableId)
        })
        return Promise.resolve()
      })
  }))
  await Promise.all(routeTableIds.map(routeTableId => {
    var params = {
      DestinationCidrBlock: "0.0.0.0/0",
      RouteTableId: routeTableId
    };
    return ec2.deleteRoute(params).promise()
  }))

  await Promise.all(natIds.map(natId => {
    const params = { NatGatewayId: natId }
    return ec2.deleteNatGateway(params).promise()
  }))

  return Promise.resolve()
}
