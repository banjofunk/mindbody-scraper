const fetch = require('node-fetch')
const cheerio = require('cheerio')
const dig = require('object-dig')
const getToken = require('./utils/getToken')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({ region: 'us-west-2' });
const qs = require('querystring')

let token = false
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  token = token || await getToken()
  const method = 'post'
  const headers = {
    "Cookie": token,
    "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/71.0.3578.98 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded"
  }


  const filterUrl = 'https://clients.mindbodyonline.com/paginatedpricingoptions/filter'
  const filterBody = filterQueryParams()
  await fetch(filterUrl, { method, headers, body: filterBody })

  const searchUrl = 'https://clients.mindbodyonline.com/paginatedpricingoptions/search'
  const searchBody = searchQueryParams()
  await fetch(searchUrl, { method, headers, body: searchBody })
    .then(resp => resp.text())
    .then(async resp => {
      const $ = cheerio.load(resp)
      const firstScript = dig($('body > script'), 0, 'firstChild', 'data') || ""
      if(firstScript.trim() === 'mb.sessionHelpers.resetSession();'){
        token = await getToken()
        return false
      }
      const pricingItems = $('.contract-item').get().map(item => {
        return {
          id: $(item).attr('id').trim(),
          title: $(item).attr('title').trim(),
          active: !$(item).attr('class').includes('deactivated')
        }
      })
      console.log('itemCount:', $('.contract-item').length)
      console.log('has more pages?:', $('.pager').get().length > 0)

      let entries = []
      for (const pricingItem of pricingItems) {
          const Id = `pricingItem-${pricingItem.id}`
          const MessageBody = JSON.stringify(pricingItem)
          entries.push({ Id, MessageBody })
      }
      console.log('entries', entries)

      let i,j,entryChunk
      for (i=0,j=entries.length; i<j; i+=10) {
        entryChunk = entries.slice(i,i+10)
        params = {
          Entries: entryChunk,
          QueueUrl: process.env.pricingDetailQueueUrl
        };
        await sqs.sendMessageBatch(params).promise()
          .then(data => {
            const passCount = data.Successful.length
            const failCount = data.Failed.length
            console.log('added to queue: ', `pass: ${passCount}, fail:${failCount}`)
          })
          .catch(err => { console.log('sqs send error:', err, err.stack) })
      }
    })
  return Promise.resolve()
}

const searchQueryParams = () => {
  return qs.stringify({
    'PageNumber': '1',
    'ResultsPerPage': '10000',
    'DisplayBottomPagination': 'False',
    'DisplayEditSelected': 'True',
    'DisplayFilters': 'True',
    'DisplaySearch': 'True',
    'DisplayTopPagination': 'False',
    'EditedId': '-1',
    'WasEdited': 'False',
    'EditedItemInDataSet': 'False',
    'ResetPagination': 'false',
    'HasUserChangedFilters': 'True',
    'SortedBy': 'Name',
    'SortDirection': '0',
    'GeneralOptions.EnableMarketplaceDeals': 'True'
  })
}

const filterQueryParams = () => {
  return qs.stringify({
    'OneToManyFilters[0].IsSystemGeneratedData': ' False',
    'OneToManyFilters[0].FilterOptions.ColumnName': ' prim.Location',
    'OneToManyFilters[0].FilterOptions.DisplayName': ' Locations',
    'OneToManyFilters[0].FilterOptions.PropertyName': ' Locations',
    'OneToManyFilters[0].FilterOptions.ShowAll': ' False',
    'OneToManyFilters[0].FilterOptions.FilterValues[0].DisplayName': ' All locations',
    'OneToManyFilters[0].FilterOptions.FilterValues[0].Id': ' 1',
    'OneToManyFilters[0].FilterOptions.FilterValues[0].IsSelected': ' True',
    'OneToManyFilters[0].FilterOptions.FilterValues[0].ShowAll': ' True',
    'OneToManyFilters[0].FilterOptions.FilterValues[0].Value': ' *',
    'OneToManyFilters[1].IsSystemGeneratedData': ' False',
    'OneToManyFilters[1].FilterOptions.ColumnName': ' prim.Membership',
    'OneToManyFilters[1].FilterOptions.DisplayName': ' Memberships',
    'OneToManyFilters[1].FilterOptions.PropertyName': ' Memberships',
    'OneToManyFilters[1].FilterOptions.ShowAll': ' False',
    'OneToManyFilters[1].FilterOptions.FilterValues[0].DisplayName': ' All memberships',
    'OneToManyFilters[1].FilterOptions.FilterValues[0].Id': ' 1',
    'OneToManyFilters[1].FilterOptions.FilterValues[0].IsSelected': ' True',
    'OneToManyFilters[1].FilterOptions.FilterValues[0].ShowAll': ' True',
    'OneToManyFilters[1].FilterOptions.FilterValues[0].Value': ' *',
    'OneToManyFilters[2].IsSystemGeneratedData': ' False',
    'OneToManyFilters[2].FilterOptions.ColumnName': ' prim.ServiceCategory',
    'OneToManyFilters[2].FilterOptions.DisplayName': ' Service categories',
    'OneToManyFilters[2].FilterOptions.PropertyName': ' ServiceCategories',
    'OneToManyFilters[2].FilterOptions.ShowAll': ' False',
    'OneToManyFilters[2].FilterOptions.FilterValues[0].DisplayName': ' All service categories',
    'OneToManyFilters[2].FilterOptions.FilterValues[0].Id': ' 1',
    'OneToManyFilters[2].FilterOptions.FilterValues[0].IsSelected': ' True',
    'OneToManyFilters[2].FilterOptions.FilterValues[0].ShowAll': ' True',
    'OneToManyFilters[2].FilterOptions.FilterValues[0].Value': ' *',
    'OneToManyFilters[3].IsSystemGeneratedData': ' False',
    'OneToManyFilters[3].FilterOptions.ColumnName': ' cat.CategoryName',
    'OneToManyFilters[3].FilterOptions.DisplayName': ' Revenue categories',
    'OneToManyFilters[3].FilterOptions.PropertyName': ' RevenueCategories',
    'OneToManyFilters[3].FilterOptions.ShowAll': ' False',
    'OneToManyFilters[3].FilterOptions.FilterValues[0].DisplayName': ' All revenue categories',
    'OneToManyFilters[3].FilterOptions.FilterValues[0].Id': ' 1',
    'OneToManyFilters[3].FilterOptions.FilterValues[0].IsSelected': ' True',
    'OneToManyFilters[3].FilterOptions.FilterValues[0].ShowAll': ' True',
    'OneToManyFilters[3].FilterOptions.FilterValues[0].Value': ' *',
    'BinaryFilters[0].IsSystemGeneratedData': ' True',
    'BinaryFilters[0].IsSingleSelect': ' False',
    'BinaryFilters[0].FilterOptions.ColumnName': ' wsShow',
    'BinaryFilters[0].FilterOptions.DisplayName': ' Sold online',
    'BinaryFilters[0].FilterOptions.PropertyName': ' IsSoldOnline',
    'BinaryFilters[0].FilterOptions.ShowAll': ' False',
    'BinaryFilters[0].FilterOptions.FilterValues[0].IsSelected': [ ' true', ' false' ],
    'BinaryFilters[0].FilterOptions.FilterValues[0].DisplayName': ' Sold online',
    'BinaryFilters[0].FilterOptions.FilterValues[0].Id': ' 2',
    'BinaryFilters[0].FilterOptions.FilterValues[0].ShowAll': ' False',
    'BinaryFilters[0].FilterOptions.FilterValues[0].Value': ' 1',
    'BinaryFilters[0].FilterOptions.FilterValues[1].IsSelected': [ ' true', ' false' ],
    'BinaryFilters[0].FilterOptions.FilterValues[1].DisplayName': ' Not sold online',
    'BinaryFilters[0].FilterOptions.FilterValues[1].Id': ' 3',
    'BinaryFilters[0].FilterOptions.FilterValues[1].ShowAll': ' False',
    'BinaryFilters[0].FilterOptions.FilterValues[1].Value': ' 0',
    'BinaryFilters[1].IsSystemGeneratedData': ' True',
    'BinaryFilters[1].IsSingleSelect': ' False',
    'BinaryFilters[1].FilterOptions.ColumnName': ' Discontinued',
    'BinaryFilters[1].FilterOptions.DisplayName': ' Status',
    'BinaryFilters[1].FilterOptions.PropertyName': ' Discontinued',
    'BinaryFilters[1].FilterOptions.ShowAll': ' False',
    'BinaryFilters[1].FilterOptions.FilterValues[0].IsSelected': [ ' true', ' false' ],
    'BinaryFilters[1].FilterOptions.FilterValues[0].DisplayName': ' Active pricing options',
    'BinaryFilters[1].FilterOptions.FilterValues[0].Id': ' 3',
    'BinaryFilters[1].FilterOptions.FilterValues[0].ShowAll': ' False',
    'BinaryFilters[1].FilterOptions.FilterValues[0].Value': ' 0',
    'BinaryFilters[1].FilterOptions.FilterValues[1].IsSelected': [ ' true', ' false' ],
    'BinaryFilters[1].FilterOptions.FilterValues[1].DisplayName': ' Inactive pricing options',
    'BinaryFilters[1].FilterOptions.FilterValues[1].Id': ' 2',
    'BinaryFilters[1].FilterOptions.FilterValues[1].ShowAll': ' False',
    'BinaryFilters[1].FilterOptions.FilterValues[1].Value': ' 1'
  })
}
