const AWS = require('aws-sdk')
const cloudwatchlogs = new AWS.CloudWatchLogs()
const fetch = require('node-fetch')
const logger = require('./utils/logger')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  return await logger(true, `sending getTest`)
  // return Promise.resolve()
  // return await fetch('https://api.ipify.org?format=json')
  //   .then(resp => resp.json())
}
