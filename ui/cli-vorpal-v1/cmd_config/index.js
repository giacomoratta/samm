const { App, Cli } = require('../ui_common')
const { ConfigAPI } = App

const commandName = 'config'

Cli.addCommand(commandName, '[name] [values...]')

Cli.addCommandHeader(commandName)
  .autocomplete(ConfigAPI.getFieldsList())
  .description('Get or set the value of a configuration parameter. \n')
  .option('-r, --remove', 'Remove a key or a value from a complex parameter (e.g. list, key-value map)')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  const paramName = cliInput.getParam('name')

  if (paramName) {
    /* Invalid parameter */
    if (!ConfigAPI.has(paramName)) {
      cliPrinter.warn(`Config parameter ${paramName} does not exist.`)
      return cliNext()
    }

    /* Print single parameter */
    if (!cliInput.getParam('values')) {
      cliPrinter.info(`${ConfigAPI.field(paramName).description[0]}.`)
      cliPrinter.value(ConfigAPI.field(paramName).valueRef, '> current')
      return cliNext()
    }

    /* Change parameters and save */
    let newConfigValue
    if (paramName === 'ExcludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: ConfigAPI.field('ExcludedExtensionsForSamples').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'IncludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: ConfigAPI.field('IncludedExtensionsForSamples').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'SamplesDirectoryExclusions') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: ConfigAPI.field('SamplesDirectoryExclusions').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else {
      newConfigValue = cliInput.getParam('values')[0]
    }
    if (newConfigValue === null || newConfigValue === undefined) {
      cliPrinter.info(`Value not changed for ${paramName}: ${newConfigValue}`)
      return cliNext()
    }
    try {
      ConfigAPI.field(paramName).value = newConfigValue
      cliPrinter.info(`New value for ${paramName}: ${newConfigValue}`)
      await ConfigAPI.save()
    } catch (e) {
      cliPrinter.error('Cannot change the configuration.')
      cliPrinter.error(` > ${e.message}`)
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
  cliPrinter.info('CONFIGURATION PARAMETERS')
  ConfigAPI.getFieldsList().forEach((configParam) => {
    cliPrinter.title(configParam)
    const description = ConfigAPI.field(configParam).description
    if (description.length > 0) {
      currentValue = ConfigAPI.field(configParam).value
      cliPrinter.info(`  ${description[0]}.`)

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
