import { EventEmitter } from "events";
import process from "process";
import fs from "fs";
import path from "path";

import { Middleware } from "./middleware.js";
import { Message } from "./message.js";
import { TextListener } from "./listener.js";
import { Response } from "./response.js";
import promiseSeries from "promise.series";
import { log } from "./../src/logger";
const logger = log();

/**
 * Robot receives messages from a source and dispatch to matching listeners
 */
export class Robot {

  /**
   * Configure Robot instance with Adapter.
   */
  constructor(adapter) {
    this.events = new EventEmitter();
    this.Response = Response;
    this.name = "Jupyter ChatBot";
    this.alias = "jupyter";
    this.loadAdapter(adapter);
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
   * Load instance of an Adapter
   * @param  {} Shell - Class derived from Adapter
   */
  loadAdapter(Shell) {
    this.adapter = new Shell(this);
    logger.trace(`Bot using ${this.adapter.toString()}`);
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
      logger.warning("Anchors don’t work well with respond, perhaps you want to use 'hear'");
      logger.warning(`The regex in question was ${regex.toString()}`);
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
    logger.trace("Received", message.text);
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

    logger.trace(`Process ${this.listeners.length} listeners.`);

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
              // console.log(context.response);
            });
          });
        } catch (err) {
          this.emit("error", err, new this.Response(this, context.response.message, []));
          // Continue to next listener when there is an error
          reject(false);
        }
      }));
    });

    // Process series of listeners, then exit.
    promiseSeries(list, 1).then(() => {
      done();
    });

  }

  /**
   * Loads every script in the given path.
   * @param  {} obj - A String path on the filesystem.
   */
  load(obj) {
    if (typeof obj === "string") {
      logger.trace(`Load modules from location ${obj}`);
      if (fs.existsSync(obj)) {
        fs.readdirSync(obj).sort().map(file => this.loadFile({ path: obj, file: file }));
      }
    } else { // Module
      logger.trace(`Load instance module ${obj.name}`);
      this.loadFile(obj);
    }
  }

  /**
   * Load external module onto the Robot.
   * 
   * @param  {} filepath - A String path on the filesystem.
   * @param  {} filename - A String filename in path on the filesystem.
   */
  async loadFile(extension) {

    // TODO - Standardize input of local or external module definitions.
    let script = undefined;
    let module = extension;

    if (extension.file) {
      const ext = path.extname(extension.file);
      script = `${path.join(extension.path, path.basename(extension.file, ext))}${ext}`;
      let { default: external } = await import(script);
      module = external;
    } else {
      module = extension.module;
    }

    try {
      // https://dmitripavlutin.com/ecmascript-modules-dynamic-import/#22-importing-of-default-export

      if (typeof module === "function") {
        module(this);
      } else {
        logger.warn(`Expected ${script} to assign a function to module.exports, got ${typeof module}`);
      }
    } catch (error) {
      logger.error(`Unable to load ${script}: ${error.stack}`);
      // process.exit(1);
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
