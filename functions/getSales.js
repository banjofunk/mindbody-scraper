const moment = require('moment')
const qs = require('querystring')
const { mbFetch, logger, sendToQueue, writeToDynamo } = require('./utils')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session, item } = event
  const format = 'MM/DD/YYYY'
  const startDate = item.startDate || moment().subtract(1, 'month').format(format)
  const endDate = item.endDate || moment().format(format)
  await logger(session, `starting sales scraper: ${item.endDate}`)

  const url = 'https://clients.mindbodyonline.com/Report/Sales/Sales/Generate?reportID=undefined'
  const headers = {"Content-Type":"application/x-www-form-urlencoded"}
  const startParam = moment(endDate, format).startOf('month').format(format)
  const endParam = moment(endDate, format).endOf('month').format(format)
  const body = salesQueryParams(startParam, endParam)

  const fetchParams = {
    session,
    url,
    options: { method:'post', headers, body },
    parser: 'salesParser'
  }
  const sales = await mbFetch(fetchParams)
  if(typeof(sales) === 'object'){
    await logger(session, `scraped ${sales.length} sales records`)
    const salesMonth = { id: startParam, sales }
    await writeToDynamo('saleId', salesMonth, 'SalesTable')
    // await Promise.all(sales.map(sale => writeToDynamo('saleId', sale, 'SalesTable')))
  }else{
    await logger(session, `scraper responded with: ${JSON.stringify(sales)}`)
  }

  if(!sales && !item.retry){
    await sendToQueue({ endDate, startDate, retry: true }, 'getSales', session)
  }
  return Promise.resolve()
}


const salesQueryParams = (startParam, endParam) => {
  return qs.stringify({
    hPostAction: "Generate",
    autogenerate: "hasGenerated",
    reportUrl: "/Report/Sales/Sales",
    category: "Sales",
    requiredtxtDateStart: startParam,
    requiredtxtDateEnd: endParam,
    optFilterTagged: false,
    optSaleLoc: [0, 1, 98, 2],
    optHomeStudio: [0, 1, 2],
    optPayMethod: [0, 1, 2, 3, 4, 5, 6, 7, 9, 15, 16, 93, 98, 100],
    optCategory: [0, 99999, 32, 29, 100001, 26, -11, 100004, 36, 22, 100003, 28, -5, 100006, 31, 49, 23, 2, 100000, -10, -12, 24, 27, 100005, 1, -9, 100002, 30, -4, -8, -1],
    optRep: 0,
    optIncludeAutoRenews: "Include",
    optDisMode: "Detail",
    optBasis: "AccrualBasis",
    optShowSupplier: false
  })
}
