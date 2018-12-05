let cmd_name = 'project';

CliMgr.addCommand(cmd_name+'');

CliMgr.addCommandHeader(cmd_name)
    .description('Project manager (project path, default templates, history, etc.)'+
        "\n  $ "+cmd_name+"                                  / shows current project"+
        "\n  $ "+cmd_name+" -p \"/absolute/path/project/\"   / shows current project"+
        "\n  $ "+cmd_name+" -d                               / shows default templates"+
        "\n  $ "+cmd_name+" -d name                          / set new default template"+
        "\n  $ "+cmd_name+" -d !name                         / remove a default template"+
        "\n")
    .option('-p, --path <path>', 'Set current project from its absolute path')
    .option('-h, --history', 'Set current project by choosing a project from history')
    .option('-d, --default [default]', "View default projects; if a name is specified, "+
        "store the current project as default project or delete a default project")
    .option('-n, --new <default>', 'Create a new project from a default project');

CliMgr.addCommandBody(cmd_name,function(cliReference,cliNextCb,cliData){
    cliData.ui.print("[current]",ProjectsMgr.current);

    let C_Project_options = {
        path: cliData.cli_params.getOption('path'),
        history: cliData.cli_params.hasOption('history'),
        default_flag: cliData.cli_params.hasOption('default'),
        default_value: cliData.cli_params.getOption('default'),
        new: cliData.cli_params.getOption('new')
    };

    // Set current project from absolute path
    if(_.isString(C_Project_options.path) && C_Project_options.path.length>1){
        if(!Utils.File.directoryExistsSync(C_Project_options.path)){
            cliData.ui.print("this project path does not exist");
            return cliNextCb(cliData.error_code);
        }
        ProjectsMgr.current = C_Project_options.path;
        ProjectsMgr.save();
        cliData.ui.print("[new]",ProjectsMgr.current);
        return cliNextCb(cliData.success_code);
    }

    // Set current project from history
    if(C_Project_options.history === true){
        if(!ProjectsMgr.history.printIndexedList(function(v){
                clUI.print(v);
            })){
            cliData.ui.print('Projects history is empty.');
            return cliNextCb(cliData.success_code);
        }
        cliReference.prompt({
            type: 'input',
            name: 'index',
            message: "['q' to quit] > "
        }, (result)=>{
            if(result.index !== 'q'){
                let phistory = ProjectsMgr.history.get(parseInt(result.index)-1);
                if(!phistory){
                    cliData.ui.print("index out of bounds");
                }else{
                    if(!Utils.File.directoryExistsSync(phistory)){
                        cliData.ui.print("this project path does not exist!");
                        ProjectsMgr.history.remove(phistory);
                        return cliNextCb(cliData.error_code);
                    }
                    ProjectsMgr.current = phistory;
                    ProjectsMgr.save();
                    cliData.ui.print("[new]",ProjectsMgr.current);
                }
            }
            return cliNextCb(cliData.success_code);
        });
        return;
    }

    // Default projects
    if(C_Project_options.default_flag===true){
        if(_.isString(C_Project_options.default_value) && C_Project_options.default_value.length>1){
            C_Project_options.default_value = _.trim(C_Project_options.default_value);

            /* Remove default template */
            if(C_Project_options.default_value.startsWith('!')){
                C_Project_options.default_value = C_Project_options.default_value.substring(1);
                let defaultTemplate = ProjectsMgr.template.get(C_Project_options.default_value);
                if(!defaultTemplate) {
                    cliData.ui.print("Default template",C_Project_options.default_value,"not found");
                    return cliNextCb(cliData.error_code);
                }

                cliData.ui.print("The template",C_Project_options.default_value,"inside the directory",defaultTemplate,"will be removed.");
                cliReference.prompt({
                    type: 'input',
                    name: 'answer',
                    message: "Do you want to proceed? [y/n] "
                }, (result)=>{
                    if(result.answer === 'y'){
                        if(ProjectsMgr.template.remove(defaultTemplate)!==true){
                            cliData.ui.print("Cannot remove the default template");
                            return cliNextCb(cliData.error_code);
                        }else{
                            ProjectsMgr.save();
                        }
                    }
                    return cliNextCb(cliData.success_code);
                });
                return;
            }

            /* New default template */
            if(!ProjectsMgr.current){
                cliData.ui.print("No current project set");
                return cliNextCb(cliData.success_code);
            }
            cliData.ui.print("The current project","'"+ProjectsMgr.current+"'"," will be stored as template in",ProjectsMgr.template.dir);
            cliReference.prompt({
                type: 'input',
                name: 'answer',
                message: "Do you want to proceed? [y/n] "
            }, (result)=>{
                if(result.answer === 'y'){
                    ProjectsMgr.template.add(C_Project_options.default_value, ProjectsMgr.current).then((template)=>{
                        cliData.ui.print("New project template: ",template.template_path);
                        ProjectsMgr.save();
                        return cliNextCb(cliData.success_code);
                    }).catch((e)=>{
                        d$(e);
                        cliData.ui.print("Unexpected error",e.message);
                        return cliNextCb(cliData.error_code);
                    });
                }
                return cliNextCb(cliData.success_code);
            });
            return;
        }

        if(!ProjectsMgr.template.printIndexedList(function(v){
                clUI.print(v);
            })){
            cliData.ui.print('No project templates available.');
        }
        return cliNextCb(cliData.success_code);
    }

    // New project from default
    if(_.isString(C_Project_options.new) && C_Project_options.new.length>1){
        if(!ProjectsMgr.template.printIndexedList(function(v){
                clUI.print(v);
            })){
            cliData.ui.print('No project templates available.');
            return cliNextCb(cliData.success_code);
        }
        cliReference.prompt({
            type: 'input',
            name: 'index',
            message: "['q' to quit] > "
        }, (result)=>{
            if(result.index !== 'q'){
                let ptemplate = ProjectsMgr.template.get(parseInt(result.index)-1);
                if(!ptemplate){
                    cliData.ui.print("index out of bounds");
                    return cliNextCb(cliData.error_code);
                }

                /* Choose project path */
                let _projectPathList = ProjectsMgr.ppaths.printIndexedList(ProjectsMgr.current,function(v){
                    clUI.print(v);
                });
                cliReference.prompt({
                    type: 'input',
                    name: 'index',
                    message: "Write "+(_.isArray(_projectPathList)?"or choose":"")+" an absolute path ['q' to quit] > "
                }, (result)=>{
                    if(result.index !== 'q') {
                        let project_path = null;
                        let _index = parseInt(result.index);

                        // Get by index
                        if(_.isNumber(_index) && _index<=_projectPathList.length && _index>0) project_path=_projectPathList[_index-1];
                        if (!project_path) {
                            cliData.ui.print("index out of bounds");
                            return cliNextCb(cliData.error_code);
                        }

                        // Get by path
                        if(Utils.File.directoryExistsSync(result.index)) project_path=result.index;
                        if (!project_path) {
                            cliData.ui.print("path does not exist ",result.index);
                            return cliNextCb(cliData.error_code);
                        }

                        cliData.ui.print("\nA new project in",Utils.File.pathJoin(project_path,C_Project_options.new),
                            " will be created starting from the template",ptemplate);

                        // New project from template
                        cliReference.prompt({
                            type: 'input',
                            name: 'answer',
                            message: "Do you want to proceed? [y/n] "
                        }, (result)=>{
                            if(result.answer === 'y') {
                                ProjectsMgr.template.newProject(ptemplate, project_path, C_Project_options.new).then((data)=>{
                                    ProjectsMgr.current = data.project_path;
                                    ProjectsMgr.save();
                                    cliData.ui.print("[new current project]",ProjectsMgr.current);
                                    return cliNextCb(cliData.success_code);

                                }).catch((e)=>{
                                    d$(e);
                                    cliData.ui.print("Unexpected error",e.message);
                                    return cliNextCb(cliData.error_code);
                                });
                                return;
                            }
                            return cliNextCb(cliData.success_code);
                        });
                        return;
                    }
                    return cliNextCb(cliData.success_code);
                });
                return;
            }
            return cliNextCb(cliData.success_code);
        });
        return;
    }

    return cliNextCb(cliData.success_code);
});