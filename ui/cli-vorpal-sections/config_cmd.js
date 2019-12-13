const cmd_name = 'config'

cliMgr.addCommand(cmd_name + ' [name] [values...]')

cliMgr.addCommandHeader(cmd_name)
  .autocomplete(configMgr.getConfigParams())
  .description('Get or set the value of a configuration parameter.' +
        '\n  $ ' + cmd_name + ' / print the whole config and internal data' +
        '\n  $ ' + cmd_name + ' ExtensionCheckForSamples I[, E, X] (included/excluded/disabled)' +
        '\n  $ ' + cmd_name + ' ExcludedExtensionsForSamples ext / (or .ext)' +
        '\n  $ ' + cmd_name + ' ExcludedExtensionsForSamples !ext / (or !.ext)' + '\n')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  if (_.isNil(cliData.cliInput.get('name'))) {
    configMgr.printInternals()
    configMgr.print()
    return cliNextCb(cliData.successCode)
  }

  if (_.isNil(cliData.cliInput.get('values'))) {
    if (configMgr.exists(cliData.cliInput.get('name')) === true) {
      cliData.ui.print('this parameter does not exist.')
      return cliNextCb(cliData.errorCode)
    }
    clUI.print(configMgr.get(cliData.cliInput.get('name')))
    return cliNextCb(cliData.successCode)
  }

  if (configMgr.setFromCli(cliData.cliInput.get('name'), cliData.cliInput.get('values')) === false) {
    cliData.ui.print('configuration not changed')
    return cliNextCb(cliData.errorCode)
  }
  if (configMgr.save() !== true) {
    cliData.ui.print('error during file writing')
    return cliNextCb(cliData.errorCode)
  }
  configMgr.print()
  cliData.ui.print('configuration saved successfully')
  return cliNextCb(cliData.successCode)
})
