const { PathQueryJsonFile } = require('./pathQueryJsonFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')
const { SpheroidList } = require('../../core/spheroid-list')
const log = require('../../core/logger').createLogger('path-query')

const PathBasedQueryCache = new SpheroidList({ maxSize: 30 })
let PathQueryFile = null

const add = (label, queryString) => {
  log.info('add', label, queryString)
  return PathQueryFile.add({ jsonData: { label, queryString } })
}

const remove = (label) => {
  log.info('remove', label)
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
  const saveResult = PathQueryFile.save()
  if (saveResult === true) log.info('saved successfully', PathQueryFile.filePath)
  else log.warn('save failure', PathQueryFile.filePath)
  return saveResult
}

const create = (queryString) => {
  const queryStringLabel = PathBasedQuery.queryStringLabel(queryString)
  if (PathBasedQueryCache.has(queryStringLabel)) {
    log.info('get path-query from cache', queryStringLabel)
    return PathBasedQueryCache.get(queryStringLabel)
  }
  const newPathBasedQuery = new PathBasedQuery(queryString)
  if (!newPathBasedQuery.isValid()) {
    log.warn('created an invalid path-query', queryString)
    return null
  }
  PathBasedQueryCache.add(queryStringLabel, newPathBasedQuery)
  log.info('created a new path-query', newPathBasedQuery.queryString)
  return newPathBasedQuery
}

const PathQueryBoot = (filePath) => {
  log.info(`Booting from ${filePath}...`)
  PathQueryFile = new PathQueryJsonFile(filePath)
  return PathQueryFile.load()
}

const PathQueryCleanData = () => {
  log.info('Cleaning data...')
  if (!PathQueryFile) return
  return PathQueryFile.deleteFile()
}

module.exports = {
  PathQuery: {
    add,
    remove,
    get,
    list,
    save,
    create,
    queryStringLabel: PathBasedQuery.queryStringLabel
  },
  PathQueryBoot,
  PathQueryCleanData
}
