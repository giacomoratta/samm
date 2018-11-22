const archiver = require('archiver');

class ExportManager {

    constructor(){
        this._ARCHIVER = archiver;
    }


    exportBookmarks(options){
        let _self = this;
        options = _.merge({
            sourcePath:null,
            destPath:null,
            compressionLevel:1,
            archiveNameFn:null
        },options);
        return new Promise(function(res,rej){
            if(!Utils.File.directoryExistsSync(options.destPath)){
                return rej({ code:'ENOENT_DEST' });
            }

            let archive_name = 'mpl_bookmarks';
            let archive_path = Utils.File.checkAndSetDuplicatedFileNameSync( Utils.File.pathJoin( options.destPath, archive_name+'_'+Utils.dateToYYYYMMDD()+'.zip' ) );

            // create a file to stream archive data to.
            let output = Utils.File._FS.createWriteStream(archive_path);
            let archive = _self._ARCHIVER('zip', {
                zlib: { level: options.compressionLevel } // Sets the compression level.
            });
            archive.append(null, { name: archive_name+'/' }); // ROOT

            BookmarksMgr.forEach(function(value,index,label,diffLb){
                if(label==='_') label='_misc';
                if(diffLb===true){
                    archive.append(null, { name: archive_name+'/'+label+'/' });
                }
                archive.append(value.path, { name: archive_name+'/'+label+'/'+value.base });
            });

            output.on('close', function() {
                res({
                    total_bytes:archive.pointer()
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

    exportProject(options){
        options.archiveNameFn = function(o){
            return Utils.File.checkAndSetDuplicatedFileNameSync( Utils.File.pathJoin( o.destPath, Utils.File.pathBasename(o.sourcePath)+'_'+Utils.dateToYYYYMMDD()+'.zip' ) );
        };
        return this.exportDirectory(options);
    }


    exportDirectory(options){
        let _self = this;
        options = _.merge({
            sourcePath:null,
            destPath:null,
            compressionLevel:1,
            archiveNameFn:null
        },options);
        return new Promise(function(res,rej){

            if(!Utils.File.directoryExistsSync(options.sourcePath)){
                return rej({ code:'ENOENT_SOURCE' });
            }
            if(!Utils.File.directoryExistsSync(options.destPath)){
                return rej({ code:'ENOENT_DEST' });
            }

            let archive_path = '';
            if(!_.isFunction(options.archiveNameFn)) archive_path=Utils.File.pathJoin(options.destPath,Utils.File.pathBasename(options.sourcePath)+'.zip');
            else archive_path=options.archiveNameFn(options);

            // create a file to stream archive data to.
            let output = Utils.File._FS.createWriteStream(archive_path);
            let archive = _self._ARCHIVER('zip', {
                zlib: { level: options.compressionLevel } // Sets the compression level.
            });
            archive.directory(options.sourcePath, Utils.File.pathBasename(options.sourcePath));

            output.on('close', function() {
                res({
                    total_bytes:archive.pointer()
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
