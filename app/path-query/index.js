const { Config } = require('../config')
const { PathQueryJsonFile } = require('./pathQueryJsonFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')
const { SpheroidCache } = require('../../core/spheroid-cache')

const PathBasedQueryCache = new SpheroidCache({ maxItems: 30 })
const QueryFile = new PathQueryJsonFile(Config.get('QueryFile'))
QueryFile.load()

const add = (label, queryString) => {
  return QueryFile.add({ label, queryString })
}

const remove = (label) => {
  return QueryFile.remove(label)
}

const get = (label) => {
  return QueryFile.get(label)
}

const list = () => {
  const array = []
  QueryFile.forEach((pathQuery) => {
    array.push(pathQuery)
  })
  return array
}

const save = () => {
  return QueryFile.save()
}

const create = (queryString) => {
  const queryStringLabel = PathBasedQuery.queryStringLabel(queryString)
  if (PathBasedQueryCache.has(queryStringLabel)) {
    return PathBasedQueryCache.get(queryStringLabel)
  }
  const newPathBasedQuery = new PathBasedQuery(queryString)
  PathBasedQueryCache.add(queryStringLabel, newPathBasedQuery)
  return newPathBasedQuery
}

module.exports = {
  add,
  remove,
  get,
  list,
  save,
  create
}
