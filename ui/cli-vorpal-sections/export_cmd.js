const cmd_name = 'export'

cliMgr.addCommand(cmd_name + ' <data>')

cliMgr.addCommandHeader(cmd_name)
  .description('Export project or samples data in a compressed archive. ' +
        'Allowed values: project (export the project) and bookm (export bookmarks collection).' + '\n')
  .autocomplete(['bookm', 'project'])
// .option('-t, --type <type>', 'Archive type (zip, tar, gzip)')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  if (!configMgr.cfg_path('ExportDirectory')) {
    cliData.ui.print('no valid export directory; set an existent directory for data export.')
    return cliNextCb(cliData.error_code)
  }

  let ExportFn = null
  const C_export_options = {
    param_data: cliData.cli_params.get('data')
  }
  const archFD_options = {
    sourcePath: null,
    destPath: configMgr.cfg_path('ExportDirectory')
  }

  if (C_export_options.param_data === 'project') {
    if (!ProjectsMgr.current) {
      cliData.ui.print('no valid project directory; set an existent project directory.')
      return cliNextCb(cliData.error_code)
    }
    archFD_options.sourcePath = ProjectsMgr.current
    ExportFn = function (opt) {
      cliData.ui.print('exporting the project ' + ProjectsMgr.current + '\n          to ' + archFD_options.destPath + ' ...')
      return ExportMgr.exportProject(opt)
    }
  } else if (C_export_options.param_data === 'bookm') {
    if (!BookmarksMgr.hasBookmarks()) {
      cliData.ui.print('your bookmarks collection is empty.')
      return cliNextCb(cliData.error_code)
    }
    ExportFn = function (opt) {
      cliData.ui.print('exporting bookmarks to ' + archFD_options.destPath + ' ...')
      return ExportMgr.exportBookmarks(opt)
    }
  }

  if (!_.isFunction(ExportFn)) return cliNextCb(cliData.error_code)

  ExportFn(archFD_options).then((d) => {
    cliData.ui.print('exported ' + Utils.String.filesizeToStr(d.total_bytes) + ' to ' + d.archive_path)
    setTimeout(function () {
      return cliNextCb(cliData.success_code)
    }, 2000)
  }).catch((e) => {
    cliData.ui.warning('error while creating and exporting the archive')
    cliData.ui.warning(e.code, e.message)
    return cliNextCb(cliData.error_code)
  })
})
