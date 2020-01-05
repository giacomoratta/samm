const { Config } = require('../config')
const { PathQuery } = require('../path-query')
const { SampleIndex } = require('./sampleIndex.class')
const { SampleSet } = require('./sampleSet.class')
const { SpheroidCache } = require('../../core/spheroid-cache')

const SampleSetCache = new SpheroidCache({ maxItems: 30 })

// set logger

let mainSamplesIndex = null

const loadIndex = async () => {
  if (!Config.get('SamplesDirectory')) return false
  mainSamplesIndex = new SampleIndex({
    indexFilePath: Config.get('SampleIndexFile'),
    samplesPath: Config.get('SamplesDirectory')
  })
  return await mainSamplesIndex.load()
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
  return await mainSamplesIndex.create(options)
}

const hasIndex = () => {
  return mainSamplesIndex !== null
}

const indexSize = () => {
  if (mainSamplesIndex === null) return 0
  return mainSamplesIndex.size
}

const sampleSetByPathQuery = ({ queryString, queryLabel }) => {
  if (mainSamplesIndex === null) return
  let pathBQ1

  if (queryLabel) {
    pathBQ1 = PathQuery.get(queryLabel)
    if (!pathBQ1) return
    if (SampleSetCache.has(pathBQ1.label)) return SampleSetCache.get(pathBQ1.label)
  } else if (queryString) {
    const tempLabel = PathQuery.queryStringLabel(queryString)
    if (SampleSetCache.has(tempLabel)) return SampleSetCache.get(tempLabel)
    pathBQ1 = PathQuery.create(queryString)
  }

  if (!pathBQ1 || !pathBQ1.isValid()) return

  const sampleSet1 = new SampleSet({
    validate: function (sample) {
      return sample.isFile === true && pathBQ1.check(sample.relPath)
    }
  })

  mainSamplesIndex.forEach(({ item }) => {
    sampleSet1.add(item)
  })

  if (sampleSet1.size === 0) return
  SampleSetCache.add(pathBQ1.label, sampleSet1)
  return sampleSet1
}

const lookupByPathQuery = ({ queryString, queryLabel }) => {
  const sampleSet1 = sampleSetByPathQuery({ queryString, queryLabel })
  if (!sampleSet1) return []
  return sampleSet1.random({
    max: Config.get('RandomCount'),
    maxFromSameDirectory: Config.get('MaxSamplesSameDirectory')
  })
}

loadIndex().then((loadResult) => {
  if (loadResult !== true) {
    Config.getField('Status').add('first-scan-needed', true)
  }
})

module.exports = {
  Sample: {
    hasIndex,
    indexSize,
    createIndex,
    loadIndex,
    sampleSetByPathQuery,
    lookupByPathQuery
  }
}
