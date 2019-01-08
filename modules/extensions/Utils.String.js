
class Utils_String {

    constructor(){
    }


    cutByPreservingWords(v,max){
        if(v.length<max) return v;
        let i = this.php_stripos(v,' ',max*(-1));
        if(i===false) return v;
        return v.substr(0,i+1);
    }


    html_query_string(v){
        //TODO handle special characters
        //v = Utils.onlyLettersNumbers(v);
        return v.split(' ').splice(0,2).join('+');
    }


    php_stripos(fHaystack, fNeedle, fOffset){
        //  discuss at: http://locutus.io/php/stripos/
        let haystack = (fHaystack + '').toLowerCase();
        let needle = (fNeedle + '').toLowerCase();
        let index = 0;
        if(fOffset<0){
            fOffset *= -1;
            if ((index = (haystack + '').substr(0,fOffset).lastIndexOf(needle)) !== -1) {
                return index;
            }
        }else{
            if ((index = haystack.indexOf(needle, fOffset)) !== -1) {
                return index;
            }
        }
        return false
    }


    php_strripos(haystack, needle, offset){
        //  discuss at: http://locutus.io/php/strripos/
        haystack = (haystack + '').toLowerCase();
        needle = (needle + '').toLowerCase();
        let i = -1;
        if (offset) {
            i = (haystack + '')
                .slice(offset)
                .lastIndexOf(needle);
            // strrpos' offset indicates starting point of range till end,
            // while lastIndexOf's optional 2nd argument indicates ending point of range from the beginning
            if (i !== -1) {
                i += offset
            }
        } else {
            i = (haystack + '')
                .lastIndexOf(needle)
        }
        return i >= 0 ? i : false
    }
}

module.exports = new Utils_String();
