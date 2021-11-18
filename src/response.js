
/** Class that responds to matching listeners */
class Response {
  /**
   * Responses are sent to matching listeners. Messages know about the content 
   * and user that made the original message, and how to reply back to them.
   * @param  {} robot - A Robot instance.
   * @param  {} message - A Message instance.
   * @param  {} match - A Match object from the successful Regex match.
   */
  constructor(robot, message, match) {
    this.robot = robot;
    this.message = message;
    this.match = match;
    this.envelope = {
      room: this.message.room,
      user: this.message.user,
      message: this.message
    };
  }

  /**
   * Posts a message back to the chat source
   */
  send() {
    const strings = [].slice.call(arguments);
    this.runWithMiddleware.apply(this, ["send", { plaintext: true }].concat(strings));
  }

  /**
   * Posts an emote back to the chat source
   */
  emote() {
    const strings = [].slice.call(arguments);
    this.runWithMiddleware.apply(this, ["emote", { plaintext: true }].concat(strings));
  }

  /**
   * Posts a message mentioning the current user.
   */
  reply() {
    const strings = [].slice.call(arguments);
    this.runWithMiddleware.apply(this, ["reply", { plaintext: true }].concat(strings));
  }

  /**
   * Posts a topic changing message
   */
  topic() {
    const strings = [].slice.call(arguments);
    this.runWithMiddleware.apply(this, ["topic", { plaintext: true }].concat(strings));
  }

  /**
   * Play a sound in the chat source
   */
  play() {
    const strings = [].slice.call(arguments);
    this.runWithMiddleware.apply(this, ["play"].concat(strings));
  }

  /**
   * Posts a message in an unlogged room
   */
  locked() {
    const strings = [].slice.call(arguments);
    this.runWithMiddleware.apply(this, ["locked", { plaintext: true }].concat(strings));
  }

  /**
   * Call with a method for the given strings using response middleware.
   * @param  {} methodName
   * @param  {} opts
   */
  runWithMiddleware(methodName, opts) {
    const self = this;
    const strings = [].slice.call(arguments, 2);
    const copy = strings.slice(0);
    let callback;

    if (typeof copy[copy.length - 1] === "function") {
      callback = copy.pop();
    }

    const context = {
      response: this,
      strings: copy,
      method: methodName
    };

    if (opts.plaintext != null) {
      context.plaintext = true;
    }

    function responseMiddlewareDone() { }
    function runAdapterSend(_, done) {
      const result = context.strings;
      if (callback != null) {
        result.push(callback);
      }
      self.robot.adapter[methodName].apply(self.robot.adapter, [self.envelope].concat(result));
      done();
    }

    return this.robot.middleware.response.execute(context, runAdapterSend, responseMiddlewareDone);
  }

  /**
   * Picks a random item from the given items.
   * @param  {} items - An Array of items.
   */
  random(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Tell the message to stop dispatching to listeners.
   */
  finish() {
    this.message.finish();
  }

}

export { Response };
