const cmd_name = 'bookm'

cliMgr.addCommand(cmd_name + '')

cliMgr.addCommandHeader(cmd_name)
  .description("Prints the samples collection to work with in the next command '" + cmd_name + " set'." + '\n')
  .option('-a, --all', 'Shows all the bookmarks')
  .option('-l, --lookup', 'Shows the latest lookup')
  .option('-t, --tag <tag>', 'Shows the bookmarks under the specified custom tag')
  .option('-s, --save', 'Save bookmarks in the current project')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  const C_bookm_options = {
    all: cliData.cliInput.hasOption('all'),
    lookup: cliData.cliInput.hasOption('lookup'),
    save: cliData.cliInput.hasOption('save'),
    tag: cliData.cliInput.getOption('tag')
  }

  if (C_bookm_options.save === true) {
    // generateSamplesDir
    return cliNextCb(cliData.successCode)
  }

  const matchAddId = function (v) {
    if (_.startsWith(v, '!')) return null
    const v1 = Utils.strToInteger(v)
    return (v1 !== null ? v1 : null)
  }
  const matchRemoveId = function (v) {
    if (!_.startsWith(v, '!')) return null
    const v1 = Utils.strToInteger(v.substring(1))
    return (v1 !== null ? v1 : null)
  }
  const matchLabel = function (v) {
    if (!(_.isString(v) && v.length > 0)) return null
    if (matchAddId(v) === null && matchRemoveId(v) === null) return v
    return null
  }

  BookmarksMgr.workingSet(C_bookm_options) // get and set internal working set

  const p1 = () => {
    if (!BookmarksMgr.printWorkingSet(
      C_bookm_options,
      function (msg) { cliData.ui.print(msg) },
      function (msg) { clUI.print(msg) }
    )) {
      return cliNextCb(cliData.successCode)
    }

    cliReference.prompt({
      type: 'input',
      name: 'clicmd',
      message: "['q' to quit] > "
    }, (result) => {
      const cliInput = cliData.cliInput(result.clicmd, null, true)
      const bookmLabel = cliInput.filterGet(0, matchLabel)
      const addIds = cliInput.filterValues(matchAddId)
      const removeIds = cliInput.filterValues(matchRemoveId)
      if (result.clicmd === 'q') {
        BookmarksMgr.save()
        return cliNextCb(cliData.successCode)
      }
      BookmarksMgr.set(addIds, removeIds, bookmLabel, C_bookm_options.tag)
      return p1()
    })
  }
  p1()
})
