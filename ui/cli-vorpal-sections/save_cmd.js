const cmd_name = 'save'

cliMgr.addCommand(cmd_name + '')

cliMgr.addCommandHeader(cmd_name)
  .description('Create a directory with the samples previously found; the directory name is set automatically with some tag names.' + '\n')
  .option('-d, --dirname <dirname>', 'Save in a directory with a custom name.')
  .option('-p, --path <path>', 'Absolute custom path.')
  .option('-o, --overwrite', 'Overwrite the existent directory.')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  if (!ProjectsMgr.current) {
    cliData.ui.print('project directory is not set; check the configuration.')
    return cliNextCb(cliData.error_code)
  }

  const smp_obj = SamplesMgr.getLatestLookup()
  if (!_.isObject(smp_obj)) {
    cliData.ui.print('latest lookup missing.')
    return cliNextCb(cliData.error_code)
  }

  let C_save_options = {
    dirname: cliData.cli_params.getOption('dirname'), // custom name
    overwrite: cliData.cli_params.getOption('overwrite'), // force overwrite
    path: cliData.cli_params.getOption('path') // absolute path
  }

  // check path if is a good absolute path and exists
  if (_.isString(C_save_options.path) && !Utils.File.isAbsoluteParentDirSync(C_save_options.path, true)) {
    cliData.ui.print('path is not an absolute path or it does not exists.')
    return cliNextCb(cliData.error_code)
  }

  C_save_options = SamplesMgr.generateSamplesDir_setOptions(smp_obj, C_save_options)

  cliData.ui.print('' + smp_obj.size(), 'samples will be saved in', C_save_options.path)
  if (C_save_options.overwrite) cliData.ui.print('... and this path will be overwritten!')
  clUI.print()

  const _self = this
  cliReference.prompt({
    type: 'input',
    name: 'answer',
    message: 'Do you want to proceed? [y/n] '
  }, function (result) {
    if (result.answer !== 'y') {
      return cliNextCb(_self._success_code)
    }
    SamplesMgr.generateSamplesDir(smp_obj, C_save_options).then(function (smp_copied_obj) {
      if (!_.isObject(smp_copied_obj)) {
        cliData.ui.print('no file saved [error#1].')
        return cliNextCb(_self._error_code)
      }
      if (smp_copied_obj.size() === 0) {
        cliData.ui.print('no file saved.')
        return cliNextCb(_self._error_code)
      }
      smp_copied_obj.print()
      cliData.ui.print('' + smp_copied_obj.size() + '/' + smp_obj.size() + ' files saved.')
      return cliNextCb(_self._success_code)
    }).catch(() => {
      cliData.ui.print('no file saved [error#2].')
      return cliNextCb(_self._error_code)
    })
  })
})
