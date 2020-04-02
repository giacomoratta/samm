const log = require('../../core/logger').createLogger('sample')
const { SampleIndex } = require('./sampleIndex.class')

let SampleIndexInstance = null

const boot = async (filePath) => {
  log.info(`Booting from ${filePath}...`)
  SampleIndexInstance = new SampleIndex(filePath)
  try {
    const dataPresence = await SampleIndexInstance.load()
    log.info({ dataPresence }, 'Loaded successfully')
    return true
  } catch (e) {
    log.error(e, 'Cannot load sample index')
    return false
  }
}

const clean = async () => {
  log.info('Cleaning data...')
  if (SampleIndexInstance) {
    await SampleIndexInstance.clean()
  }
}

const _absentSampleIndex = () => {
  // has no rootPath
  return !SampleIndexInstance || !SampleIndexInstance.rootPath
}

const _emptySampleIndex = () => {
  // empty index
  return !SampleIndexInstance || SampleIndexInstance.empty
}

module.exports = {
  boot,
  clean,

  API: {
    sampleSet: {
      create: ({ queryString, queryLabel, pathBasedQuery }) => {},
      latest: () => {}
    },

    sampleLookup: {
      create: ({ queryString, queryLabel, pathBasedQuery }) => {},
      latest: () => {}
    },

    sampleIndex: {
      absent: () => {
        return _absentSampleIndex()
      },
      empty: () => {
        return _emptySampleIndex()
      },
      size: () => {
        return -1
      },
      create: async () => {
        return false
      }
    }
  }
}
