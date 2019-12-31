const { Config } = require('../config')
const { SamplesIndex } = require('./samplesIndex.class')
const { SamplesSet } = require('./samplesSet.class')

const mainSamplesIndex = new SamplesIndex()
const mainSampleSet =  new SamplesSet(mainSamplesIndex)

/* samples endpoints */

/*
 * hasIndex
 * reIndex
 * lookupByQuery(queryString, max=[-1,100])
 * coverageByQuery(queryString)
 * save(samplesSet, dirAbsPath)
 */
module.exports = {

}
