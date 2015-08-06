var express = require('express'),
    app     = express(),
    qt      = require('../'),
    os      = require('os'),
    path    = require('path'),
    fs      = require('fs'),

    filename  = 'cape cod.jpg',
    publicDir = path.join(__dirname, '../public'),
    imageDir  = path.join(publicDir, 'images')
    cacheDir  = path.join(os.tmpdir(), 'quickthumb/cache');


// Crop
app.use('/public/crop', qt.static(publicDir, {
    cacheDir : cacheDir,
    quality : .95
}));
// Resize
app.use('/public/resize', qt.static(publicDir, {
    type : 'resize',
}));


app.get('/', function(req, res){
    var types = [ 'crop', 'resize' ];

    function img(type,q){
        var src = '/public/' + ( type ? type + '/' : '' ) + 'images/' + filename + q;
        return '<img src="' + src + '" title="' + src + '" />';
    }

    var h = '<center>';
    types.forEach(function(type){
        h += '<br />' + type + '<br />';
        [ '200', '100x100', 'x60', '35', '10x10', 'x35', '60', '100x150', 'x200' ].forEach(function(dim){
            h += img(type, '?dim=' + dim) + '&nbsp;';
        });
        h += '<br />' + img(type, '?dim=800x100') + '<br />';
    });
    h += '<br />original<br />' + img('crop','') + '<br />';

    // --- Image cache test 
    h += '<br />cache test<br /><img src="/test/1" id="cacheTest" /><br />'
      +  '<br /><input type="button" onclick="next()" value="Modify"/>'
      +  '<script>function next(){document.getElementById("cacheTest").src="/test/"+ ++t}var t=1;</script>';

    h += '</center>';

    res.send(h);
});

// --- Image cache test
var cacheTestImage = 'cache_test.jpg';
var modifiedImage  = 'cape cod modified.jpg';
var redirectPath   = '/public/crop/images/' + cacheTestImage
                   + '?dim=x200&' + new Date().getTime();

app.get('/test/:step', function(req, res) {
    switch (req.params.step) {
        case '1': // Step 1: No cache, image has to be generated

            // Create image for cache test
            fs.createReadStream(path.join(imageDir, filename)).pipe(
                fs.createWriteStream(path.join(imageDir, cacheTestImage)));

            // Cached version is deleted so that it has to be generated
            fs.unlink(path.join(cacheDir, 'crop/x200/images', cacheTestImage),
                function(){/* ignore errors */});
            break;

        case '2': // Step 2: Image has to be regenerated since it was modified

            // File is modifed so the cached version should be updated
            fs.createReadStream(path.join(imageDir, modifiedImage)).pipe(
                fs.createWriteStream(path.join(imageDir, cacheTestImage)));
            break;

    }

    res.redirect(redirectPath);
});

app.listen(3000);
console.log("running on http://127.0.0.1:3000");
