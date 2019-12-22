/*
* set flags from outside
* set flags (in 'on' method of a field)
* check flags
* print flags
*
* */

const path = require('path')
const { JsonizedFile } = require('../core/jsonized-file')
const basePath = process.env.ABSOLUTE_APP_PATH || path.join(__dirname, '__tests__')

class AppConfig extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }

  set(name, value) {

  }
}

const appConfig = new AppConfig(path.join(basePath, 'config.json'))

appConfig.addField({
  name: 'SamplesDirectory',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

appConfig.addField({
  name: 'CurrentProject',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

appConfig.addField({
  name: 'RandomCount',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 15
})

appConfig.addField({
  name: 'MaxOccurrencesSameDirectory',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 2
})

appConfig.addField({
  name: 'ExcludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['']
  }
})

appConfig.addField({
  name: 'Tags',
  schema: {
    type: 'object',
    props: { },
    default: {
      kick: 'techno,kick,deep,sub',
      impact: 'impact,boom,shot,crash,bomb,808,efx',
      hihat: 'hihat,hi-hat,hh,top',
      abstract: 'abstract,complex'
    }
  }
})

appConfig.addField({
  name: 'ProjectHistory',
  schema: {
    type: 'array',
    items: 'string'
  },
  value: ['']
})

appConfig.load()
appConfig.save()

const tags = appConfig.set('laskjf',234)
//
// tags.kick = 'sdafs'
// tags.asfasfas = 'fsafsafsa'
appConfig.save()

module.exports = {
  appConfig: appConfig
}
