const { mbFetch, logger, sendToQueue } = require('./utils')
const qs = require('querystring')

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { session } = event
  await logger(session, `fetching contract types`)

  const method = 'post'
  const headers = { "Content-Type": "application/x-www-form-urlencoded" }
  const url = 'https://clients.mindbodyonline.com/paginatedcontracts/filter'
  const body = filterParams()
  const fetchParams = {
    session,
    url,
    options: { method, headers, body },
    parser: 'contractTypesParser'
  }
  const contractTypes = await mbFetch(fetchParams)
  await Promise.all(contractTypes.map( contractType => 
    sendToQueue(contractType, 'getContractType', session)
  ))
}

const filterParams = () => {
  return qs.stringify({
    "OneToManyFilters[0].IsSystemGeneratedData": "False",
    "OneToManyFilters[0].FilterOptions.ColumnName": "prim.SeriesTypeName",
    "OneToManyFilters[0].FilterOptions.DisplayName": "Memberships",
    "OneToManyFilters[0].FilterOptions.PropertyName": "Memberships",
    "OneToManyFilters[0].FilterOptions.ShowAll": "False",
    "OneToManyFilters[0].FilterOptions.FilterValues[0].DisplayName": "All memberships",
    "OneToManyFilters[0].FilterOptions.FilterValues[0].Id": "1",
    "OneToManyFilters[0].FilterOptions.FilterValues[0].IsSelected": "True",
    "OneToManyFilters[0].FilterOptions.FilterValues[0].ShowAll": "True",
    "OneToManyFilters[0].FilterOptions.FilterValues[0].Value": "*",
    "OneToManyFilters[0].FilterOptions.FilterValues[1].DisplayName": "Namaspa Membership",
    "OneToManyFilters[0].FilterOptions.FilterValues[1].Id": "3",
    "OneToManyFilters[0].FilterOptions.FilterValues[1].IsSelected": "False",
    "OneToManyFilters[0].FilterOptions.FilterValues[1].ShowAll": "False",
    "OneToManyFilters[0].FilterOptions.FilterValues[1].Value": "3",
    "OneToManyFilters[0].FilterOptions.FilterValues[2].DisplayName": "Recorded Classes Membership",
    "OneToManyFilters[0].FilterOptions.FilterValues[2].Id": "4",
    "OneToManyFilters[0].FilterOptions.FilterValues[2].IsSelected": "False",
    "OneToManyFilters[0].FilterOptions.FilterValues[2].ShowAll": "False",
    "OneToManyFilters[0].FilterOptions.FilterValues[2].Value": "10",
    "OneToManyFilters[1].IsSystemGeneratedData": "False",
    "OneToManyFilters[1].FilterOptions.ColumnName": "prim.LocationName",
    "OneToManyFilters[1].FilterOptions.DisplayName": "Locations",
    "OneToManyFilters[1].FilterOptions.PropertyName": "Locations",
    "OneToManyFilters[1].FilterOptions.ShowAll": "False",
    "OneToManyFilters[1].FilterOptions.FilterValues[0].DisplayName": "All locations",
    "OneToManyFilters[1].FilterOptions.FilterValues[0].Id": "1",
    "OneToManyFilters[1].FilterOptions.FilterValues[0].IsSelected": "True",
    "OneToManyFilters[1].FilterOptions.FilterValues[0].ShowAll": "True",
    "OneToManyFilters[1].FilterOptions.FilterValues[0].Value": "*",
    "OneToManyFilters[1].FilterOptions.FilterValues[1].DisplayName": "Bend",
    "OneToManyFilters[1].FilterOptions.FilterValues[1].Id": "3",
    "OneToManyFilters[1].FilterOptions.FilterValues[1].IsSelected": "False",
    "OneToManyFilters[1].FilterOptions.FilterValues[1].ShowAll": "False",
    "OneToManyFilters[1].FilterOptions.FilterValues[1].Value": "1",
    "OneToManyFilters[1].FilterOptions.FilterValues[2].DisplayName": "Redmond",
    "OneToManyFilters[1].FilterOptions.FilterValues[2].Id": "4",
    "OneToManyFilters[1].FilterOptions.FilterValues[2].IsSelected": "False",
    "OneToManyFilters[1].FilterOptions.FilterValues[2].ShowAll": "False",
    "OneToManyFilters[1].FilterOptions.FilterValues[2].Value": "2",
    "BinaryFilters[0].IsSystemGeneratedData": "True",
    "BinaryFilters[0].IsSingleSelect": "False",
    "BinaryFilters[0].FilterOptions.ColumnName": "AutoRenewing",
    "BinaryFilters[0].FilterOptions.DisplayName": "Renewal status",
    "BinaryFilters[0].FilterOptions.PropertyName": "AutoRenewing",
    "BinaryFilters[0].FilterOptions.ShowAll": "False",
    "BinaryFilters[0].FilterOptions.FilterValues[0].IsSelected": "true",
    "BinaryFilters[0].FilterOptions.FilterValues[0].IsSelected": "false",
    "BinaryFilters[0].FilterOptions.FilterValues[0].DisplayName": "Auto-renewing contracts",
    "BinaryFilters[0].FilterOptions.FilterValues[0].Id": "2",
    "BinaryFilters[0].FilterOptions.FilterValues[0].ShowAll": "False",
    "BinaryFilters[0].FilterOptions.FilterValues[0].Value": "1",
    "BinaryFilters[0].FilterOptions.FilterValues[1].IsSelected": "true",
    "BinaryFilters[0].FilterOptions.FilterValues[1].IsSelected": "false",
    "BinaryFilters[0].FilterOptions.FilterValues[1].DisplayName": "Non-renewing contracts",
    "BinaryFilters[0].FilterOptions.FilterValues[1].Id": "3",
    "BinaryFilters[0].FilterOptions.FilterValues[1].ShowAll": "False",
    "BinaryFilters[0].FilterOptions.FilterValues[1].Value": "0",
    "BinaryFilters[1].IsSystemGeneratedData": "True",
    "BinaryFilters[1].IsSingleSelect": "False",
    "BinaryFilters[1].FilterOptions.ColumnName": "Discontinued",
    "BinaryFilters[1].FilterOptions.DisplayName": "Status",
    "BinaryFilters[1].FilterOptions.PropertyName": "Discontinued",
    "BinaryFilters[1].FilterOptions.ShowAll": "False",
    "BinaryFilters[1].FilterOptions.FilterValues[0].IsSelected": "true",
    "BinaryFilters[1].FilterOptions.FilterValues[0].IsSelected": "false",
    "BinaryFilters[1].FilterOptions.FilterValues[0].DisplayName": "Active contracts",
    "BinaryFilters[1].FilterOptions.FilterValues[0].Id": "3",
    "BinaryFilters[1].FilterOptions.FilterValues[0].ShowAll": "False",
    "BinaryFilters[1].FilterOptions.FilterValues[0].Value": "0",
    "BinaryFilters[1].FilterOptions.FilterValues[1].IsSelected": "true",
    "BinaryFilters[1].FilterOptions.FilterValues[1].IsSelected": "false",
    "BinaryFilters[1].FilterOptions.FilterValues[1].DisplayName": "Inactive contracts",
    "BinaryFilters[1].FilterOptions.FilterValues[1].Id": "2",
    "BinaryFilters[1].FilterOptions.FilterValues[1].ShowAll": "False",
    "BinaryFilters[1].FilterOptions.FilterValues[1].Value": "1",
    "BinaryFilters[2].IsSystemGeneratedData": "True",
    "BinaryFilters[2].IsSingleSelect": "False",
    "BinaryFilters[2].FilterOptions.ColumnName": "SellOnline",
    "BinaryFilters[2].FilterOptions.DisplayName": "Sold online",
    "BinaryFilters[2].FilterOptions.PropertyName": "SellOnline",
    "BinaryFilters[2].FilterOptions.ShowAll": "False",
    "BinaryFilters[2].FilterOptions.FilterValues[0].IsSelected": "true",
    "BinaryFilters[2].FilterOptions.FilterValues[0].IsSelected": "false",
    "BinaryFilters[2].FilterOptions.FilterValues[0].DisplayName": "Sold online",
    "BinaryFilters[2].FilterOptions.FilterValues[0].Id": "2",
    "BinaryFilters[2].FilterOptions.FilterValues[0].ShowAll": "False",
    "BinaryFilters[2].FilterOptions.FilterValues[0].Value": "1",
    "BinaryFilters[2].FilterOptions.FilterValues[1].IsSelected": "true",
    "BinaryFilters[2].FilterOptions.FilterValues[1].IsSelected": "false",
    "BinaryFilters[2].FilterOptions.FilterValues[1].DisplayName": "Not sold online",
    "BinaryFilters[2].FilterOptions.FilterValues[1].Id": "3",
    "BinaryFilters[2].FilterOptions.FilterValues[1].ShowAll": "False",
    "BinaryFilters[2].FilterOptions.FilterValues[1].Value": "0",
  })
}
