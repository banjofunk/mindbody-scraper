const AWS = require('aws-sdk')
const lambda = new AWS.Lambda()
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const parseResp = require('./utils/parseResp')
const userAgent = 'Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36'
const FormData = require('form-data')

let version = 0
let token, params
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  console.log('event', event)
  const { url, options, session, parser, respType, form } = event
  await getToken(session)
  let resp = await fetchWithToken(url, options, token, respType, form)
    .catch(err => Promise.reject(err))
  for (const i of Array(5).fill(0)) {
    if(resp) { break } else {
      console.log('token failed')
      token = await getToken(session, true)
      resp = await fetchWithToken(url, options, token, respType, form)
        .catch(err => Promise.reject(err))
    }
  }
  console.log('parse and return')
  return parser ? parseResp(parser, resp) : resp
}

const fetchWithToken = async (url, options, token, respType, form) => {
  console.log('url', url)
  if(!options.headers) { options.headers = {} }
  if(form){
    const formBody = new FormData()
    for(const key of Object.keys(form)){
      formBody.append(key, form[key])
    }
    options.body = formBody  
  }
  options.headers['Cookie'] = token
  options.headers['User-Agent'] = userAgent
  if(respType === 'json'){
    return await fetch(url, options)
      .then(resp => resp.json())
  }else{
    return await fetch(url, options)
      .then(resp => resp.text())
      .then(resp => {
        const $ = cheerio.load(resp)
        const firstScript = ($('body > script').eq(0).html() || '').trim()
        if(firstScript === 'mb.sessionHelpers.resetSession();'){
          return false
        }
        // const error = $('.error-main-header')
        // if(error){
        //   return Promise.reject(error.text())
        // }
        return resp
      })
      .catch(err => {
        console.log('err', err)
        return Promise.reject()
      })
  }
}

const getToken = async (session, getNew=false) => {
  params = {
    FunctionName: `mindbody-scraper-${process.env.stage}-getToken`,
    Payload: JSON.stringify({ getNew, version, session })
  }
  return await lambda.invoke(params).promise()
    .then(data => {
      const tokenResp = JSON.parse(data.Payload)
      token = tokenResp.token
      version = tokenResp.version
      return Promise.resolve()
    })
}
