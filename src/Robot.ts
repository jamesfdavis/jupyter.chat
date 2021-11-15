
import { EventEmitter } from 'events';
import { create as shell } from './Shell'

/**
 * Robot receives messages from a source and dispatch to matching listeners
 */
class Robot {

  name: string = "";
  events: EventEmitter = new EventEmitter();
  adapter: any;
  constructor(name?: string) {
    if (!name) {
      this.name = 'Robot'
    }
  }

  loadAdapter(adapter: any) {
    console.log('Loading adapter.')
    this.adapter = shell
  }

  // this.loadAdapter(adapter)

}

export { Robot }
