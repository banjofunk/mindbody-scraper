const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dig = require('object-dig')
const qs = require('querystring')
const getToken = require('./utils/getToken')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });


let token = false
exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false
  token = token || await getToken()
  const url = 'https://clients.mindbodyonline.com/servicesandpricing/classes'
  const headers = {
    "Cookie": token,
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36"
  }
  return await fetch(url, { headers })
  .then(resp => resp.text())
  .then(async resp => {
    const $ = cheerio.load(resp)
    const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
    if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
      token = await getToken()
      return false
    }

    const classCategories = $('.serviceCatName').get().map(cat => {
      return {
        id: $(cat).parents('.js-serviceCategory').data('id'),
        name: $(cat).text(),
        active: $(cat).parents('.inactiveWrapper').length === 0
      }
    })

    const classTypes = $('.classTitle.className').get().map(cl => {
      const query = $(cl).attr('href').split('?')[1]
      const params = qs.parse(query)
      const activeClass = !$(cl).parents('tr').attr('class').includes('hidden')
      const activeCat = $(cl).parents('.inactiveWrapper').length === 0
      return { ...params,
        name: $(cl).text().trim(),
        active: activeClass && activeCat
      }
    })

    return { classCategories, classTypes }
  })
}
