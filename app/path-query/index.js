const { PathQueryFile } = require('./pathQueryFile.class')
const { PathBasedQuery } = require('./pathBasedQuery.class')
const { SpheroidList } = require('../../core/spheroid-list')
const log = require('../../core/logger').createLogger('path-query')

const PathBasedQueryCache = new SpheroidList({ maxSize: 30 })
let PathQueryFileInstance = null

const add = (label, queryString) => {
  log.info('add', label, queryString)
  const pbq = new PathBasedQuery(queryString)
  if (!pbq.isValid()) return false
  pbq.label = label
  return PathQueryFileInstance.collection.add(label, pbq)
}

const remove = (label) => {
  log.info('remove', label)
  return PathQueryFileInstance.collection.remove(label)
}

const get = (label) => {
  return PathQueryFileInstance.collection.get(label)
}

const list = () => {
  const array = []
  PathQueryFileInstance.collection.forEach((pathQuery) => {
    array.push(pathQuery)
  })
  return array
}

const save = async () => {
  const saveResult = await PathQueryFileInstance.fileHolder.save()
  if (saveResult === true) log.info('saved successfully', PathQueryFileInstance.fileHolder.path)
  else log.warn('save failure', PathQueryFileInstance.fileHolder.path)
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

const boot = async (filePath) => { // todo: use try/catch (see config/index.js)
  log.info(`Booting from ${filePath}...`)
  PathQueryFileInstance = new PathQueryFile(filePath) // todo: filePath from config
  return PathQueryFileInstance.fileHolder.load()
}

const clean = async () => { // todo: use try/catch (see config/index.js)
  log.info('Cleaning data...')
  if (!PathQueryFileInstance) return
  PathQueryFileInstance.collection.clean()
  return PathQueryFileInstance.fileHolder.delete()
}

module.exports = {
  boot,
  clean,

  API: {
    pathQuery: {
      add,
      remove,
      get,
      list,
      save,
      create,
      queryStringLabel: PathBasedQuery.queryStringLabel
    }
  }
}
