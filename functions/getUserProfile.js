const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dig = require('object-dig')
const getToken = require('./utils/getToken')
const qs = require('querystring')
const moment = require('moment')
const AWS = require('aws-sdk')

const dynamo = new AWS.DynamoDB.DocumentClient({
    region: 'us-west-2',
    convertEmptyValues: true
})

let token = false
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  token = token || await getToken()

  const records = event.Records
  await Promise.all(records.map( async record => {
    const { receiptHandle, body } = record
    const clientRecord = JSON.parse(body)
    const { id } = clientRecord

    const url = 'https://clients.mindbodyonline.com/asp/adm/adm_clt_profile.asp'
    const headers = {
      "Cookie": token,
      "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36"
    }
    const query = qs.stringify({ id })
    const client = await fetch(`${url}?${query}`, { headers })
      .then(resp => resp.text())
      .then(resp => parseClientPage(resp))

    const dynamoParamsb = {
      Key : {
        "clientId" : String(client.id)
      },
      AttributeUpdates : {
        "id": { Action: 'PUT', Value: client.id },
        "barcode": { Action: 'PUT', Value: client.barcode },
        "name": { Action: 'PUT', Value: client.name },
        "email": { Action: 'PUT', Value: client.email },
        "phone": { Action: 'PUT', Value: client.phone },
        "address": { Action: 'PUT', Value: client.address },
        "billing": { Action: 'PUT', Value: client.billing },
        "notes": { Action: 'PUT', Value: client.notes },
        "memberStatus": { Action: 'PUT', Value: client.memberStatus },
        "gender": { Action: 'PUT', Value: client.gender },
        "birthday": { Action: 'PUT', Value: client.birthday },
        "location": { Action: 'PUT', Value: client.location },
        "createdOn": { Action: 'PUT', Value: client.createdOn },
        "relationships": { Action: 'PUT', Value: client.relationships },
        "emergencyContact": { Action: 'PUT', Value: client.emergencyContact },
        "reminderEmails": { Action: 'PUT', Value:  client.reminderEmails }
      },
      TableName : 'ClientsTable'
    };
    return dynamo.update(dynamoParamsb).promise()
      .then(data => { console.log('processed queue: ', client.id) })
      .catch(err => { console.log('dynamo err', client.id, err) })
  }))
  return Promise.resolve()
}


const parseClientPage = (resp) => {
  const $ = cheerio.load(resp)
  const createDateStr = $('#contactloginfo .textOnly').text()
  const createdOn = moment(createDateStr, "MMMM D, YYYY").format('MM/DD/YYYY')
  const relationships = $('#relationships .smallTextBlack').get().map(r => {
    const relationshipData = dig($(r).parent().children().eq(0).attr('href').match(/\((.*?)\);$/), '1') || ""
    return {
      typeId:relationshipData.split(',')[0],
      type: $(r).parent().text().trim().split('\n')[0],
      id:relationshipData.split(',')[1],
      name: $(r).text()
    }
  })
  return {
    id: $('#rssidAssignConsumerId').val(),
    barcode: $('#numClientID').val(),
    name:{
      firstName: $('#requiredtxtFirst_Name').val(),
      middleName: $('#txtMiddleName').val(),
      lastName: $('#requiredtxtLast_Name').val(),
      nickname: $('#txtDear').val()
    },
    email: $('#txtEmail').val(),
    phone: {
      cellPhone: $('#txtCellPhone').val(),
      homePhone: $('#txtHomePhone').val(),
      workPhone: $('#txtWorkPhone').val(),
      workPhoneExt: $('#txtWorkExtension').val()
    },
    address: {
      address1:$('[name=origtxtAddress]').val(),
      address2:$('[name=origtxtAddress2]').val(),
      city:$('[name=origtxtCity]').val(),
      state:$('[name=origState]').val(),
      zip:$('[name=origtxtZip]').val()
    },
    billing: {
      billingAddress: $('#txtBillingAddress').val(),
      billingCity: $('#txtBillingCity').val(),
      billingState: $('#optBillingState [selected]').val(),
      billingZip: $('#txtBillingZip').val(),
      ccNumber: $('#txtCCNumber').val(),
      ccExpMonth: $('#optExpMonth [selected]').val() || '',
      ccExpYear: $('#optExpYear [selected]').val() || '',
      ccExpMonth: $('#optExpMonth [selected]').val() || ''
    },
    notes: $('#txtClientNotes').text(),
    memberStatus: $('#memberstatus label').eq(0).text(),
    gender: $('#optGender [selected]').text(),
    birthday: $('#txtBirthday').val(),
    location: $('#optHomeStudio [selected]').not(function(i, loc){return $(this).val() === "0"}).eq(0).text(),
    createdOn,
    relationships,
    emergencyContact: {
      name: $('#emergencycontact #txtEmergContact').val(),
      relationship: $('#emergencycontact #txtRelationship').val(),
      phone: $('#emergencycontact #txtEmerPhone').val(),
      email: $('#emergencycontact #txtEmerEmail').val()
    },
    reminderEmails:{
      account: $('#optAccountEmail').attr('checked') === "checked",
      schedule: $('#optScheduleEmail').attr('checked') === "checked",
      promo: $('#optPromoEmail').attr('checked') === "checked"
    }
  }
}
