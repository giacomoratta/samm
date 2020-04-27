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
 * @param {PathBasedQuery} [pathQueryObj]: path query object
 * @returns {Object|null} cache entry
 */
const _getPathBasedQueryCacheEntry = ({ sampleIndex, queryString, pathQueryObj }) => {
  let designatedQueryLabel = (pathQueryObj && pathQueryObj.label) || undefined
  if (!designatedQueryLabel) {
    designatedQueryLabel = PathBasedQuery.generateQueryStringLabel((pathQueryObj && pathQueryObj.queryString) || queryString)
    designatedQueryLabel = `###generated###__${designatedQueryLabel}`
  }
  log.debug({ queryString, hasPathQueryObj: !!pathQueryObj }, `Designated query label = ${designatedQueryLabel}`)

  if (designatedQueryLabel.length === 0) {
    log.warn({ designatedQueryLabel, queryString }, 'Invalid generated query string.')
    return
  }

  let pbqEntry = DataHelperCache.get(designatedQueryLabel)
  if (pbqEntry) {
    log.debug(`Found a cache entry with label = '${pbqEntry.pathBasedQuery.label}'.`)
    LatestSampleSetLabel = designatedQueryLabel
    return pbqEntry
  }

  const pathBasedQueryObj = (pathQueryObj && pathQueryObj.clone()) || new PathBasedQuery(queryString)
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
  DataHelperCache.add(designatedQueryLabel, pbqEntry)
  log.debug(`Add new cache entry with key = ${designatedQueryLabel}`)
  LatestSampleSetLabel = designatedQueryLabel
  return pbqEntry
}

const getSampleSet = ({ sampleIndex, queryString, pathQueryObj }) => {
  return _getPathBasedQueryCacheEntry({ sampleIndex, queryString, pathQueryObj }) || {}
}

const getSampleLook = ({ sampleIndex, queryString, pathQueryObj }) => {
  const pbqEntry = _getPathBasedQueryCacheEntry({ sampleIndex, queryString, pathQueryObj })
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
