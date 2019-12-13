const cmd_name = 'dir'

cliMgr.addCommand(cmd_name + ' <action>')

cliMgr.addCommandHeader(cmd_name)
  .description('Some useful actions with the working directories (e.g. Samples, Project, etc.)' +
        '\n  $ ' + cmd_name + ' ext  / show the full list of libs and useful stats' +
        '\n  $ ' + cmd_name + ' ext -e exe  / show the full list of file with the specified extension' + '\n')
  .option('-e, --extension <name>', 'Focus on the specified extension.')
  .option('-i, --index', 'Works with the internal samples index')
  .autocomplete(['ext'])

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  const action = cliData.cliInput.get('action')
  if (action === 'ext') {
    DirCommand.listExtensionsStats({
      extension: cliData.cliInput.getOption('extension'),
      index: cliData.cliInput.hasOption('index')
    })
    return cliNextCb(cliData.successCode)
  }
  return cliNextCb(cliData.errorCode)
})
