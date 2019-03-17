const AWS = require('aws-sdk')
const ec2 = new AWS.EC2({apiVersion: '2016-11-15'})

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const natParams = {
    AllocationId: process.env.allocationId,
    SubnetId: process.env.subnetId
  };
  const natId = await ec2.createNatGateway(natParams).promise()
    .then(data => {
      console.log('nat data', data)
      return data.NatGateway.NatGatewayId
    })
  const waitParams = {
    Filter: [
      {
        Name: "nat-gateway-id",
        Values: [natId]
      }
    ]
  }
  await ec2.waitFor('natGatewayAvailable', waitParams).promise()
  const routeParams = {
    DestinationCidrBlock: "0.0.0.0/0",
    GatewayId: natId,
    RouteTableId: process.env.routeTableId
   }
  const routeData = await ec2.createRoute(routeParams).promise()
    .then(data => {
      console.log('routeData', data)
      return data
    })
  return { natId, routeData }
}
