const imagedownloader = require('image-downloader');

class Utils_Network {

    constructor(){
    }

    downloadImage(source_url, dest_path){
        const options = {
          url: source_url,
          dest: dest_path
        };
        options.dest += Utils.File.pathExtname(options.url);

        return imagedownloader.image(options)
          .then(({ filename, image }) => {
            //d$('Download:', filename)
          })
          .catch((err) => {
            d$('Error:',options.url,"\n",err.message)
        });
    }
}

module.exports = new Utils_Network();
