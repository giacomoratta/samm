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

class ConfigFile extends JsonizedFile {
  constructor (filePath) {
    super({ filePath, prettyJson: true })
  }
}

const config = new ConfigFile(path.join(basePath, 'config.json'))

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
    items: 'string'
  },
  value: ['']
})

config.addField({
  name: 'Tags',
  schema: {
    type: 'object',
    props: { }
  },
  value: {
    kick: 'techno,kick,deep,sub',
    impact: 'impact,boom,shot,crash,bomb,808,efx',
    hihat: 'hihat,hi-hat,hh,top',
    abstract: 'abstract,complex'
  }
})

config.load()
config.save()

const tags = config.get('Tags')

tags.kick = 'sdafs'
tags.asfasfas = 'fsafsafsa'
config.save()

module.exports = {
  ConfigFile: config
}
