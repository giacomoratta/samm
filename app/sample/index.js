const { Config } = require('../config')
const { PathQuery } = require('../path-query')
const { SampleIndex } = require('./sampleIndex.class')
const { SampleSet } = require('./sampleSet.class')
const { SpheroidCache } = require('../../core/spheroid-cache')
const log = require('../../core/logger').createLogger('sample')

let SampleSetCache = new SpheroidCache({ maxSize: 20 })
let LookupCache = new SpheroidCache({ maxSize: 40 })

// set logger

let mainSamplesIndex = null

const loadIndex = async (indexFilePath) => {
  log.info(`executing loadIndex...`)
  mainSamplesIndex = null
  if (!Config.get('SamplesDirectory')) {
    log.info(`loadIndex - no SamplesDirectory found`)
    Config.getField('Status').add('first-scan-needed', true)
    Config.getField('Status').add('new-scan-needed', false)
    Config.save()
    return false
  }
  mainSamplesIndex = new SampleIndex({
    indexFilePath,
    samplesPath: Config.get('SamplesDirectory')
  })

  let loadResult
  try {
    loadResult = await mainSamplesIndex.load()
  } catch (e) {
    log.error('loadIndex - cannot load the index!')
    log.error(e)
    return false
  }

  if (loadResult !== true) {
    mainSamplesIndex = null
    log.warn(`loadIndex - No indexed samples: set flag 'first-scan-needed'.`)
    Config.getField('Status').add('first-scan-needed', true)
    Config.getField('Status').add('new-scan-needed', false)
  } else {
    log.info(`loadIndex - Found indexed samples`)
    Config.getField('Status').add('first-scan-needed', false)
    Config.getField('Status').add('new-scan-needed', false)
  }

  Config.save()
  return loadResult
}

const createIndex = async (indexFilePath) => {
  log.info(`executing createIndex...`)
  mainSamplesIndex = null
  if (!Config.get('SamplesDirectory')) {
    log.info(`createIndex - no SamplesDirectory found`)
    Config.getField('Status').add('first-scan-needed', true)
    Config.getField('Status').add('new-scan-needed', false)
    Config.save()
    return false
  }

  mainSamplesIndex = new SampleIndex({
    indexFilePath,
    samplesPath: Config.get('SamplesDirectory')
  })
  const options = {
    excludedPaths: Config.get('SamplesDirectoryExclusions')
  }
  if (Config.get('ExtensionsPolicyForSamples') === 'E') {
    options.excludedExtensions = Config.get('ExcludedExtensionsForSamples')
  } else if (Config.get('ExtensionsPolicyForSamples') === 'I') {
    options.includedExtensions = Config.get('IncludedExtensionsForSamples')
  }

  let createResult
  try {
    createResult = await mainSamplesIndex.create(options)
  } catch (e) {
    log.error('createIndex - cannot create the index!')
    log.error(e)
    return false
  }

  if (createResult !== true) {
    mainSamplesIndex = null
    log.warn(`createIndex - No indexed samples: set flag 'first-scan-needed'.`)
    Config.getField('Status').add('first-scan-needed', true)
    Config.getField('Status').add('new-scan-needed', false)
  } else {
    log.info(`createIndex - Found indexed samples`)
    Config.getField('Status').add('first-scan-needed', false)
    Config.getField('Status').add('new-scan-needed', false)
  }

  Config.save()
  return loadResult
}

const repairIndex = ({ newSamplesRoot = '' }) => {
  const result = true
  if (newSamplesRoot) {
    // result = mainSamplesIndex.replaceSamplesRoot(newSamplesRoot)
  }
  if (result === true) {
    Config.getField('Status').add('new-scan-needed', false)
    Config.getField('Status').add('first-scan-needed', false)
    Config.save()
  }
  return result
}

const hasIndex = () => {
  return mainSamplesIndex !== null && mainSamplesIndex.loaded && mainSamplesIndex.size > 0
}

const indexSize = () => {
  if (mainSamplesIndex === null) return
  return mainSamplesIndex.size
}

const sampleSetByPathQuery = ({ queryString, queryLabel }) => {
  let sampleSet = null
  let query = null

  if (mainSamplesIndex === null) return

  if (queryLabel) {
    if (SampleSetCache.has(queryLabel)) {
      return SampleSetCache.get(queryLabel)
    }
    query = PathQuery.get(queryLabel)
  } else if (queryString) {
    const tempLabel = PathQuery.queryStringLabel(queryString)
    if (SampleSetCache.has(tempLabel)) {
      return SampleSetCache.get(tempLabel)
    }
    query = PathQuery.create(queryString)
  }

  if (!query || !query.isValid()) return

  sampleSet = new SampleSet({
    validate: function (sample) {
      return sample.isFile === true && query.check(sample.relPath)
    }
  })

  mainSamplesIndex.forEach(({ item }) => {
    sampleSet.add(item)
  })

  if (sampleSet.size === 0) return

  SampleSetCache.add(query.label, {
    sampleSet,
    query
  })
  return {
    sampleSet,
    query
  }
}

const lookupByPathQuery = ({ queryString, queryLabel }) => {
  let lookup = []
  const sampleSetInfo = sampleSetByPathQuery({ queryString, queryLabel })
  if (!sampleSetInfo) return
  lookup = sampleSetInfo.sampleSet.random({
    max: Config.get('RandomCount'),
    maxFromSameDirectory: Config.get('MaxSamplesSameDirectory')
  })
  if (lookup.length > 0) {
    LookupCache.add({
      lookup,
      ...sampleSetInfo
    })
  }
  return {
    lookup,
    ...sampleSetInfo
  }
}

const SampleBoot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  return await loadIndex(filePath)
}

const SampleCleanData = () => {
  log.info('Cleaning data...')
  if (!ProjectHistoryFile) return
  return ProjectHistoryFile.deleteFile()
}

module.exports = {
  Sample: {
    hasIndex,
    indexSize,
    createIndex,
    loadIndex,
    sampleSetByPathQuery,
    lookupByPathQuery,
    repairIndex,
    getLatestSampleSet: () => { return SampleSetCache.latest },
    getLatestLookup: () => { return LookupCache.latest }
  },
  SampleBoot,
  SampleCleanData
}
