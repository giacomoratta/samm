const path = require('path')
const { fileUtils } = require('../../core/utils/file.utils')

const { Config } = require('../config')

const generateSamplesDirectory = ({ samplesArray, samplesQuery, destinationPath, overwrite }) => {
  destinationPath = path.join(samplesQuery, 'mpl', samplesQuery.label.substr(0, 15))
  if (overwrite !== true && fileUtils.directoryExistsSync(destinationPath) === true) {
    const parsedDir = path.parse(destinationPath)
    let i = 1
    let newDestinationPath
    do {
      newDestinationPath = path.join(parsedDir.dir, `${parsedDir.base}_${i}`)
      i++
    } while (fileUtils.directoryExistsSync(newDestinationPath) === true && i < 1000)
    if (i >= 1000) return new Promise(resolve => { return resolve(false) })
  }
  const promisesArray = []
  samplesArray.forEach((sample) => {
    promisesArray.push(fileUtils.copyFile(sample.path, path.join(destinationPath, sample.base), { overwrite }))
  })
  return Promise.all(promisesArray).then(() => {
    return true
  })
}

module.exports = {
  Export: {
    generateSamplesDirectory
  }
}
