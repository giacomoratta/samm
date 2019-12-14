const cmd_name = 'samples'

cliMgr.addCommand(cmd_name + '')

cliMgr.addCommandHeader(cmd_name)
  .description('Shows all the indexed samples.' + '\n')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  SamplesMgr.printSamplesTree()
  return cliNextCb(cliData.successCode)
})
