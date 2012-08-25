var assert = require('assert'),
    qt = require('../lib/quickthumb');

assert.equal(qt.isImage('test.jpg'), true);
assert.equal(qt.isImage('test.txt'), false);

assert.equal(qt.findImages(__dirname + '/../public/images').length, 1);
