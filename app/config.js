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

class Config extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }

  set(name, value) {

  }
}

const config = new Config(path.join(basePath, 'config.json'))

config.addField({
  name: 'SamplesDirectory',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

config.addField({
  name: 'CurrentProject',
  schema: {
    type: 'absDirPath',
    checkExists: true
  },
  value: basePath
})

config.addField({
  name: 'RandomCount',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 15
})

config.addField({
  name: 'MaxOccurrencesSameDirectory',
  schema: {
    type: 'number',
    positive: true,
    integer: true
  },
  value: 2
})

config.addField({
  name: 'ExcludedExtensionsForSamples',
  schema: {
    type: 'array',
    items: 'string',
    default: ['']
  }
})

config.addField({
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

config.addField({
  name: 'ProjectHistory',
  schema: {
    type: 'array',
    items: 'string',
    default: ['']
  }
})

config.addField({
  name: 'Status',
  schema: {
    type: 'object',
    props: {
      'first-scan-needed': { type: 'boolean' },
      'new-scan-needed': { type: 'boolean' },
    }
  },
  value: {
    'first-scan-needed': true,
    'new-scan-needed': true
  }
})

config.load()
config.save()

const tags = config.set('laskjf',234)
//
// tags.kick = 'sdafs'
// tags.asfasfas = 'fsafsafsa'
config.save()

module.exports = {
  config
}
