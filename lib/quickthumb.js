(function(){

    var qt = {},
        fs = require('fs'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        async = require('async'),
        ei = require('easyimage');

    module.exports = qt;

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
            overwrite = options.overwrite || false,
            limit = options.limit || 1;

        var images = qt.findImages(src),
            converted = [];

        mkdirp(dst);

        function convert(file, callback){
            var filename = path.basename(file),
                fpath = path.join(dst, filename);

            function _success(){
                converted.push(fpath);
                callback(null);
            }

            function _convert(){
                var ei_options = {
                    src : file,
                    dst : fpath,
                    width : width,
                    height : height
                };
                ei.rescrop(ei_options, function(err, image){
                    if (err){
                        return callback(err);
                    }
                    console.log('Resized:', image);
                    _success();
                });
            }

            if (overwrite){
                return _convert();
            }

            fs.exists(fpath, function(exists){
                if (exists){
                    console.log('USING CACHE', fpath);
                    _success();
                }
                else{
                    _convert();
                }
            });
        }

        async.forEachLimit(images, limit, convert, function(err){
            if (err){
                console.error("qt.convert() ERROR:", err);
            }
            callback(err, converted);
        });
    };


    qt.express = function(root){
        root = path.normalize(root);
        console.log('ROOT', root);

        return function (req, res, next){
            var file = req.url.replace(/\?.*/,''),
                dim = req.query.dim,
                fpath = path.normalize(root + file);

            console.log('fpath', fpath);
            console.log('file', file);

            fs.exists(fpath, function(exists){
                if (!exists){
                    return next();
                }

                fs.stat(fpath, function(err, stats){
                    if (!stats.isFile()){
                        return next();
                    }

                    if (exists && !dim){
                        return res.sendfile(fpath);
                    }

                    var dims = dim.split(/x/g),
                        dst = path.join(root, '.cache', dim, path.dirname(file)),
                        options = {
                            src : fpath,
                            dst : dst,
                            width : dims[0] || undefined,
                            height : dims[1] || undefined,
                        };

                    console.log(options);
                    qt.convert(options, function(err, images){
                        if (err){
                            return next();
                        }
                        res.sendfile(images[0]);
                    });
                });
            });
        };
    };

})();