var qt = {},
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    im = require('imagemagick');


module.exports = qt;


// express 4 deprecation support
function sendfile(res, file) {
    res[ res.sendFile ? 'sendFile' : 'sendfile' ](file);
}


// Take an image from src, and write it to dst
qt.convert = function(options, callback){
    var src = options.src,
        dst = options.dst,
        width = options.width,
        height = options.height,
        quality = options.quality,
        type = options.type || 'crop';

    mkdirp(path.dirname(dst));

    var im_options = {
            srcPath : src,
            dstPath : dst
        };

    if (options.width) im_options.width = width;
    if (options.height) im_options.height = height;
    if (options.quality) im_options.quality = quality;

    try{
        im[type](im_options, function(err, stdout, stderr){
            if (err){
                return callback(err);
            }
            callback(null, dst);
        });
    }
    catch(err){
        return callback('qt.convert() ERROR: ' + err.message);
    }
};


// express/connect middleware
qt.static = function(root, options){

    root = path.normalize(root);

    options          || ( options = {} );
    options.type     || ( options.type = 'crop' );
    options.cacheDir || ( options.cacheDir = path.join(root, '.cache') );

    return function (req, res, next){
        var file = decodeURI(req.url.replace(/\?.*/,'')),
            dim = req.query.dim || "",
            orig = path.normalize(root + file),
            dst = path.join(options.cacheDir, options.type, dim, file);

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
                        return sendfile(res, file);
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
                opts = {
                    src : orig,
                    dst : dst,
                    width : dims[0],
                    height : dims[1],
                    type : options.type
                };

            qt.convert(opts, function(err, dst){
                if (err){
                    console.error(err);
                    return next();
                }
                sendfile(res, dst);
            });
        });
    };
};
