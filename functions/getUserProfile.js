const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const dig = require('./utils/dig')
const writeToDynamo = require('./utils/writeToDynamo')
const qs = require('querystring')

let session
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { item } = event
  session = event.session
  await logger(session, `fetching user: ${item.id} - ${item.firstName} ${item.lastName}`)
  let client = await fetchClient(item.id)
  console.log(`input: ${item.id}, output: ${client.id}`)
  if(!client.id){ client = await searchForClient(item) }
  if(!client.id){
    client = parseMinClient(item)
    console.log('rejected client', client)
  }
  return writeToDynamo('clientId', client, 'ClientsTable')
}

const fetchClient = (id) => {
  const url = 'https://clients.mindbodyonline.com/asp/adm/adm_clt_profile.asp'
  const query = qs.stringify({ id })
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    parser: 'userProfileParser'
  }
  return mbFetch(fetchParams)
}

const searchForClient = async (clientParams) => {
  const { id, email, phone } = clientParams
  let client = false
  if(!client.id){ client = await searchByField(id) }
  if(!client.id){ client = await searchByField(email) }
  if(!client.id){ client = await searchByField(phone) }
  return client
}

const searchByField = async (value) => {
  const url = 'https://clients.mindbodyonline.com/clientsearch/clientlookup'
  const params = {
    searchText: value,
    filters: 'Name,ID,Phone,Email',
    maxReturned:30,
    returnInactive:true
  }
  const query = qs.stringify(params)
  const fetchParams = {
    session,
    url: `${url}?${query}`,
    options: {},
    respType: 'json'
  }
  const clientId = await mbFetch(fetchParams)
    .then(resp => {
      console.log(`${params.searchText} resp:`, resp)
      return resp.length === 1 ? dig(resp, '0', 'ID') : false
    })
  return clientId ? fetchClient(clientId) : false
}

const parseMinClient = client => ({
  id: client.id,
  barcode: '',
  name:{
    firstName: client.firstName,
    middleName: '',
    lastName: client.firstName,
    nickname: ''
  },
  email: client.email,
  phone: {
    cellPhone: client.phone,
    homePhone: '',
    workPhone: '',
    workPhoneExt: ''
  }
})
