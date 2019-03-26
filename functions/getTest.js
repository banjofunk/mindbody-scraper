// const AWS = require('aws-sdk')
// const cloudwatchlogs = new AWS.CloudWatchLogs()
// const fetch = require('node-fetch')
// const logger = require('./utils/logger')

// exports.handler = async (event, context) => {
//   context.callbackWaitsForEmptyEventLoop = false
//   return await fetch('https://api.ipify.orgz?format=json')
//     .then(resp => resp.json())
//     .catch(err => {return Promise.reject(err)})
// }

const cheerio = require('cheerio')
const runScraper = () => {
  const $ = cheerio.load(resp)
  const test = $('h1').text()
  console.log('cheerio', test)
}

const resp = `
<html><body><h1>yourtest</h1></body></html>
`
runScraper()
