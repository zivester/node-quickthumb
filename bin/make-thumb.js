var fs = require('fs'),
    path = require('path'),
    qt = require('../');

function exit(msg){
    console.log(msg);
    process.exit();
}

if (process.argv.length < 5){
    exit('Usage: make-thumb.js src dst (<width>x<height>|<width>|x<height>)');
}

var args = process.argv.slice(2),
    dimensions = args[2],
    src = args[0],
    dst = path.join(args[1], dimensions),
    width = '',
    height = '';

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

function callback(err, success){
    if (err){
        throw err;
    }
    console.log('SUCCESS', success);
}

qt.convert({
    src : src,
    dst : dst,
    width : width,
    height : height,
    limit : 1,
    overwrite : true
}, callback);

