const { compile } = require('nexe');
const package_json = require('./package.json');
global._ =  require('lodash');
global.Utils = require('./libs/Utils.js');

let b$cfg = {
    version:package_json.version,
    build_dir:Utils.File.setAsAbsPath('build'),
    compile_options:{
        input: './app-prod.js',
        output: null, //'./build/y',
        verbose:true
    },
    platforms:{
        /*
        * key: only [a-z\_]
        * _ will be replaced with . to create a signature
        */
        'mac_x64':{
            config_sample: Utils.File.setAsAbsPath('config.sample.unix.json',true),
            compile_options:{
                target: 'mac-x64-10.13.0'
            }
        },
        'win_x64':{
            config_sample: Utils.File.setAsAbsPath('config.sample.win.json',true),
            compile_options:{
                target: 'windows-x64-10.13.0'
            }
        },
        'win_x86':{
            config_sample: Utils.File.setAsAbsPath('config.sample.win.json',true),
            compile_options:{
                target: 'windows-x86-10.13.0'
            }
        },
        'linux_x64':{
            config_sample: Utils.File.setAsAbsPath('config.sample.unix.json',true),
            compile_options:{
                target: 'linux-x64-10.13.0'
            }
        },
        'linux_x86':{
            config_sample: Utils.File.setAsAbsPath('config.sample.unix.json',true),
            compile_options:{
                target: 'linux-x86-10.13.0'
            }
        },
    }

};

console.log("\n"+'MPL :: Build :: Start');

console.log("\n"+'Create directory for build ::',b$cfg.build_dir);
Utils.File.ensureDirSync(b$cfg.build_dir);

let compileForPlatform = function(platform){
    if(!b$cfg.platforms[platform]) return false;
    let poz = b$cfg.platforms[platform];

    poz.signature = platform.replace(/[_]/g,'.').replace(/[^a-zA-Z0-9.]/g,'');
    poz.signature = 'mpl.'+b$cfg.version+'.'+poz.signature;

    poz.compile_options = _.merge(b$cfg.compile_options,poz.compile_options);

    poz.build_dir = Utils.File.pathJoin(b$cfg.build_dir,poz.signature);
    poz.compile_options.output = Utils.File.pathJoin(poz.build_dir,'mpl');
    poz.config_sample_copy = Utils.File.pathJoin(poz.build_dir,'config.sample.json');

    console.log("\n"+'['+platform+'] Delete directory for build ::',poz.build_dir);
    Utils.File.removeDirSync(poz.build_dir);

    console.log("\n"+'['+platform+'] Create directory for build ::',poz.build_dir);
    Utils.File.ensureDirSync(poz.build_dir);

    console.log("\n"+'['+platform+'] Copying sample config file ::',poz.config_sample_copy);
    Utils.File.copyFileSync(poz.config_sample, poz.config_sample_copy);

    console.log(poz.compile_options);

    return compile(poz.compile_options).then(() => {
        console.log("\n"+'['+platform+'] Build complete ::',poz.compile_options.output,"\n");
        // TODO: create zip
    }).catch(() => {
        console.log("\n"+'['+platform+'] Build failed ::',poz.compile_options.output,"\n");
    });
};

let platformsToBuildFor = [
    //'mac_x64',
    'win_x64',
    //'win_x86',
    //'linux_x64',
    //'linux_x86'
];

if(platformsToBuildFor.length>0){
    let _recursivePromise = function(a,i){
        return compileForPlatform(a[i]).then(()=>{
            if(i>=a.length-1){
                console.log("\n"+'MPL :: Build :: Finished',"\n\n");
            }else{
                return _recursivePromise(a,i+1);
            }
        }).catch((e)=>{
            console.error("\n"+'MPL :: Build :: Error',e,"\n\n");
        });
    };
    _recursivePromise(platformsToBuildFor,0);
}

//Utils.EXIT();

/*
* compile for mac.x64
* compile for win.x86
* compile for win.x64
* compile for linux.x86
* compile for linux.x64
* make zip files and delete original directories
* */
//
// compile({
//     input: './app-prod.js',
//     output: './build/y',
//     verbose:true
// }).then(() => {
//     console.log('success')
// });
