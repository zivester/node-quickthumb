(function(){

    var qt = {},
        fs = require('fs'),
        path = require('path'),
        mkdirp = require('mkdirp'),
        im = require('imagemagick');


    module.exports = qt;


    // Take an image from src, and write it to dst
    qt.convert = function(options, callback){
        var src = options.src,
            dst = options.dst,
            width = options.width,
            height = options.height,
            overwrite = options.overwrite || false;

        fs.exists(src, function(exists){
            if (!exists){
                return callback('src does not exist');
            }

            mkdirp(path.dirname(dst));

            function convert(){
                var im_options = {
                    srcPath : src,
                    dstPath : dst
                };

                if (options.width) im_options.width = width;
                if (options.height) im_options.height = height;

                try{
                    im.resize(im_options, function(err, stdout, stderr){
                        if (err){
                            return callback(err);
                        }
                        callback(null, dst);
                    });
                } catch(err) {
                    return callback('qt.convert() ERROR: ' + err.message);
                }
            }

            if (overwrite){
                return convert();
            }

            fs.exists(dst, function(exists){
                // Cache hit
                if (exists){
                    return callback(null, dst);
                }
                convert();
            });
        });
    };


    // express/connect middleware
    qt.static = function(root){

        var root = path.normalize(root),
            cache_root = path.join(root, '.cache');

        return function (req, res, next){
            var file = req.url.replace(/\?.*/,''),
                dim = req.query.dim,
                fpath = path.normalize(root + file);

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
                        dst = path.join(cache_root, dim, file),
                        options = {
                            src : fpath,
                            dst : dst,
                            width : dims[0],
                            height : dims[1]
                        };

                    qt.convert(options, function(err, image){
                        if (err){
                            console.error(err);
                            return next();
                        }
                        res.sendfile(image);
                    });
                });
            });
        };
    };

})();