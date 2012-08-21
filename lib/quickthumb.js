(function(){

    var qt = {},
        fs = require('fs'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        async = require('async'),
        ei = require('easyimage');

    module.exports = qt;

    qt.test = function(){
        return 'qt.test';
    };

    qt.isImageQuick = function(path){
        return /\.(jpg|png|gif)$/.test(path);
    };

    qt.isImage = function(path){
        // TODO, make this check Magic
        return qt.isImageQuick(path);
    };

    qt.findImages = function(src){
        var all_files = [],
            files = [],
            stat = fs.statSync(src);

        //TODO make this recursive
        if (stat.isFile()){
            all_files.push(src);
        }
        else if (stat.isDirectory()){
            var filenames = fs.readdirSync(src);
            filenames.forEach(function(filename){
                var f = path.join(src, filename),
                    stat = fs.statSync(f);
                if (stat.isFile()){
                    all_files.push(f);
                }
            });
        }
        all_files.forEach(function(file){
            if (qt.isImage(file)){
                files.push(file);
            }
        });
        return files;
    };


    // Take all the images from src, convert them, and write them to dst
    qt.convert = function(options, callback){
        var src = options.src,
            dst = options.dst,
            width = options.width,
            height = options.height,
            limit = options.limit || 1;

        var images = qt.findImages(src);

        mkdirp(dst);

        function convert(file, callback){
            var filename = path.basename(file),
                ei_options = {
                    src : file,
                    dst : path.join(dst, filename),
                    width : width,
                    height : height
                };

            ei.rescrop(ei_options, function(err, image){
                if (err){
                    throw err;
                }
                console.log('Resized:', image);
                callback(null);
            });
        }

        async.forEachLimit(images, limit, convert, function(err){
            callback(err, images);
        });
    };

})();