const AWS = require('aws-sdk')
const ssm = new AWS.SSM()
const fetch = require('node-fetch')
const setCookie = require('set-cookie-parser')
const FormData = require('form-data')

const userAgent = 'Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36'
const sessionUrl = 'https://clients.mindbodyonline.com/classic/home?studioid=6655'
const loginUrl = 'https://clients.mindbodyonline.com/Login?studioID=6655&isLibAsync=true&isJson=true'

let currentVersion = 0
let token
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { getNew, version, session } = event
  console.log('session', session)
  const { studioId } = session
  console.log('getNew', getNew)
  console.log('version', version)
  if(token){ console.log('---reusing token---') }
  if(getNew && currentVersion === version){
    console.log('---get new request---')
    currentVersion += 1
    token = await getNewToken(studioId)
  }
  token = token ? token : await getNewToken(studioId)
  return { token, version: currentVersion }
}

const getNewToken = async (studioId) => {
  console.log('---fetching token---')
  const ssmParams = {
    Name: `/mindbody-scraper/${process.env.stage}/studio/${studioId}`,
    WithDecryption: true
  };
  const creds = await ssm.getParameter(ssmParams).promise()
    .then(data => JSON.parse(data.Parameter.Value))
  const session = await fetch(sessionUrl, { headers: { 'User-Agent': userAgent } })
    .then(resp => resp.headers.get('set-cookie'))
    .then(combinedCookies => setCookie.splitCookiesString(combinedCookies))
    .then(parseCookies => setCookie.parse(parseCookies))
    .then(cookies => cookies.find(c => c.name === "SessionFarm%5FGUID"))
    .then(session => `${session.name}=${session.value}`)
  await fetch(sessionUrl, { headers: { 'User-Agent': userAgent, 'Cookie': session } })
  const form = new FormData()
  form.append('requiredtxtUserName', creds.username)
  form.append('requiredtxtPassword', creds.password)
  const token = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Cookie': session, 'User-Agent': userAgent },
    body: form
  })
    .then(resp => resp.headers.get('set-cookie'))
    .then(combinedCookies => setCookie.splitCookiesString(combinedCookies))
    .then(parseCookies => setCookie.parse(parseCookies))
    .then(cookies => {
      const idsrvauth = cookies.find(c => c.name === "idsrvauth")
      const idsrvauth1 = cookies.find(c => c.name === "idsrvauth1")
      return `${session};${idsrvauth.name}=${idsrvauth.value};${idsrvauth1.name}=${idsrvauth1.value};`
    })
  await fetch(sessionUrl, { headers: { 'User-Agent': userAgent, 'Cookie': token } })
  return token
}
