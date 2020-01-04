const { Config } = require('../config/configFile.class')
const { SampleIndex } = require('./sampleIndex.class')
const { SampleSet } = require('./sampleSet.class')
const SampleLookups = new Map() // todo: buckedCache circular
const LatestLookup = null

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
  if (mainSamplesIndex !== null) {
    return mainSamplesIndex.size
  }
}

/* samples endpoints */

const lookupByPathQuery = (queryString) => {

}

loadIndex().then((loadResult) => {
  if (loadResult !== true) {
    Config.getField('Status').add('first-scan-needed', true)
  }
})

module.exports = {

}
