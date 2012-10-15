var fs = require('fs'),
    path = require('path'),
    qt = require('../');

function exit(msg){
    console.log(msg);
    process.exit();
}

if (process.argv.length < 5){
    exit('Usage: make-thumb.js src dst (<width>x<height>|<width>|x<height>) [-r] [-p] [--resize]');
}

var args = process.argv.slice(2),
    dimensions = args[2],
    src = args[0],
    dst = args[1],
    options = args.slice(3),
    recursive = false,
    width = '',
    height = '',
    type = 'crop';

// Create dimension directories
// e.g. 200x150, 200, etc
if (options.indexOf('-p') != -1){
    dst = path.join(dst, dimensions);
}

// Recursive
if (options.indexOf('-r') != -1){
    recursive = true;
}

// Resize
if (options.indexOf('--resize') != -1){
    type = 'resize';
}

(function(){
    var match = /(\d*)x?(\d*)/.exec(dimensions);
    if (!match) {
        exit('dimensions must be <width>x<height>');
    }
    if (match[1]){
        width = match[1];
    }
    if (match[2]){
        height = match[2];
    }
})();

console.log('Converting to ' + width + ' x ' + height);


if (!fs.existsSync(src)){
    exit('Cannot read ' + src);
}

function convert(src, dst){
    qt.convert({
        src : src,
        dst : path.join(dst, path.basename(src)),
        width : width,
        height : height,
        type : type
    }, function(err, image){
        if (err){
            return console.error(err);
        }
        console.log("CREATED", image);
    });
}

function processDir(src, dst){
    fs.readdirSync(src).forEach(function(filename){
        var spath = path.join(src, filename);
        if (fs.statSync(spath).isFile()){
            convert(spath, dst);
        }
        else if (recursive){
            processDir(spath, path.join(dst, filename));
        }
    });
}

if (fs.statSync(src).isFile()){
    convert(src, dst);
}
else{
    processDir(src, dst);
}
