const { API, Cli, CLI_ERROR } = require('./ui_common')

const commandName = 'config'

Cli.addCommand(`${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .autocomplete(API.config.getFieldsList())
  .description('Get or set the value of a configuration parameter. \n')
  .option('-r, --remove', 'Remove a key or a value from a complex parameter (e.g. list)')

Cli.addCommandBody(commandName, async function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  const paramName = cliInput.getParam('name')

  if (paramName) {
    /* Invalid parameter */
    if (!API.config.has(paramName)) {
      cliPrinter.warn(`Config parameter ${paramName} does not exist.`)
      return cliNext()
    }

    /* Print single parameter */
    if (!cliInput.getParam('values')) {
      cliPrinter.info(API.config.field(paramName).description[0])
      cliPrinter.value(API.config.field(paramName).valueRef, '> current')
      return cliNext()
    }

    /* Change parameters and save */
    let newConfigValue
    if (paramName === 'ExcludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: API.config.field('ExcludedExtensionsForSamples').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'IncludedExtensionsForSamples') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: API.config.field('IncludedExtensionsForSamples').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else if (paramName === 'SamplesDirectoryExclusions') {
      newConfigValue = BasicArrayFieldEditor({
        currentArray: API.config.field('SamplesDirectoryExclusions').value,
        newValues: cliInput.getParam('values'),
        cliInput
      })
    } else {
      newConfigValue = cliInput.getParam('values')[0]
    }
    if (!newConfigValue) return cliNext()
    try {
      API.config.field(paramName).value = newConfigValue
      await API.config.save()
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
  API.config.getFieldsList().forEach((configParam) => {
    cliPrinter.title(configParam)
    const description = API.config.field(configParam).description
    if (description.length > 0) {
      currentValue = API.config.field(configParam).value
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
