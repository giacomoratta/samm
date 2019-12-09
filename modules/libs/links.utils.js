
class Utils_Links {

    constructor(parent){
        this.utils = parent;
        this._regexp = {
            url_domain:/^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im
            /*  'http://abc.ggg.com/kjhsf?fdklsjd'.match(rg)
                [
                    'http://abc.ggg.com',
                    'abc.ggg.com',
                    index: 0,
                    input: 'http://abc.ggg.com/kjhsf?fdklsjd'
                ]
            */
        };
    }


    getSitename(url){
        let url_pieces = url.match(this._regexp.url_domain);
        if(url_pieces.length<2) return '';
        let lastDot = url_pieces[1].lastIndexOf('.');
        if(lastDot>0){
            url_pieces[1] = url_pieces[1].substr(0,lastDot);
        }
        url_pieces[1] = _.upperFirst(url_pieces[1]);
        return url_pieces[1];
    }
}

module.exports = Utils_Links;
