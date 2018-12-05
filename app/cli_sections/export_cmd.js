let cmd_name = 'export';

CliMgr.addCommand(cmd_name+' <data>');

CliMgr.addCommandHeader(cmd_name)
    .description("Export project or samples data in a compressed archive. " +
        "Allowed values: project (export the project) and bookm (export bookmarks collection)."+"\n")
    .autocomplete(['bookm','project']);
    //.option('-t, --type <type>', 'Archive type (zip, tar, gzip)')

CliMgr.addCommandBody(cmd_name, function(cliReference,cliNextCb,cliData){

    if(!ConfigMgr.path('export_directory')){
        cliData.ui.print("no valid export directory; set an existent directory for data export.");
        return cliNextCb(cliData.error_code);
    }

    let ExportFn = null;
    let C_export_options = {
        param_data:cliData.cli_params.get('data'),
    };
    let archFD_options = {
        sourcePath:null,
        destPath:ConfigMgr.path('export_directory')
    };

    if(C_export_options.param_data === 'project'){
        if(ProjectsMgr.current){
            cliData.ui.print("no valid project directory; set an existent project directory.");
            return cliNextCb(cliData.error_code);
        }
        archFD_options.sourcePath = ProjectsMgr.current;
        ExportFn = function(opt){
            cliData.ui.print("exporting the project "+ProjectsMgr.current+"\n          to "+archFD_options.destPath+" ...");
            return ExportMgr.exportProject(opt);
        };
    }

    else if(C_export_options.param_data === 'bookm'){
        if(!BookmarksMgr.hasBookmarks()){
            cliData.ui.print("your bookmarks collection is empty.");
            return cliNextCb(cliData.error_code);
        }
        ExportFn = function(opt){
            cliData.ui.print("exporting bookmarks to "+archFD_options.destPath+" ...");
            return ExportMgr.exportBookmarks(opt);
        };
    }

    if(!_.isFunction(ExportFn)) return cliNextCb(cliData.error_code);

    ExportFn(archFD_options).then((d)=>{
        cliData.ui.print("exported "+d.total_bytes+"B to "+d.archive_path);
        return cliNextCb(cliData.success_code);
    }).catch((e)=>{
        cliData.ui.warning("error while creating and exporting the archive");
        cliData.ui.warning(e.code,e.message);
        return cliNextCb(cliData.error_code);
    });

});