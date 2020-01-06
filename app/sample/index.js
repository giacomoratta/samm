const { Config } = require('../config')
const { PathQuery } = require('../path-query')
const { SampleIndex } = require('./sampleIndex.class')
const { SampleSet } = require('./sampleSet.class')
const { SpheroidCache } = require('../../core/spheroid-cache')

const SampleSetCache = new SpheroidCache({ maxItems: 30 })

let latestSampleSet = null
let latestSampleSetQuery = null
let latestLookup = []
let latestLookupQuery = null

// set logger

let mainSamplesIndex = null

const loadIndex = async () => {
  if (!Config.get('SamplesDirectory')) return false
  mainSamplesIndex = new SampleIndex({
    indexFilePath: Config.get('SampleIndexFile'),
    samplesPath: Config.get('SamplesDirectory')
  })
  const result = await mainSamplesIndex.load()
  if (result === true) {
    Config.getField('Status').add('new-scan-needed', false)
    Config.save()
  }
  return result
}

const createIndex = async () => {
  if (!Config.get('SamplesDirectory')) return false
  mainSamplesIndex = new SampleIndex({
    indexFilePath: Config.get('SampleIndexFile'),
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
  const result = await mainSamplesIndex.create(options)
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
  if (mainSamplesIndex === null) return 0
  return mainSamplesIndex.size
}

const sampleSetByPathQuery = ({ queryString, queryLabel }) => {
  latestSampleSet = null
  latestSampleSetQuery = null

  if (mainSamplesIndex === null) return
  let pathBQ1

  if (queryLabel) {
    pathBQ1 = PathQuery.get(queryLabel)
    if (!pathBQ1) return
    latestSampleSetQuery = pathBQ1
    if (SampleSetCache.has(pathBQ1.label)) {
      latestSampleSet = SampleSetCache.get(pathBQ1.label)
      return latestSampleSet
    }
  } else if (queryString) {
    const tempLabel = PathQuery.queryStringLabel(queryString)
    pathBQ1 = PathQuery.create(queryString)
    if (SampleSetCache.has(tempLabel)) {
      latestSampleSetQuery = pathBQ1
      return SampleSetCache.get(tempLabel)
    }
  }

  if (!pathBQ1 || !pathBQ1.isValid()) return
  latestSampleSetQuery = pathBQ1

  const sampleSet1 = new SampleSet({
    validate: function (sample) {
      return sample.isFile === true && pathBQ1.check(sample.relPath)
    }
  })
  latestSampleSet = sampleSet1

  mainSamplesIndex.forEach(({ item }) => {
    sampleSet1.add(item)
  })

  if (sampleSet1.size === 0) return
  SampleSetCache.add(pathBQ1.label, sampleSet1)
  return sampleSet1
}

const lookupByPathQuery = ({ queryString, queryLabel }) => {
  latestLookup = []
  latestLookupQuery = null
  const sampleSet1 = sampleSetByPathQuery({ queryString, queryLabel })
  if (!sampleSet1) return []
  latestLookup = sampleSet1.random({
    max: Config.get('RandomCount'),
    maxFromSameDirectory: Config.get('MaxSamplesSameDirectory')
  })
  latestLookupQuery = (queryString ? PathQuery.create(queryString) : PathQuery.get(queryLabel))
  return latestLookup
}

loadIndex().then((loadResult) => {
  if (loadResult !== true) {
    Config.getField('Status').add('first-scan-needed', true)
    Config.save()
  }
})

module.exports = {
  Sample: {
    hasIndex,
    indexSize,
    createIndex,
    loadIndex,
    sampleSetByPathQuery,
    lookupByPathQuery,

    getLatestSampleSet: () => { return latestSampleSet },
    getLatestSampleSetQuery: () => { return latestSampleSetQuery },
    getLatestLookup: () => { return latestLookup },
    getLatestLookupQuery: () => { return latestLookupQuery }
  }
}
