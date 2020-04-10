const { ConfigAPI } = require('../config')
const { PathBasedQuery } = require('../path-query/pathBasedQuery.class')
const { SampleSet } = require('./sampleSet.class')
const { SpheroidList } = require('../../core/spheroid-list')
const log = require('../logger').createLogger('sample-helper')

const DataHelperCache = new SpheroidList({ maxSize: 30 })
let LatestSampleSetLabel = null

/**
 * Get or extract a sample set from sample index.
 * @param {SampleIndex} sampleIndex
 * @param {string} [queryString]: string for a path-based query
 * @param {string} [queryLabel]: string for a path-based object label
 * @param {PathBasedQuery} [pathQueryObj]: path query object
 * @returns {Object|null} cache entry
 */
const _getPathBasedQueryCacheEntry = ({ sampleIndex, queryString, queryLabel, pathQueryObj }) => {
  let designatedQueryLabel = queryLabel
  if (!designatedQueryLabel) {
    designatedQueryLabel = PathBasedQuery.generateQueryStringLabel((pathQueryObj && pathQueryObj.queryString) || queryString)
    designatedQueryLabel = `###generated###__${designatedQueryLabel}`
  }
  log.debug({ queryLabel, queryString, hasPathQueryObj: !!pathQueryObj }, `Designated query label = ${designatedQueryLabel}`)

  if (designatedQueryLabel.length === 0) {
    log.warn({ designatedQueryLabel, queryString, queryLabel }, 'Invalid generated query string.')
    return
  }

  let pbqEntry = DataHelperCache.get(designatedQueryLabel)
  if (pbqEntry) {
    log.debug(`Found a cache entry with label = '${pbqEntry.pathBasedQuery.label}'.`)
    LatestSampleSetLabel = pbqEntry.pathBasedQuery.label
    return pbqEntry
  }

  const pathBasedQueryObj = pathQueryObj || new PathBasedQuery(queryString)
  if (!pathBasedQueryObj.isValid()) {
    log.warn({ queryString }, 'Invalid path based query.')
    return
  }

  const sampleSetObj = new SampleSet({
    validateFn: (sample) => {
      return sample.isFile === true && pathBasedQueryObj.check(sample.relPath)
    }
  })
  sampleIndex.forEach(({ item }) => { sampleSetObj.add(item) })
  log.debug(`Generated a new sample set with size = ${sampleSetObj.size}.`)

  pbqEntry = {
    sampleSet: sampleSetObj,
    pathBasedQuery: pathBasedQueryObj,
    sampleLook: null
  }
  pbqEntry.pathBasedQuery.label = designatedQueryLabel
  DataHelperCache.add(pbqEntry.pathBasedQuery.label, pbqEntry)
  log.debug(`Add new cache entry with key = ${pbqEntry.pathBasedQuery.label}`)
  LatestSampleSetLabel = pbqEntry.pathBasedQuery.label
  return pbqEntry
}

const getSampleSet = ({ sampleIndex, queryString, queryLabel, pathQueryObj }) => {
  return _getPathBasedQueryCacheEntry({ sampleIndex, queryString, queryLabel, pathQueryObj }) || {}
}

const getSampleLook = ({ sampleIndex, queryString, queryLabel, pathQueryObj }) => {
  const pbqEntry = _getPathBasedQueryCacheEntry({ sampleIndex, queryString, queryLabel, pathQueryObj })
  if (!pbqEntry) return {}
  pbqEntry.sampleLook = pbqEntry.sampleSet.random({
    max: ConfigAPI.field('LookRandomCount').value,
    maxFromSameDirectory: ConfigAPI.field('LookRandomSameDirectory').value
  })
  return pbqEntry
}

const latestSampleSet = () => {
  if (!LatestSampleSetLabel || !DataHelperCache.has(LatestSampleSetLabel)) {
    log.warn({ LatestSampleSetLabel }, 'Latest sample set not found.')
    return {}
  }
  return DataHelperCache.get(LatestSampleSetLabel)
}

const latestSampleLook = () => {
  if (!LatestSampleSetLabel || !DataHelperCache.has(LatestSampleSetLabel)) {
    log.warn({ LatestSampleSetLabel }, 'Latest sample set not found (sample look).')
    return {}
  }
  const pbqEntry = DataHelperCache.get(LatestSampleSetLabel)
  if (!pbqEntry.sampleLook) {
    log.warn({ LatestSampleSetLabel }, 'Latest sample look not found.')
    return {}
  }
  return pbqEntry
}

module.exports = {
  getSampleSet,
  getSampleLook,
  latestSampleSet,
  latestSampleLook
}
