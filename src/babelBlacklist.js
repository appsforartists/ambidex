// Don't transpile the dependencies we know work with ES5.  Manually
// blacklisting isn't super scalable, but it does allow developers to break
// their codebases into modules easily without sweating JS versions.

module.exports = /node_modules\/(mach|react|babel|immutable|lazy\.js|webpack|socket.io|[\w\-]+\-loader\/)/;
