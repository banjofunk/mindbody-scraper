const mbFetch = require('./utils/mbFetch')
const logger = require('./utils/logger')
const sendToQueue = require('./utils/sendToQueue')
const cheerio = require('cheerio')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  const resultsLimit = session.prod ? "10000" : "10"
  await logger(session, `started pricing scraper`)

  const method = 'post'
  const headers = { "Content-Type": "application/x-www-form-urlencoded" }
  const filterUrl = 'https://clients.mindbodyonline.com/paginatedpricingoptions/filter'
  const filterBody = filterQueryParams()
  const filterFetchParams = {
    session,
    url: filterUrl,
    options: { method, headers, body: filterBody },
    parser: false
  }
  await mbFetch(filterFetchParams)
  const searchUrl = 'https://clients.mindbodyonline.com/paginatedpricingoptions/search'
  const searchBody = searchQueryParams(resultsLimit)
  const fetchParams = {
    session,
    url: searchUrl,
    options: { method, headers, body: searchBody },
    parser: 'pricingsParser'
  }
  const pricingItems = await mbFetch(fetchParams)
  await logger(session, `sending ${pricingItems.length} pricing results to queue`)
  await sendToQueue(pricingItems, 'getPricingDetails', session)
  return Promise.resolve()
}

const searchQueryParams = (resultsLimit) => {
  return qs.stringify({
    'PageNumber': '1',
    'ResultsPerPage': resultsLimit,
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
