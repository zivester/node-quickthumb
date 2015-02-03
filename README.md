# QuickThumb

QuickThumb is an on the fly, thumbnail creation middleware for express.  It utilizes the popular *nix image library, ImageMagick.  It allows for the automatic creation of thumbnails by adding query parameters onto a standard image url.  It's ideal for web developers who would like to easily experiment with different size thumbnails, wihout having to worry about pre-generating an entire library.

QuickThumb also comes with a command line utility to batch create thumbnails.  This is more appropriate for production systems where all images should be pre-generated.

## Examples

```js
var express = require('express'),
    app = express(),
    qt = require('quickthumb');

app.use('/public', qt.static(__dirname + '/../public'));
```

```html
<img src="/public/images/red.gif?dim=200x100" />
```

## Install

    npm install quickthumb

ImageMagick is required for this module, so make sure it is installed.

Ubuntu

    apt-get install imagemagick

Mac OS X

    brew install imagemagick

Fedora/CentOS

    yum install imagemagick


## Documentation

### qt.static(path, [options])

Middleware to replace `express.static()` or `connect.static()`.

`path` is the base directory where images are located.

`options` is an object to specify customizations. It currently has the following options:

* `type` The type of imagemagick conversion to take place.  There are currently only two options:
  * `crop` (default) Crops and zooms images to the exact size specified. Proxy to *imagemagick.crop*.
  * `resize` Resizes an image to fit within the specified dimensions, but actual dimensions may not be exactly as specified. Proxy to *imagemagick.resize*.
* `cacheDir` The directory where generated images will be created.  If not supplied, images will be created in `[path]/.cache/`
* `quality` The quality to use when resizing the image.  Values should be between 0 (worst quality) and 1 (best quality)

Resizing of images is directed by the query parameter `dim`.  This is in the format [width]x[height]. E.g. `red.gif?dim=200x100`

Resized images will be created on an as needed basis, and stored in `[cacheDir]/[type]/[dim]`.

If the `dim` parameter is not present, the original image will be served.

### qt.convert(options, callback)

The first argument is an options object. `src`, `dst`, and at least one of `width` and `height` are required

* `src` (required) Path to source image
* `dst` (required) Path to destination image
* `width` Width of resized image
* `height` Height of resized image

The callback argument gets 2 arguments. The first is an error object, most likely from imagemagick's *convert*.  The second argument is the path to the created image.


## CLI utils

```js
node bin/make-thumb.js src dst [width]x[height] [-p] [-r] [--resize]
```

* `src` Path to the source image or directory
* `dst` Path to the destination image or directory
* `[width]x[height]` Dimensions of the resized images
* `-p` Create a subdirectory in `dst` based off of the dimensions
* `-r` Process images recursively from `src`
* `--resize` Use *resize* instead of *crop*

__Example__

```js
// Resize a single image and write it to /tmp/red.gif
node bin/make-thumb.js public/images/red.gif /tmp/ 200x200
// Resize all images recursively from public/images/* and write them to /tmp/200x200/*
node bin/make-thumb.js public/images/ /tmp/ 200x200 -p -r
```

