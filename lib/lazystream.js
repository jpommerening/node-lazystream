var util = require('util')
var PassThrough = require('readable-stream').PassThrough

module.exports = {
  Readable: Readable,
  Writable: Writable
}

util.inherits(Readable, PassThrough)
util.inherits(Writable, PassThrough)

// Patch the given method of instance so that the callback
// is executed once, before the actual method is called the
// first time.
function beforeFirstCall (instance, method, callback) {
  instance[method] = function () {
    delete instance[method]
    callback.apply(this, arguments)
    return this[method].apply(this, arguments)
  }
}

function Readable (fn, options) {
  if (!(this instanceof Readable))
    return new Readable(fn, options)

  PassThrough.call(this, options)

  beforeFirstCall(this, '_read', function () {
    var self = this
    var lazy
    try {
      lazy = fn.call(self, options)
    } catch (err) {
      self.emit('error', err)
      return
    }

    Promise.resolve(lazy)
      .then(function (source) {
        source.on('error', self.emit.bind(self, 'error'))
        source.pipe(self)
      }, function (err) {
        self.emit('error', err)
      })
  })

  this.emit('readable')
}

function Writable (fn, options) {
  if (!(this instanceof Writable))
    return new Writable(fn, options)

  PassThrough.call(this, options)

  beforeFirstCall(this, '_write', function () {
    var self = this
    var lazy
    try {
      lazy = fn.call(self, options)
    } catch (err) {
      self.emit('error', err)
      return
    }

    Promise.resolve(lazy)
      .then(function (destination) {
        destination.on('error', self.emit.bind(self, 'error'))
        self.pipe(destination)
      }, function (err) {
        self.emit('error', err)
      })
  })

  this.emit('writable')
}

