const { App, Cli, CLI_SUCCESS, CLI_ERROR } = require('./common')

const Config = App.Config

const ConfigParameters = [
  'SamplesDirectory',
  'CurrentProject',
  'RandomCount',
  'MaxOccurrencesSameDirectory',
  'ExcludedExtensionsForSamples',
  'IncludedExtensionsForSamples',
  'ExtensionsPolicy'
]

const commandName = 'config'

Cli.addCommand( `${commandName} [name] [values...]`)

Cli.addCommandHeader(commandName)
  .autocomplete(ConfigParameters)
  .description('Get or set the value of a configuration parameter. \n')
  .option('-r, --remove', 'Remove a key or a value from a complex parameter (e.g. list)')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {

  const paramName = cliInput.getParam('name')

  if(paramName) {

    /* Invalid parameter*/
    if(!Config.hasField(paramName)) {
      cliPrinter.warn(`Config parameter ${paramName} does not exist.`)
      return cliNext(CLI_SUCCESS)
    }

    /* Print single parameter */
    if(!cliInput.getParam('values')) {
      cliPrinter.info(Config.getField(paramName).describe()[0])
      cliPrinter.value(Config.get(paramName),'> current')
      return cliNext(CLI_SUCCESS)
    }

    /* Change parameters and save */
    try {
      if(paramName === 'ExcludedExtensionsForSamples') {

      } else if(paramName === 'IncludedExtensionsForSamples') {

      } else {
        Config.set(cliInput.getParam('name'), cliInput.getParam('values')[0])
      }
    } catch(e) {
      cliPrinter.error(e.message)
      return cliNext(CLI_ERROR,e)
    }

    Config.save()
    return cliNext(CLI_SUCCESS)
  }

  /* Print all parameters */
  configDescribeParameters({ cliPrinter })
  cliNext(CLI_SUCCESS)
})

const ExtensionsForSamplesEditor = ({ currentValue, newValue, thisCli, cliInput, cliPrinter }) => {
  let nextValue = []
  if(cliInput.hasOption('remove')) {
    // todo: difference
    // nextValue = ...
  } else {
    // todo: union with no duplicates
    // nextValue = new Set(currentValue, newValue)
  }
}

const configDescribeParameters = ({ cliPrinter }) => {
  ConfigParameters.forEach(( configParam ) => {
    cliPrinter.title(configParam)
    let description = Config.getField(configParam).describe()
    if(description.length>0){
      cliPrinter.info(`  ${description[0]}`)
      cliPrinter.info(`  > current: ${Config.get(configParam)}`)
    }
  })
  cliPrinter.newLine()
}
