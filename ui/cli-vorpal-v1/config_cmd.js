const { App, Cli, CLI_SUCCESS, CLI_ERROR } = require('./common')

const Config = App.Config

const ConfigParameters = [
  'SamplesDirectory',
  'SamplesDirectoryExclusions',
  'CurrentProject',
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
      return cliNext(CLI_SUCCESS)
    }

    /* Print single parameter */
    if (!cliInput.getParam('values')) {
      cliPrinter.info(Config.getField(paramName).describe()[0])
      cliPrinter.value(Config.get(paramName), '> current')
      return cliNext(CLI_SUCCESS)
    }

    /* Change parameters and save */
    try {
      if (paramName === 'ExcludedExtensionsForSamples') {
        Config.set(cliInput.getParam('name'), ExtensionsForSamplesEditor({
          currentArray: Config.get('ExcludedExtensionsForSamples'),
          newValues: cliInput.getParam('values'),
          cliInput
        }))
      } else if (paramName === 'IncludedExtensionsForSamples') {
        Config.set(cliInput.getParam('name'), ExtensionsForSamplesEditor({
          currentArray: Config.get('IncludedExtensionsForSamples'),
          newValues: cliInput.getParam('values'),
          cliInput
        }))
      } else {
        Config.set(cliInput.getParam('name'), cliInput.getParam('values')[0])
      }
    } catch (e) {
      cliPrinter.error(e.message)
      return cliNext(CLI_ERROR, e)
    }

    Config.save()
    return cliNext(CLI_SUCCESS)
  }

  /* Print all parameters */
  configDescribeParameters({ cliPrinter })
  return cliNext(CLI_SUCCESS)
})

const ExtensionsForSamplesEditor = ({ currentArray, newValues, cliInput }) => {
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
      currentValue = Config.get(configParam)
      cliPrinter.info(`  ${description[0]}`)
      cliPrinter.info(`  > current: ${(currentValue === null ? '' : currentValue)}`)
    }
  })
  cliPrinter.newLine()
}
