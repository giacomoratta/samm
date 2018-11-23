const archiver = require('archiver');

class ExportManager {

    constructor(){
        this._ARCHIVER = archiver;
    }


    exportBookmarks(options){
        options.sourcePath=null;
        return this.__export(function(archive, o /*parsed options*/){
            let archive_name = 'mpl_bookmarks';
            let archive_path = Utils.File.checkAndSetDuplicatedFileNameSync( Utils.File.pathJoin( o.destPath, archive_name+'_'+Utils.dateToYYYYMMDD()+'.zip' ) );

            archive.append(null, { name: archive_name+'/' }); // ROOT

            BookmarksMgr.forEach(function(value,index,label,diffLb){
                if(label==='_') label='_unlabeled';
                if(diffLb===true){
                    archive.append(null, { name: archive_name+'/'+label+'/' });
                }
                archive.append(value.path, { name: archive_name+'/'+label+'/'+value.base });
            });
            return {
                archive_path:archive_path
            };
        },options);
    }


    exportProject(options){
        return this.__export(function(archive, o /*parsed options*/){
            let archive_path = Utils.File.checkAndSetDuplicatedFileNameSync(
                Utils.File.pathJoin( o.destPath, Utils.File.pathBasename(o.sourcePath)+'_'+Utils.dateToYYYYMMDD()+'.zip' )
            );
            archive.directory(o.sourcePath, Utils.File.pathBasename(o.sourcePath));
            return {
                archive_path:archive_path
            };
        },options);
    }


    __export(configFn,options){
        let _self = this;
        options = _.merge({
            sourcePath:null,
            destPath:null,
            compressionLevel:0
        },options);
        return new Promise(function(res,rej){

            if(options.sourcePath && !Utils.File.directoryExistsSync(options.sourcePath)){
                return rej({ code:'ENOENT_SOURCE' });
            }
            if(options.destPath && !Utils.File.directoryExistsSync(options.destPath)){
                return rej({ code:'ENOENT_DEST' });
            }

            let archive = _self._ARCHIVER('zip', {
                zlib: { level: options.compressionLevel } // Sets the compression level.
            });

            let config = configFn(archive, options);

            // create a file to stream archive data to.
            let output = Utils.File._FS.createWriteStream(config.archive_path);

            output.on('close', function() {
                res({
                    archive_path: config.archive_path,
                    total_bytes: archive.pointer()
                });
            });

            //output.on('end', function() { console.log('Data has been drained'); });

            archive.on('warning', function(err) {
                rej(err);
            });

            archive.on('error', function(err) {
                rej(err);
            });
            archive.pipe(output);
            archive.finalize();
        });
    }

}

module.exports = new ExportManager();
