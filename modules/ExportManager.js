const archiver = require('archiver');

class ExportManager {

    constructor(){
        this._ARCHIVER = archiver;
    }


    exportBookmarks(options){
        //  add root directory 'mpl_bookmarks'
        //  archive.append(null, { name: 'mpl_bookmarks/' });
        //  foreach label
        //      archive.append(null, { name: 'mpl_bookmarks/label/' });
        //      foreach sample
        //          archive.append(<abspath>, { name: 'mpl_bookmarks/label/<basename>' });
        //  export
        let _self = this;
        options = _.merge({
            sourcePath:null,
            destPath:null,
            compressionLevel:9
        },options);
        return new Promise(function(res,rej){

            if(!Utils.File.directoryExistsSync(options.destPath)){
                return rej({ code:'ENOENT_DEST' });
            }

            // create a file to stream archive data to.
            let output = Utils.File._FS.createWriteStream(Utils.File.pathJoin(options.destPath,'mpl_bookmarks.zip'));
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


    exportProject(options){
        return this.exportDirectory(options);
    }

    exportDirectory(options){
        let _self = this;
        options = _.merge({
            sourcePath:null,
            destPath:null,
            compressionLevel:9
        },options);
        return new Promise(function(res,rej){

            if(!Utils.File.directoryExistsSync(options.sourcePath)){
                return rej({ code:'ENOENT_SOURCE' });
            }
            if(!Utils.File.directoryExistsSync(options.destPath)){
                return rej({ code:'ENOENT_DEST' });
            }

            // create a file to stream archive data to.
            let output = Utils.File._FS.createWriteStream(Utils.File.pathJoin(options.destPath,Utils.File.pathBasename(options.sourcePath)+'.zip'));
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
