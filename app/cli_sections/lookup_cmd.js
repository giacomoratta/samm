let cmd_name = 'lookup';

CliMgr.addCommand(cmd_name+' [query]');

CliMgr.addCommandHeader(cmd_name)
    .description("Perform a search for the tags and selects random samples; the tag query is an AND/OR query (','=or, '+'=and)."+"\n")
    .option('-a, --all', 'Show all samples which match the query (instead of the default random selection)')
    .option('-t, --tag <tag>', 'Tag for a query inside the configuration (see config set Tags <tag> <query>)',TQueryMgr.getTags());

CliMgr.addCommandBody(cmd_name,function(cliReference,cliNextCb,cliData){

    if(!SamplesMgr.hasSamplesIndex()){
        cliData.ui.print("no samples scan found; perform a scan before this command");
        return cliNextCb(cliData.error_code);
    }

    let tagString=null;

    if(cliData.cli_params.hasOption('tag')){
        tagString= cliData.cli_params.getOption('tag');
        if(!tagString){
            cliData.ui.print("empty tag");
            return cliNextCb(cliData.error_code);
        }
        tagString = TQueryMgr.get(tagString);
        if(_.isNil(tagString)){
            cliData.ui.print("unknown tag");
            return cliNextCb(cliData.error_code);
        }
    }else{
        tagString = cliData.cli_params.get('query');
    }

    if(!_.isString(tagString) || tagString.length<1){
        cliData.ui.print("empty tag list");
        return cliNextCb(cliData.error_code);
    }

    let random = !cliData.cli_params.hasOption('all');
    let smp_obj = SamplesMgr.searchSamplesByTags(tagString,random);
    if(_.isNil(smp_obj)){
        cliData.ui.print("no samples found");
        return cliNextCb(cliData.success_code);
    }
    if(smp_obj.error()){
        cliData.ui.print("sample search failed");
        return cliNextCb(cliData.error_code);
    }

    smp_obj.print();
    return cliNextCb(cliData.success_code);
});
