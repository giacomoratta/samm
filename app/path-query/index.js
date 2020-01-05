const { Config } = require('../config')
const { PathQueryJsonFile } = require('./pathQueryJsonFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')
const { SpheroidCache } = require('../../core/spheroid-cache')

const PathBasedQueryCache = new SpheroidCache({ maxItems: 30 })
const PathQueryFile = new PathQueryJsonFile(Config.get('PathQueryFile'))
PathQueryFile.load()

const add = (label, queryString) => {
  return PathQueryFile.add({ label, queryString })
}

const remove = (label) => {
  return PathQueryFile.remove(label)
}

const get = (label) => {
  return PathQueryFile.get(label)
}

const list = () => {
  const array = []
  PathQueryFile.forEach((pathQuery) => {
    array.push(pathQuery)
  })
  return array
}

const save = () => {
  return PathQueryFile.save()
}

const create = (queryString) => {
  const queryStringLabel = PathBasedQuery.queryStringLabel(queryString)
  if (PathBasedQueryCache.has(queryStringLabel)) {
    return PathBasedQueryCache.get(queryStringLabel)
  }
  const newPathBasedQuery = new PathBasedQuery(queryString)
  if (!newPathBasedQuery.isValid()) return null
  PathBasedQueryCache.add(queryStringLabel, newPathBasedQuery)
  return newPathBasedQuery
}

module.exports = {
  PathQuery: {
    add,
    remove,
    get,
    list,
    save,
    create,
    queryFile: Config.get('PathQueryFile'),
    queryStringLabel: PathBasedQuery.queryStringLabel
  }
}
