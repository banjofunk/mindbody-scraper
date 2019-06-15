// const dig = require('./dig')
const digDug = () => console.log('digdug man')
module.exports = { 
  dig: require('./dig'), 
  logger: require('./logger'), 
  mbFetch: require('./mbFetch'), 
  parseResp: require('./parseResp'), 
  sendToQueue: require('./sendToQueue'), 
  writeToDynamo: require('./writeToDynamo'), 
  digDug 
}
