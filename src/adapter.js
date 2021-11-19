import { EventEmitter } from "events";
import log from "log";

/** Class abstract EventEmitter representing an Adapter.
 * An adapter is a specific interface to a chat source for robots.
 */
class Adapter extends EventEmitter {

  /**
 * @param  {} robot A Robot instance.
 */
  constructor() {
    super();
    this.logger = log;
  }

  /**
 * Sending data back to the chat source.
 * @param  {} envelope - A Object with message, room and user details.
 */
  // eslint-disable-next-line no-unused-vars
  send(envelope) { }

  /**
 * Building a reply and sending it back to the chat
 * @param  {} envelope A Object with message, room and user details.
 */
  // eslint-disable-next-line no-unused-vars
  reply(envelope) { }

  /**
 * Setting a topic on the chat source
 * @param  {} envelope A Object with message, room and user details.
 */
  // eslint-disable-next-line no-unused-vars
  topic(envelope) { }

  /**
 * Invoking the Robot to run
 */
  run() { }

  /**
* Shutting the Robot down.
*/
  close() { }

  /**
 * Dispatch a received message to the Robot
 * @param  {} message
 */
  receive(message) {
    this.logger.info(message);
    this.robot.receive(message);
  }

  // // Public: Get an Array of User objects stored in the brain.
  // //
  // // Returns an Array of User objects.
  // users() {
  //   this.robot.logger.warning('@users() is going to be deprecated in 3.0.0 use @robot.brain.users()')
  //   return this.robot.brain.users()
  // }

  // // Public: Get a User object given a unique identifier.
  // //
  // // Returns a User instance of the specified user.
  // userForId(id, options) {
  //   this.robot.logger.warning('@userForId() is going to be deprecated in 3.0.0 use @robot.brain.userForId()')
  //   return this.robot.brain.userForId(id, options)
  // }

  // // Public: Get a User object given a name.
  // //
  // // Returns a User instance for the user with the specified name.
  // userForName(name) {
  //   this.robot.logger.warning('@userForName() is going to be deprecated in 3.0.0 use @robot.brain.userForName()')
  //   return this.robot.brain.userForName(name)
  // }

  // // Public: Get all users whose names match fuzzyName. Currently, match
  // // means 'starts with', but this could be extended to match initials,
  // // nicknames, etc.
  // //
  // // Returns an Array of User instances matching the fuzzy name.
  // usersForRawFuzzyName(fuzzyName) {
  //   this.robot.logger.warning('@userForRawFuzzyName() is going to be deprecated in 3.0.0 use @robot.brain.userForRawFuzzyName()')
  //   return this.robot.brain.usersForRawFuzzyName(fuzzyName)
  // }

  // // Public: If fuzzyName is an exact match for a user, returns an array with
  // // just that user. Otherwise, returns an array of all users for which
  // // fuzzyName is a raw fuzzy match (see usersForRawFuzzyName).
  // //
  // // Returns an Array of User instances matching the fuzzy name.
  // usersForFuzzyName(fuzzyName) {
  //   this.robot.logger.warning('@userForFuzzyName() is going to be deprecated in 3.0.0 use @robot.brain.userForFuzzyName()')
  //   return this.robot.brain.usersForFuzzyName(fuzzyName)
  // }

  // // Public: Creates a scoped http client with chainable methods for
  // // modifying the request. This doesn't actually make a request though.
  // // Once your request is assembled, you can call `get()`/`post()`/etc to
  // // send the request.
  // //
  // // Returns a ScopedClient instance.
  // http(url) {
  //   this.robot.logger.warning('@http() is going to be deprecated in 3.0.0 use @robot.http()')
  //   return this.robot.http(url)
  // }

}

export { Adapter };
