const { mbFetch, logger, writeToDynamo } = require('./utils')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item, session } = event
  await logger(session, `fetching contract type: ${item.id} - ${item.contractName}`)
  const url = `https://clients.mindbodyonline.com/Contract/?id=${item.id}`
  const fetchParams = {
    session,
    url,
    options: {},
    parser: 'contractTypeParser'
  }
  const contractType = await mbFetch(fetchParams)
  return writeToDynamo('contractTypeId', { ...item, ...contractType }, 'ContractTypesTable')
}
