class PathInfo {
    constructor(initdata){
        this.error = true;
        this._info = {};

        if(_.isString(initdata)){
            let absPath = initdata;
            let p_info = Utils.File.pathParse(absPath);
            if(!p_info) return;
            let stats = Utils.File.getPathStatsSync(absPath);
            if(!stats) return;
            this.error = false;

            this._info = p_info;
            this._info.path = absPath;
            this._info.level = 1;
            this._info.size = (stats.size?stats.size:0);
            this._info.is_file = stats.isFile();
            this._info.is_directory = stats.isDirectory();

        }else if(_.isObject(initdata) && initdata.constructor.name === 'PathInfo'){
            this.error = false;
            this._info = initdata._info;
        }
    }

    isEqualTo(obj2){
        return (
            (this._info.path===obj2._info.path)
            && (this._info.root===obj2._info.root)
            && (this._info.dir===obj2._info.dir)
            && (this._info.base===obj2._info.base)
            && (this._info.ext===obj2._info.ext)
            && (this._info.name===obj2._info.name)
            && (this._info.level===obj2._info.level)
            && (this._info.rel_root===obj2._info.rel_root)
            && (this._info.rel_path===obj2._info.rel_path)
            && (this._info.size===obj2._info.size)
            && (this._info.is_file===obj2._info.is_file)
            && (this._info.is_directory===obj2._info.is_directory)
        );
    }

    get root() { return this._info.root; }
    set root(root) { this._info.root = root; }

    get dir() { return this._info.dir; }
    set dir(dir) { this._info.dir = dir; }

    get base() { return this._info.base; }
    set base(base) { this._info.base = base; }

    get ext() { return this._info.ext; }
    set ext(ext) { this._info.ext = ext; }

    get name() { return this._info.name; }
    set name(ext) { this._info.name = name; }

    get path() { return this._info.path; }
    set path(ext) { this._info.path = path; }

    get size() { return this._info.size; }
    set size(size) { this._info.size = size; }

    get isFile() { return this._info.is_file; }
    get isDirectory() { return this._info.is_directory; }

    get rel_root() { return this._info.rel_root; }
    set rel_root(root) {
        this._info.rel_root = root;
        this._info.rel_path = this._info.path.substring(this._info.rel_root.length);

        if(this._info.rel_path.endsWith(Utils.File.pathSeparator)) this._info.rel_path = this._info.rel_path.substr(0,this._info.rel_path.length-2);
        if(this._info.rel_path.length>0) this._info.level = 1+_.split(this._info.rel_path,Utils.File.pathSeparator).length;
    }
    get rel_path() { return this._info.rel_path; }
    get level() { return this._info.level; }

    get sizeString() {
        return Utils.String.filesizeToStr(this._info.size);
    }

    checkExt(ext){
        if(this.ext===ext) return true;
        if(ext[0]!=='.') ext='.'+ext;
        return (this.ext===ext);
    }

    toJson(){
        return this._info;
    }

    fromJson(data){
        this._info = data;
        this.error = false;
    }
}

module.exports = PathInfo;
