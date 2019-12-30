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

Cli.addCommand( `${commandName} [paramName] [values...]`)

Cli.addCommandHeader(commandName)
  .autocomplete(ConfigParameters)
  .description('Get or set the value of a configuration parameter. \n')
  .option('-r, --remove', 'Remove a key or a value from a complex parameter (e.g. list)')

Cli.addCommandBody(commandName, function ({ thisCli, cliNext, cliInput, cliPrinter }) {
  //console.log(cliData)
  configDescribeParameters({ cliPrinter })

  try {
    Config.set(cliInput.getParam('paramName'), cliInput.getParam('values')[0])
  } catch (e) {
    cliPrinter.error(e.message)
  }

  cliNext(CLI_SUCCESS)
})

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
