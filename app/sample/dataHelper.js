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
 * @returns {Object|null} cache entry
 */
const _getPathBasedQueryCacheEntry = ({ sampleIndex, queryString, queryLabel }) => {
  const designatedQueryLabel = queryLabel || PathBasedQuery.generateQueryStringLabel(queryString)
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

  const pathBasedQueryObj = new PathBasedQuery(queryString)
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
  DataHelperCache.add(pbqEntry.pathBasedQuery.label, pbqEntry)
  LatestSampleSetLabel = pbqEntry.pathBasedQuery.label
  return pbqEntry
}

const getSampleSet = ({ sampleIndex, queryString, queryLabel }) => {
  const pbqEntry = _getPathBasedQueryCacheEntry({ sampleIndex, queryString, queryLabel })
  if (!pbqEntry) return null
  return pbqEntry.sampleSet
}

const getSampleLook = ({ sampleIndex, queryString, queryLabel }) => {
  const pbqEntry = _getPathBasedQueryCacheEntry({ sampleIndex, queryString, queryLabel })
  if (!pbqEntry) return null
  return pbqEntry.sampleLook
}

const latestSampleSet = () => {
  if (!LatestSampleSetLabel || !DataHelperCache.has(LatestSampleSetLabel)) {
    log.warn({ LatestSampleSetLabel }, 'Latest sample set not found.')
    return null
  }
  const pbqEntry = DataHelperCache.get(LatestSampleSetLabel)
  return pbqEntry.sampleSet
}

const latestSampleLook = () => {
  if (!LatestSampleSetLabel || !DataHelperCache.has(LatestSampleSetLabel)) {
    log.warn({ LatestSampleSetLabel }, 'Latest sample set not found (sample look).')
    return null
  }
  const pbqEntry = DataHelperCache.get(LatestSampleSetLabel)
  if (!pbqEntry.sampleLook) {
    log.warn({ LatestSampleSetLabel }, 'Latest sample look not found.')
    return null
  }
  return pbqEntry.sampleLook
}

module.exports = {
  getSampleSet,
  getSampleLook,
  latestSampleSet,
  latestSampleLook
}
