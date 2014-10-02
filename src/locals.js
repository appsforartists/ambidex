var locals = {
  "getModule":    function () {
                    // This function lets us figure out where in the stack our context local
                    // was created.  To make sure that two libraries utilizing locals don't
                    // conflict with one another, we force each library to create its own
                    // instance of the module, complete with its own _tapStackAndRun.

                    function _tapStackAndRun (lambda) {
                      return lambda();
                    };

                    return {
                      "runWithLocal":             function (lambda, local) {
                                                    function contextLocalCapsule () {
                                                      return _tapStackAndRun(lambda);
                                                    };

                                                    contextLocalCapsule._local = local;

                                                    return contextLocalCapsule();
                                                  },

                      "getLocalFromCurrentStack": function () {
                                                    // The whole reason locals exists is because there's no clear way to
                                                    // have a parent module's scope close-over its descendents in Node.  As
                                                    // such, you can't share a scope between disparate modules without risking
                                                    // two instances clobbering one another unless you use a trick like
                                                    // context locals.
                                                    //
                                                    // Since Node is based on V8, we can abuse [V8's stack tracing API](https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi)
                                                    // to introspect which module created the ContextLocalCapsule.
                                                    //
                                                    // The Stack Tracing API is designed for authors to create custom error
                                                    // messages.  Whenever the `stack` property on an error is looked up,
                                                    // V8 calls `captureStackTrace` to decide which part of the stack we care
                                                    // about.  In our case, we're looking for the ContextLocalCapsule that
                                                    // called `_tapStackAndRun`.
                                                    //
                                                    // Then, it calls `prepareStackTrace` with two parameters, the error object
                                                    // and an Array of CallSites.  (Each CallSite describes one function call
                                                    // in the stack.)  Because we truncated the stack to whatever called
                                                    // `_tapStackAndRun`, the first call in the stack should give us our
                                                    // capsule.
                                                    //
                                                    // I don't know if this is fast, but I do know that it works for sync code.
                                                    // I'm abandoning it because the call stack strategy doesn't work for async
                                                    // code.

                                                    var originalPreparerBackup  = Error.prepareStackTrace;
                                                    var originalStackTraceLimit = Error.stackTraceLimit;

                                                    Error.stackTraceLimit = 1;

                                                    var foundCapsule;
                                                    var fakeError = new Error();

                                                    Error.prepareStackTrace = function (error, stack) {
                                                      if (error !== fakeError) {
                                                        console.error(error.message + " in ContextLocal.getFromCurrentCallStack");
                                                        return;
                                                      }

                                                      if (stack.length)
                                                        foundCapsule = stack[0].getFunction();
                                                    };

                                                    // create a stack that starts at _tapStackAndRun, and
                                                    Error.captureStackTrace(fakeError, _tapStackAndRun);

                                                    // look it up to force prepareStackTrace to be run
                                                    fakeError.stack;


                                                    Error.prepareStackTrace = originalPreparerBackup;

                                                    if (!foundCapsule || foundCapsule.name !== "contextLocalCapsule") {
                                                      Error.stackTraceLimit = Infinity;

                                                      throw new Error("getLocalFromCurrentStack failed.");
                                                    }

                                                    Error.stackTraceLimit = originalStackTraceLimit;


                                                    return foundCapsule._local;
                                                  }
                    }
                  }
};


module.exports = locals;
