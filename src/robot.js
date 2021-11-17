import { EventEmitter } from "events";
import log from "log";
import create from "./shell.js";
import process from "process";

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
    this.name = "Jupyter ChatBot";
    this.loadAdapter();
    this.onUncaughtException = err => {
      return this.emit("error", err);
    };
    process.on("uncaughtException", this.onUncaughtException);
  }

  /**
   * Load instance of Adapter
   */
  loadAdapter() {
    log.info("Loading the shell adapter.");
    this.adapter = create(this);
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
   * Receive messages.
   * @param  {} message A Object with message, room and user details.
   */
  receive(message) {
    // When everything is finished (down the middleware stack and back up),
    // pass control back to the robot
    // this.middleware.receive.execute({ response: new Response(this, message) }, this.processListeners.bind(this), cb)
    log.info(message);
  }

  /**
   * Run Adapter
   */
  run() {
    this.emit("running");
    this.adapter.run();
  }

  /**
   * Gracefully shutdown the robot process
   */
  shutdown() {
    process.removeListener("uncaughtException", this.onUncaughtException);
    // this.adapter.close();
  }

}


