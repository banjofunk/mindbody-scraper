const fetch = require('node-fetch')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const url = 'https://api.ipify.org?format=json'
  const ip = await fetch(url)
    .then(resp => resp.json())

  return ip
}
