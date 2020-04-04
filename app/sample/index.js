const log = require('../logger').createLogger('sample')
const { SampleIndex } = require('./sampleIndex.class')

let SampleIndexInstance = null
let SampleIndexFilePath = null

const _absentSampleIndex = () => {
  // has no rootPath
  return !SampleIndexInstance || !SampleIndexInstance.rootPath
}

const boot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  SampleIndexFilePath = filePath
  SampleIndexInstance = new SampleIndex(SampleIndexFilePath)
  return SampleIndexInstance.load()
}

const clean = async () => {
  log.info('Cleaning data...')
  if (SampleIndexInstance) {
    await SampleIndexInstance.clean()
  }
}

module.exports = {
  boot,
  clean,

  SampleSetAPI: {
    create: ({ queryString, queryLabel, pathBasedQuery }) => {},
    latest: () => {}
  },

  SampleLookupAPI: {
    create: ({ queryString, queryLabel, pathBasedQuery }) => {},
    latest: () => {}
  },

  SampleIndexAPI: {

    /**
     * Current sample index is not set and any usage will throw errors.
     * With this function, many errors could be prevented.
     * @returns {boolean}
     */
    absent: () => {
      return _absentSampleIndex()
    },

    /**
     * Current sample index is empty
     * @returns {boolean}
     */
    empty: () => {
      if (!_absentSampleIndex()) return true
      return SampleIndexInstance.empty
    },

    /**
     * The number of samples (files only)
     * @returns {number}
     */
    size: () => {
      if (!_absentSampleIndex()) return -1
      return SampleIndexInstance.fileCount
    },

    /**
     * Create and save a new sample index (and destroy the previous one).
     * @returns {Promise<boolean>}
     */
    create: async () => {
      if (!_absentSampleIndex()) return false
      await SampleIndexInstance.clean()
      SampleIndexInstance = new SampleIndex(SampleIndexFilePath)
      return SampleIndexInstance.regenerate()
    }
  }
}
