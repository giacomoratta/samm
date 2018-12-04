CliMgr.addCommand('config <action>');

CliMgr.addCommandHeader('config')
    .description('Some useful actions with the working directories (e.g. Samples, Project, etc.)'+
        "\n  $ dir ext  / show the full list of extensions and useful stats"+
        "\n  $ dir ext -e exe  / show the full list of file with the specified extension"+"\n")
    .option('-e, --extension <name>', 'Focus on the specified extension.')
    .option('-i, --index', 'Works with the internal samples index')
    .autocomplete(['ext']);

CliMgr.addCommandBody('config',function(cliReference,cliNextCb,cliData){
    let action = cliData.cli_params.get('action');
    if(action === 'ext'){
        DirCommand.listExtensionsStats({
            extension:cliData.cli_params.getOption('extension'),
            index:cliData.cli_params.hasOption('index')
        });
        return cliNextCb(cliData.success_code);
    }
    return cliNextCb(cliData.error_code);
});