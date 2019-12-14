const cmd_name = 'tquery'

cliMgr.addCommand(cmd_name + ' [tag] [query]')

cliMgr.addCommandHeader(cmd_name)
  .description('Add, remove or view tagged queries (used by lookup -t <tag>)' + '\n')
  .option('-r, --remove', 'Remove the specified tag')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  const C_TQuery_options = {
    tag: cliData.cliInput.get('tag'),
    query: cliData.cliInput.get('query'),
    remove: cliData.cliInput.hasOption('remove')
  }

  if (C_TQuery_options.tag && C_TQuery_options.query) {
    if (TQueryMgr.add(C_TQuery_options.tag, C_TQuery_options.query)) {
      cliData.ui.print('Tag', "'" + C_TQuery_options.tag + "'", 'added succesfully')
      TQueryMgr.save()
    } else {
      cliData.ui.print('Tag', "'" + C_TQuery_options.tag + "'", 'not added')
    }
    return cliNextCb(cliData.successCode)
  }

  if (C_TQuery_options.tag) {
    // remove
    if (C_TQuery_options.remove === true) {
      if (TQueryMgr.remove(C_TQuery_options.tag)) {
        cliData.ui.print('Tag', "'" + C_TQuery_options.tag + "'", 'removed succesfully')
        TQueryMgr.save()
      } else {
        cliData.ui.print('Tag', "'" + C_TQuery_options.tag + "'", 'not removed')
      }
      return cliNextCb(cliData.successCode)
    }

    // get one tagged query
    const tquery = TQueryMgr.get(C_TQuery_options.tag)
    if (!tquery) {
      cliData.ui.print('Tag', "'" + C_TQuery_options.tag + "'", 'does not exist')
    } else {
      cliData.ui.print('Tag', "'" + C_TQuery_options.tag + "'", '=', tquery)
    }
    return cliNextCb(cliData.successCode)
  }

  TQueryMgr.printList(function (tag, query) { clUI.print('\n  ', tag + ':', query) })
  if (TQueryMgr.empty()) {
    cliData.ui.print('No tagged queries')
  }
  return cliNextCb(cliData.successCode)
})
