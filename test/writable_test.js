
var Writable = require('../lib/lazystream').Writable;
var DummyWritable = require('./helper').DummyWritable;

exports.writable = {
  dummy: function(test) {
    var expected = [ 'line1\n', 'line2\n' ];
    var actual = [];
    
    test.expect(0);

    var dummy = new DummyWritable(actual);

    expected.forEach(function(item) {
      dummy.write(new Buffer(item));
    });
    test.done();
  },
  streams2: function(test) {
    var expected = [ 'line1\n', 'line2\n' ];
    var actual = [];
    var instantiated = false;

    test.expect(2);

    var writable = new Writable(function() {
      instantiated = true;
      return new DummyWritable(actual);
    });

    test.equal(instantiated, false, 'DummyWritable should only be instantiated when it is needed');

    writable.on('end', function() {
      test.equal(actual.join(''), expected.join(''), 'Writable should not change the data of the underlying stream');
      test.done();
    });

    expected.forEach(function(item) {
      writable.write(new Buffer(item));
    });
    writable.end();
  }
};
