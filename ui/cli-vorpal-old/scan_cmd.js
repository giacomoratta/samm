const cmd_name = 'scan'

cliMgr.addCommand(cmd_name + '')

cliMgr.addCommandHeader(cmd_name)
  .description('Perform a full scan of the samples directory. ' +
        'If the index is already present the scan does not start, in order to avoid resource wasting.' + '\n')
  .option('-f, --force', 'Force the rescan.')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  const C_scan_options = {
    printFn: function (s) { cliData.ui.print(s) },
    force: cliData.cliInput.hasOption('force') // force scan
  }

  if (!cliData.cliInput.hasOption('force')) {
    if (SamplesMgr.sampleIndexFileExistsSync()) {
      cliData.ui.print('the index file already exists. Use -f to force a rescan.')
      return cliNextCb(cliData.errorCode)
    }
    C_scan_options.force = true
  }

  cliData.ui.print('indexing in progress...')
  const smp_obj = SamplesMgr.setSamplesIndex(C_scan_options)
  if (!_.isObject(smp_obj) || smp_obj.empty()) {
    cliData.ui.print('job failed')
    return cliNextCb(cliData.errorCode)
  }
  cliData.ui.print('' + smp_obj.size() + ' samples found')
  return cliNextCb(cliData.successCode)
})
