import { EventEmitter } from "events";
import process from "process";
import fs from "fs";
import path from "path";
import log from "log";

// import { detectSeries } from "async";
import { CreateShell } from "./shell.js";
import { Middleware } from "./middleware.js";
import { Message } from "./message.js";
import { TextListener } from "./listener.js";
import { Response } from "./response.js";

import promiseSeries from "promise.series";

/**
 * Robot receives messages from a source and dispatch to matching listeners
 */
export default class Robot {

  /**
   * Configure Robot instance with Adapter.
   */
  constructor() {
    this.events = new EventEmitter();
    this.adapter = undefined;
    this.Response = Response;
    this.name = "Jupyter ChatBot";
    this.alias = "jupyter";
    this.logger = log;
    this.loadAdapter();
    this.onUncaughtException = err => {
      return this.emit("error", err);
    };
    this.middleware = {
      listener: new Middleware(this),
      response: new Middleware(this),
      receive: new Middleware(this)
    };

    this.listeners = [];

    process.on("uncaughtException", this.onUncaughtException);
  }

  /**
   * Load instance of Adapter
   */
  loadAdapter() {
    this.logger.info("Loading the shell adapter.");
    this.adapter = CreateShell(this);
  }

  /**
   * Raise events
   * @param  {} event
   */
  emit(event) {
    const args = [].slice.call(arguments, 1);
    this.events.emit.apply(this.events, [event].concat(args));
  }

  /** 
   * Adds a Listener that triggers when no other text matchers match.
   * @param  {} options - An Object of additional parameters keyed on extension name (optional)
   * @param  {} callback - A Function that is called with a Response object.
   */
  catchAll(options, callback) {
    // `options` is optional; need to isolate the real callback before
    // wrapping it with logic below
    if (callback == null) {
      callback = options;
      options = {};
    }

    this.listen(this.isCatchAllMessage, options, function listenCallback(msg) {
      msg.message = msg.message.message;
      callback(msg);
    });
  }

  /**
 * Run Adapter
 */
  run() {
    this.emit("running");
    this.adapter.run();
  }

  /**
   * Adds a Listener that attempts to match incoming messages based on a Regex.
   * @param  {} regex - A Regex that determines if the callback should be called.
   * @param  {} options - An Object of additional parameters keyed on extension name (optional).
   * @param  {} callback - A Function that is called with a Response object.
   */
  hear(regex, options, callback) {
    this.listeners.push(new TextListener(this, regex, options, callback));
  }

  /**
   * Adds a Listener that attempts to match incoming messages directed at 
   * the robot based on a Regex. All regexes treat patterns like they begin 
   * with a '^'
   * @param  {} regex - A Regex that determines if the callback should be called.
   * @param  {} options - An Object of additional parameters keyed on extension name (optional).
   * @param  {} callback - A Function that is called with a Response object.
   */
  respond(regex, options, callback) {
    this.hear(this.respondPattern(regex), options, callback);
  }

  /**
   * Build a regular expression that matches messages addressed directly to the robot.
   * @param  {} regex - A RegExp for the message part that follows the robot's name/alias
   */
  respondPattern(regex) {
    const regexWithoutModifiers = regex.toString().split("/");
    regexWithoutModifiers.shift();
    const modifiers = regexWithoutModifiers.pop();
    const regexStartsWithAnchor = regexWithoutModifiers[0] && regexWithoutModifiers[0][0] === "^";
    const pattern = regexWithoutModifiers.join("/");
    const name = this.name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    if (regexStartsWithAnchor) {
      this.logger.warning("Anchors don’t work well with respond, perhaps you want to use 'hear'");
      this.logger.warning(`The regex in question was ${regex.toString()}`);
    }

    // @jupyter: some stuff
    if (!this.alias) {
      return new RegExp("^[ ]*[@]?" + name + "[:,]?[ ]*(?:" + pattern + ")", modifiers);
    }

    const alias = this.alias.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    // matches properly when alias is substring of name
    if (name.length > alias.length) {
      return new RegExp("^[ ]*[@]?(?:" + name + "[:,]?|" + alias + "[:,]?)[ ]*(?:" + pattern + ")", modifiers);
    }

    // matches properly when name is substring of alias
    return new RegExp("^[ ][@]?(?:" + alias + "[:,]?|" + name + "[:,]?)[ ](?:" + pattern + ")", modifiers);

  }

  /**
   * Checks message Type
   * @param  {} message
   */
  isCatchAllMessage(message) {
    return message instanceof Message.CatchAllMessage;
  }

  /** 
   * Registers new middleware for execution after matching but before Listener callbacks
   * @param  {} middleware - A function that determines whether or not a given matching
   * Listener should be executed. The function is called with
   * (context, next, done). If execution should
   * continue (next middleware, Listener callback), the middleware
   * should call the 'next' function with 'done' as an argument.
   * If not, the middleware should call the 'done' function with
   * no arguments.
   */
  listenerMiddleware(middleware) {
    this.middleware.listener.register(middleware);
  }

  /** 
   * Registers new middleware for execution as a response to any
   * message is being sent.
   * @param  {} middleware - A function that examines an outgoing message and can modify
   * it or prevent its sending. The function is called with
   * (context, next, done).If execution should continue,
   * the middleware should call next(done).If execution should
   * stop, the middleware should call done().To modify the
   * outgoing message, set context.string to a new message.
   */
  responseMiddleware(middleware) {
    this.middleware.response.register(middleware);
  }

  /** 
   * Registers new middleware for execution before matching
   * @param  {} middleware -  - A function that determines whether or not listeners should be
   * checked.The function is called with (context, next, done).If
   * ext, next, done). If execution should continue to the next
   * middleware or matching phase, it should call the 'next'
   * function with 'done' as an argument.If not, the middleware
   * should call the 'done' function with no arguments.
   */
  receiveMiddleware(middleware) {
    this.middleware.receive.register(middleware);
  }

  /**
   * Receive and execute message against listeners.
   * @param  {} message - Message
   * @param  {} cb - CallBack
   */
  receive(message, cb) {
    // When everything is finished (down the middleware stack and back up),
    // pass control back to the robot
    this.middleware.receive.execute({ response: new Response(this, message) }, this.processListeners.bind(this), cb);
  }

  /**
   * Passes the given message to any interested Listeners. 
   * Listeners should be processed one at a time to avoid collisions.
   * 
   * @param  {} context - A Message instance. Listeners can flag this message as 'done' to prevent further execution.
   * @param  {} done - Optional callback that is called when message processing is complete
   */
  processListeners(context, done) {
    // Try executing all registered Listeners in order of registration
    // and return after message is done being processed
    let anyListenersExecuted = false;
    let list = [];

    this.listeners.forEach(listener => {
      list.push(new Promise((resolve, reject) => {
        try {
          listener.call(context.response.message, this.middleware.listener, function (listenerExecuted) {
            anyListenersExecuted = anyListenersExecuted || listenerExecuted;
            // Defer to the event loop at least after every listener so the
            // stack doesn't get too big
            process.nextTick(() => {
              // Stop processing when message.done == true
              resolve(context.response);
            });
          });
        } catch (err) {
          this.emit("error", err, new this.Response(this, context.response.message, []));
          // Continue to next listener when there is an error
          reject(false);
        }
      }));
    });

    promiseSeries(list, 1).then(() => {
      // console.log(result);
      //=> 4
    });

    done();

  }

  /**
   * Loads every script in the given path.
   * @param  {} path - A String path on the filesystem.
   */
  load(path) {
    this.logger.debug(`Loading scripts from ${path}`);
    if (fs.existsSync(path)) {
      fs.readdirSync(path).sort().map(file => this.loadFile(path, file));
    }
  }

  /**
   * Load external module onto the Robot.
   * 
   * @param  {} filepath - A String path on the filesystem.
   * @param  {} filename - A String filename in path on the filesystem.
   */
  async loadFile(filepath, filename) {

    const ext = path.extname(filename);
    const script = `${path.join(filepath, path.basename(filename, ext))}${ext}`;

    try {
      // https://dmitripavlutin.com/ecmascript-modules-dynamic-import/#22-importing-of-default-export
      let { default: module } = await import(script);
      if (typeof module === "function") {
        module(this);
        // TODO - Determine strategy for help system.
        //this.parseHelp(path.join(filepath, filename));
      } else {
        this.logger.warning(`Expected ${script} to assign a function to module.exports, got ${typeof module}`);
      }
    } catch (error) {
      this.logger.error(`Unable to load ${script}: ${error.stack}`);
      process.exit(1);
    }
  }

  /**
   * Gracefully shutdown the robot process
   */
  shutdown() {
    process.removeListener("uncaughtException", this.onUncaughtException);
    this.adapter.close();
  }

}
