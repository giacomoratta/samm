const { App, Cli, CLI_ERROR } = require('./common')

const Config = App.Config

const ConfigParameters = [
  'SamplesDirectory',
  'SamplesDirectoryExclusions',
  'RandomCount',
  'MaxSamplesSameDirectory',
  'ExcludedExtensionsForSamples',
  'IncludedExtensionsForSamples',
  'ExtensionsPolicyForSamples'
]

const commandName = 'config'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .autocomplete(ConfigParameters)
  .description('Get or set the value of a configuration parameter. \n')
  .option('-r, --remove', 'Remove a key or a value from a complex parameter (e.g. list)')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  const paramName = cliInput.getParam('name')

  if (paramName) {
    /* Invalid parameter */
    if (!Config.hasField(paramName)) {
      cliPrinter.warn(`Config parameter ${paramName} does not exist.`)
      return cliNext()
    }

    /* Print single parameter */
    if (!cliInput.getParam('values')) {
      cliPrinter.info(Config.getField(paramName).describe()[0])
      cliPrinter.value(Config.get(paramName), '> current')
      return cliNext()
    }

    /* Change parameters and save */
    let newConfigValue
    if (paramName === 'ExcludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: Config.get('ExcludedExtensionsForSamples'),
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'IncludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: Config.get('IncludedExtensionsForSamples'),
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'SamplesDirectoryExclusions') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: Config.getField('SamplesDirectoryExclusions').get(false),
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else {
      newConfigValue = cliInput.getParam('values')[0]
    }
    if (!newConfigValue) return cliNext()
    try {
      Config.set(paramName, newConfigValue)
      Config.save()
    } catch (e) {
      cliPrinter.error(e.message)
      return cliNext(CLI_ERROR, e)
    }
    return cliNext()
  }

  /* Print all parameters */
  configDescribeParameters({ cliPrinter })
  return cliNext()
})

const BasicArrayFieldEditor = ({ currentArray, newValues, cliInput }) => {
  if (!currentArray) currentArray = []
  if (!newValues) return []
  if (cliInput.hasOption('remove')) {
    return currentArray.filter(item => !newValues.includes(item))
  } else {
    return [...new Set(currentArray.concat(newValues))]
  }
}

const configDescribeParameters = ({ cliPrinter }) => {
  let currentValue = null
  ConfigParameters.forEach((configParam) => {
    cliPrinter.title(configParam)
    const description = Config.getField(configParam).describe()
    if (description.length > 0) {
      currentValue = Config.getField(configParam).get(false)
      cliPrinter.info(`  ${description[0]}`)

      if (currentValue instanceof Array) {
        cliPrinter.info('  > current value:')
        currentValue.forEach((item, index) => {
          cliPrinter.info(`    ${index + 1}) ${item}`)
        })
      } else if (currentValue instanceof Object) {
        cliPrinter.info('  > current value:')
        Object.keys(currentValue).forEach((k) => {
          cliPrinter.info(`    ${k}: ${currentValue[k]}`)
        })
      } else {
        cliPrinter.info(`  > current value: ${(currentValue === null ? '' : currentValue)}`)
      }
    }
  })
  cliPrinter.newLine()
}
