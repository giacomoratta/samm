let cmd_name = 'config';

CliMgr.addCommand(cmd_name+' [name] [values...]');

CliMgr.addCommandHeader(cmd_name)
    .autocomplete(ConfigMgr.getConfigParams())
    .description("Get or set the value of a configuration parameter." +
        "\n  $ "+cmd_name+" / print the whole config and internal data" +
        "\n  $ "+cmd_name+" ExtensionCheckForSamples I[, E, X] (included/excluded/disabled)" +
        "\n  $ "+cmd_name+" ExcludedExtensionsForSamples ext / (or .ext)" +
        "\n  $ "+cmd_name+" ExcludedExtensionsForSamples !ext / (or !.ext)"+"\n");

CliMgr.addCommandBody(cmd_name,function(cliReference,cliNextCb,cliData){

    if(_.isNil(cliData.cli_params.get('name'))){
        ConfigMgr.printInternals();
        ConfigMgr.print();
        return cliNextCb(cliData.success_code);
    }

    if(_.isNil(cliData.cli_params.get('values'))){
        if(ConfigMgr.exists(cliData.cli_params.get('name'))===true){
            cliData.ui.print('this parameter does not exist.');
            return cliNextCb(cliData.error_code);
        }
        clUI.print(ConfigMgr.get(cliData.cli_params.get('name')));
        return cliNextCb(cliData.success_code);
    }

    if(ConfigMgr.setFromCli(cliData.cli_params.get('name'),cliData.cli_params.get('values'))===false){
        cliData.ui.print("configuration not changed");
        return cliNextCb(cliData.error_code);
    }
    if(ConfigMgr.save()!==true){
        cliData.ui.print("error during file writing");
        return cliNextCb(cliData.error_code);
    }
    ConfigMgr.print();
    cliData.ui.print("configuration saved successfully");
    return cliNextCb(cliData.success_code);
});
