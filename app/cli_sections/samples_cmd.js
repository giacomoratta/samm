let cmd_name = 'samples';

CliMgr.addCommand(cmd_name+'');

CliMgr.addCommandHeader(cmd_name)
    .description('Shows all the indexed samples.'+"\n");

CliMgr.addCommandBody(cmd_name,function(cliReference,cliNextCb,cliData){
    SamplesMgr.printSamplesTree();
    return cliNextCb(cliData.success_code);
});