const { Config } = require('../config')
const { QueryJsonFile } = require('./queryJsonFile.class')
const { PathQuery } = require('./pathQuery.class')
const { SpheroidCache } = require('../../core/spheroid-cache')

const PathQueryCache = new SpheroidCache({ maxItems: 30 })
const QueryFile = new QueryJsonFile(Config.get('QueryFile'))
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
  const queryStringLabel = PathQuery.queryStringLabel(queryString)
  if (PathQueryCache.has(queryStringLabel)) {
    return PathQueryCache.get(queryStringLabel)
  }
  const newPathQuery = new PathQuery(queryString)
  PathQueryCache.add(queryStringLabel, newPathQuery)
  return newPathQuery
}

module.exports = {
  add,
  remove,
  get,
  list,
  save,
  create
}
