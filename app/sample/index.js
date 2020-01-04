const { Config } = require('../config/configFile.class')
const { SampleIndex } = require('./sampleIndex.class')
const { SampleSet } = require('./sampleSet.class')
const SampleLookups = new Map() // todo: buckedCache circular
const LatestLookup = null

// set logger
const mainSamplesIndex = new SampleIndex()

// set logger
const mainSampleSet = new SampleSet(mainSamplesIndex)

/* samples endpoints */

/*
 * hasIndex
 *    try to open (json.parse -> error or not)
 *
 * reIndex
 *    remove file, new sequoiaTree and save
 *
 * lookupByQuery(query = { string:'', processed:{} }, max=[-1,100])
 *    return a (sub) sampleSet
 *
 * coverageByQuery(queryString)
 * uncoveredSamples
 *
 * save(samplesSet, dirAbsPath)
 *
 */

const lookupByPathQuery = (queryString) => {

}

module.exports = {

}
