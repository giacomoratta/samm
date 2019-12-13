const cmd_name = 'lookup'

cliMgr.addCommand(cmd_name + ' [query]')

cliMgr.addCommandHeader(cmd_name)
  .description("Perform a search for the tags and selects random samples; the tag query is an AND/OR query (','=or, '+'=and)." + '\n')
  .option('-a, --all', 'Show all samples which match the query (instead of the default random selection)')
  .option('-t, --tag <tag>', 'Tag for a query inside the configuration (see config set Tags <tag> <query>)', TQueryMgr.getTags())

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  if (!SamplesMgr.hasSamplesIndex()) {
    cliData.ui.print('no samples scan found; perform a scan before this command')
    return cliNextCb(cliData.errorCode)
  }

  let tagString = null

  if (cliData.cliInput.hasOption('tag')) {
    tagString = cliData.cliInput.getOption('tag')
    if (!tagString) {
      cliData.ui.print('empty tag')
      return cliNextCb(cliData.errorCode)
    }
    tagString = TQueryMgr.get(tagString)
    if (_.isNil(tagString)) {
      cliData.ui.print('unknown tag')
      return cliNextCb(cliData.errorCode)
    }
  } else {
    tagString = cliData.cliInput.get('query')
  }

  if (!_.isString(tagString) || tagString.length < 1) {
    cliData.ui.print('empty tag list')
    return cliNextCb(cliData.errorCode)
  }

  const random = !cliData.cliInput.hasOption('all')
  const smp_obj = SamplesMgr.searchSamplesByTags(tagString, random)
  if (_.isNil(smp_obj)) {
    cliData.ui.print('no samples found')
    return cliNextCb(cliData.successCode)
  }
  if (smp_obj.error()) {
    cliData.ui.print('sample search failed')
    return cliNextCb(cliData.errorCode)
  }

  smp_obj.print()
  return cliNextCb(cliData.successCode)
})
