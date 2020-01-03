const { Config } = require('../config/configFile.class')
const { SampleIndex } = require('./sampleIndex.class')
const { SampleSet } = require('./sampleSet.class')
const SampleLookups = new Map() // todo: buckedCache circular
let LatestLookup = null

// set logger
const mainSamplesIndex = new SampleIndex()

// set logger
const mainSampleSet =  new SampleSet(mainSamplesIndex)

/* samples endpoints */

/*
 * hasIndex
 *    try to open (json.parse -> error or not)
 *
 * reIndex
 *    remove file, new sequoiaTree and save
 *
 * processQueryString
 *    check query string, recompose cleaned and return { null|string, err|processed }
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
module.exports = {

}
