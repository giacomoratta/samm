let cmd_name = 'bookm';

CliMgr.addCommand(cmd_name+'');

CliMgr.addCommandHeader(cmd_name)
    .description("Prints the samples collection to work with in the next command '"+cmd_name+" set'."+"\n")
    .option('-a, --all', 'Shows all the bookmarks')
    .option('-l, --lookup', 'Shows the latest lookup')
    .option('-t, --tag <tag>', 'Shows the bookmarks under the specified custom tag')
    .option('-s, --save', 'Save bookmarks in the current project');

CliMgr.addCommandBody(cmd_name,function(cliReference,cliNextCb,cliData){
    let C_bookm_options = {
        all:cliData.cli_params.hasOption('all'),
        lookup:cliData.cli_params.hasOption('lookup'),
        save:cliData.cli_params.hasOption('save'),
        tag:cliData.cli_params.getOption('tag')
    };

    if(C_bookm_options.save===true){
        // generateSamplesDir
        return cliNextCb(cliData.success_code);
    }

    let matchAddId = function(v){
        if(_.startsWith(v,'!')) return null;
        let v1=Utils.strToInteger(v);
        return (v1!==null?v1:null);
    };
    let matchRemoveId = function(v){
        if(!_.startsWith(v,'!')) return null;
        let v1=Utils.strToInteger(v.substring(1));
        return (v1!==null?v1:null);
    };
    let matchLabel = function(v){
        if(!(_.isString(v) && v.length>0)) return null;
        if(matchAddId(v)===null && matchRemoveId(v)===null) return v;
        return null;
    };

    BookmarksMgr.workingSet(C_bookm_options); //get and set internal working set

    let p1 = ()=>{
        if(!BookmarksMgr.printWorkingSet(
                C_bookm_options,
                function(msg){ cliData.ui.print(msg); },
                function(msg){ clUI.print(msg); }
            )){
            return cliNextCb(cliData.success_code);
        }

        cliReference.prompt({
            type: 'input',
            name: 'clicmd',
            message: "['q' to quit] > "
        }, (result)=>{
            let cliInput = new CliParams(result.clicmd, null, true);
            let bookmLabel = cliInput.filterGet(0,matchLabel);
            let addIds = cliInput.filterValues(matchAddId);
            let removeIds = cliInput.filterValues(matchRemoveId);
            if(result.clicmd === 'q'){
                BookmarksMgr.save();
                return cliNextCb(cliData.success_code);
            }
            BookmarksMgr.set(addIds, removeIds, bookmLabel, C_bookm_options.tag);
            return p1();
        });
    };
    p1();
});