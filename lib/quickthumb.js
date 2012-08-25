(function(){

    var qt = {},
        fs = require('fs'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        async = require('async'),
        ei = require('easyimage');

    module.exports = qt;


    // Take an image from src, and write it to dst
    qt.convert = function(options, callback){
        var src = options.src,
            dst = options.dst,
            width = options.width,
            height = options.height,
            overwrite = options.overwrite || false;

        console.log(options);

        fs.exists(src, function(exists){
            if (!exists){
                return callback('src does not exist');
            }

            mkdirp(path.dirname(dst));

            function convert(){
                var ei_options = {
                    src : src,
                    dst : dst,
                    width : width,
                    height : height
                };
                ei.rescrop(ei_options, function(err, image){
                    if (err){
                        return callback(err);
                    }
                    //console.log('Resized:', image);
                    callback(null, dst);
                });
            }

            if (overwrite){
                return convert();
            }

            fs.exists(dst, function(exists){
                if (exists){
                    console.log('CACHE HIT', dst);
                    return callback(null, dst);
                }
                convert();
            });
        });
    };


    // Express middleware
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

                    if (!dim){
                        return res.sendfile(fpath);
                    }

                    var dims = dim.split(/x/g),
                        dst = path.join(root, '.cache', dim, file),
                        options = {
                            src : fpath,
                            dst : dst,
                            width : dims[0] || undefined,
                            height : dims[1] || undefined,
                        };

                    qt.convert(options, function(err, image){
                        if (err){
                            return next();
                        }
                        res.sendfile(image);
                    });
                });
            });
        };
    };

})();