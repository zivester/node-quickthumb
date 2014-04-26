var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    im = require('imagemagick'),
    qt = require('../');

var ppath = path.normalize(__dirname + '/../public/images'),
    src = path.join(ppath, 'cape cod.jpg');

var sizes = [
    { width: 100, height: 100},
    { width: 100, height: 50},
];

sizes.forEach(function(options){
    var opt = {
        src : src,
        dst : path.join(ppath, 'red_' + options.width + 'x' + options.height + '.gif'),
        width : options.width,
        height : options.height,
        quality : 1,
    };
    qt.convert( opt, function(err, image){
        assert.ifError(err);
        assert.equal(image, opt.dst);
        im.identify(image, function(err, features){
            assert.ifError(err);
            assert.equal(features.width, opt.width);
            assert.equal(features.height, opt.height);
            assert.ifError(fs.unlinkSync(image));
        });
    });
});
