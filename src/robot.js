import { EventEmitter } from 'events';
import log from 'log';
import create from './shell.js';


/**
 * Robot receives messages from a source and dispatch to matching listeners
 */
class Robot {

  name;
  events = new EventEmitter();
  adapter;

  constructor() {
    this.name = 'Jupyter ChatBot'
    this.loadAdapter();

    this.onUncaughtException = err => {
      return this.emit('error', err)
    }
    process.on('uncaughtException', this.onUncaughtException)
  }

  loadAdapter() {
    log.info('Loading the shell adapter.');
    this.adapter = create(this);
  }

  emit(event) {
    // const args = [].slice.call(arguments, 1)
    this.events.emit("connceted", ["connected"])
  }

  receive(message) {
    // When everything is finished (down the middleware stack and back up),
    // pass control back to the robot
    // this.middleware.receive.execute({ response: new Response(this, message) }, this.processListeners.bind(this), cb)
    log.info(message);
  }


  // Returns nothing.
  run() {
    this.emit('running');
    this.adapter.run();
  }

  // Public: Gracefully shutdown the robot process
  //
  // Returns nothing.
  shutdown() {
    // if (this.pingIntervalId != null) {
    //   clearInterval(this.pingIntervalId)
    // }
    process.removeListener('uncaughtException', this.onUncaughtException)
    this.adapter.close()
    // if (this.server) {
    //   this.server.close()
    // }

    // this.brain.close()
  }
}

export { Robot }
