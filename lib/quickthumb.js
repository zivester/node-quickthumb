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
                orig = path.normalize(root + file),
                dst = path.join(cache_root, dim, file);

            function send_if_exists(file, callback){
                fs.exists(file, function(exists){
                    if (!exists){
                        return callback();
                    }

                    fs.stat(file, function(err, stats){
                        if (err){
                            console.error(err);
                        }
                        else if (stats.isFile()){
                            return res.sendfile(file);
                        }
                        callback();
                    });
                });
            }

            if (!dim){
                return send_if_exists(orig, next);
            }

            send_if_exists(dst, function(){
                var dims = dim.split(/x/g),
                    options = {
                        src : orig,
                        dst : dst,
                        width : dims[0],
                        height : dims[1]
                    };

                qt.convert(options, function(err, dst){
                    if (err){
                        console.error(err);
                        return next();
                    }
                    res.sendfile(dst);
                });
            });
        };
    };

})();