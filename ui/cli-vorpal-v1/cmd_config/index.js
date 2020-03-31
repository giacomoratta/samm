const { API, Cli } = require('../ui_common')
const Config = API.config

const commandName = 'config'

Cli.addCommand(commandName, '[name] [values...]')

Cli.addCommandHeader(commandName)
  .autocomplete(Config.getFieldsList())
  .description('Get or set the value of a configuration parameter. \n')
  .option('-r, --remove', 'Remove a key or a value from a complex parameter (e.g. list, key-value map)')

Cli.addCommandBody(commandName, async function ({ cliNext, cliInput, cliPrinter }) {
  const paramName = cliInput.getParam('name')

  if (paramName) {
    /* Invalid parameter */
    if (!Config.has(paramName)) {
      cliPrinter.warn(`Config parameter ${paramName} does not exist.`)
      return cliNext()
    }

    /* Print single parameter */
    if (!cliInput.getParam('values')) {
      cliPrinter.info(Config.field(paramName).description[0])
      cliPrinter.value(Config.field(paramName).valueRef, '> current')
      return cliNext()
    }

    /* Change parameters and save */
    let newConfigValue
    if (paramName === 'ExcludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: Config.field('ExcludedExtensionsForSamples').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'IncludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: Config.field('IncludedExtensionsForSamples').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'SamplesDirectoryExclusions') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: Config.field('SamplesDirectoryExclusions').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else {
      newConfigValue = cliInput.getParam('values')[0]
    }
    if (!newConfigValue) return cliNext()
    try {
      Config.field(paramName).value = newConfigValue
      await Config.save()
    } catch (e) {
      cliPrinter.error(e.message)
    }
    return cliNext()
  }

  /* Print all parameters */
  configDescribeParameters({ cliPrinter })
  return cliNext()
})

// todo: replace with dataField.fn.bulkAdd and dataField.fn.bulkRemove
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
  Config.getFieldsList().forEach((configParam) => {
    cliPrinter.title(configParam)
    const description = Config.field(configParam).description
    if (description.length > 0) {
      currentValue = Config.field(configParam).value
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
