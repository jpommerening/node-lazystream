
var Readable = require('../lib/lazystream').Readable;
var DummyReadable = require('./helper').DummyReadable;

exports.readable = {
  dummy: function(test) {
    var expected = [ 'line1\n', 'line2\n' ];
    var actual = [];

    test.expect(1);

    new DummyReadable([].concat(expected))
      .on('data', function(chunk) {
        actual.push(chunk.toString());
      })
      .on('end', function() {
        test.equal(actual.join(''), expected.join(''), 'DummyReadable should produce the data it was created with');
        test.done();
      });
  },
  streams2: function(test) {
    var expected = [ 'line1\n', 'line2\n' ];
    var actual = [];
    var instantiated = false;

    test.expect(2);

    var readable = new Readable(function() {
      instantiated = true;
      return new DummyReadable([].concat(expected));
    });

    test.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');

    readable.on('readable', function() {
      var chunk = readable.read();
      actual.push(chunk.toString());
    });
    readable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
      test.done();
    });

    readable.read(0);
  },
  resume: function(test) {
    var expected = [ 'line1\n', 'line2\n' ];
    var actual = [];
    var instantiated = false;

    test.expect(2);

    var readable = new Readable(function() {
      instantiated = true;
      return new DummyReadable([].concat(expected));
    });

    readable.pause();

    readable.on('data', function(chunk) {
      actual.push(chunk.toString());
    });
    readable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Readable should not change the data of the underlying stream');
      test.done();
    });

    test.equal(instantiated, false, 'DummyReadable should only be instantiated when it is needed');
    
    readable.resume();
  }
};
