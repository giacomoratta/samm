const cmd_name = 'coverage'

cliMgr.addCommand(cmd_name + '')

cliMgr.addCommandHeader(cmd_name)
  .description('Check the coverage of samples in according to the tag labels present in the configuration.' + '\n')
  .option('-p, --path <path>', 'Custom absolute path.')
  .option('-q, --query <query>', 'Custom query; e.g.\'tag1+tag2,tag3\'.')
  .option('-t, --tag <tag>', 'Tag for a query inside the configuration (see config set Tags <tag> <query>)', TQueryMgr.getTags())
  .option('-a, --allinfo', 'Shows also the covered files.')
  .option('-g, --progressive', 'Shows the results step-by-step.')

cliMgr.addCommandBody(cmd_name, function (cliReference, cliNextCb, cliData) {
  // TODO
  // -lt -gt per selezionare samples poco o troppo coperti
  // -t query label

  const C_coverage_options = {
    path: null, // custom path
    query: null, // query tags
    tag: '', // query tags

    allinfo: cliData.cli_params.hasOption('allinfo'),
    progressive: cliData.cli_params.hasOption('progressive')
  }

  /* PATH */
  C_coverage_options.path = cliData.cli_params.getOption('path')
  if (!_.isString(C_coverage_options.path)) {
    if (!SamplesMgr.hasSamplesIndex()) {
      cliData.ui.print('no samples index found;\n' +
                'perform a scan or specify an absolute path with -p option.')
      return cliNextCb(cliData.error_code)
    }
  } else if (!Utils.File.isAbsoluteParentDirSync(C_coverage_options.path) || !Utils.File.directoryExistsSync(C_coverage_options.path)) {
    // check path if is a good absolute path and exists
    cliData.ui.print('path is not an absolute path or it does not exists.')
    return cliNextCb(cliData.error_code)
  }

  /* QUERY */
  C_coverage_options.query = cliData.cli_params.getOption('query')
  C_coverage_options.tag = cliData.cli_params.getOption('tag')
  if (!C_coverage_options.query) {
    if (TQueryMgr.empty()) {
      cliData.ui.print('no tagged queries found.\n' +
                'Add one or more tagged query to the configuration or specify a custom query with -q option.')
      return cliNextCb(cliData.error_code)
    }
    if (_.isString(C_coverage_options.tag) && !TQueryMgr.get(C_coverage_options.tag)) {
      cliData.ui.print("query with tag '" + C_coverage_options.tag + "' not found.")
      return cliNextCb(cliData.error_code)
    }
  }

  // Check Coverage
  const cv_output = SamplesMgr.checkSamplesCoverage(C_coverage_options)
  if (cv_output === null || (_.isObject(cv_output) && cv_output.error === true)) {
    cliData.ui.print('something went wrong.')
    return cliNextCb(cliData.error_code)
  }

  // OUTPUT(s)
  const showCoverageOutput = (i) => {
    if (i < 0 || !cv_output.array[i]) {
      showUncoverageOutput()
      return
    }
    clUI.print(cv_output.array[i].output_line)
    if (C_coverage_options.allinfo) {
      cv_output.array[i].smpobj.print()
      clUI.print('')
    }

    if (C_coverage_options.progressive === true) {
      cliReference.prompt({
        type: 'input',
        name: 'action',
        message: "['q' to quit] "
      }, function (result) {
        if (result.action === 'q') {
          showUncoverageOutput()
          return
        }
        showCoverageOutput(i + 1)
      })
      return
    }
    showCoverageOutput(i + 1)
  }

  const showUncoverageOutput = (showuncovered) => {
    clUI.print(cv_output.uncovered_output_line)
    if (cv_output.uncovered_smpobj.size() < 11 || showuncovered === true /* || C_coverage_options.allinfo */) {
      cv_output.uncovered_smpobj.print()
      return cliNextCb(cliData.success_code)
    }
    if (_.isNil(showuncovered)) {
      clUI.print()
      cliReference.prompt({
        type: 'input',
        name: 'show',
        message: 'There are many uncovered samples. Do you want to show them? [y/n] '
      }, (result) => {
        if (result.show === 'y') showUncoverageOutput(true)
        return cliNextCb(cliData.success_code)
      })
      return
    }
    return cliNextCb(cliData.success_code)
  }

  showCoverageOutput(0)
})
