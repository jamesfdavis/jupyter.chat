/** Class representing a Message. */
class Message {

  /**
   * Represents an incoming message from the chat.
   * @param  {} user A User instance that sent the message.
   * @param  {} done Not sure
   */
  constructor(user, done) {
    this.user = user;
    this.done = done || false;
    this.room = this.user.room;
  }

  /**
   * Indicates that no other Listener should be called on this object
   */
  finish() {
    this.done = true;
  }

}

/** Class representing a TextMessage. */
class TextMessage extends Message {
  /**
   * @param  {} user A User instance that sent the message.
   * @param  {} text A String message.
   * @param  {} id A String of the message ID.
   */
  constructor(user, text, id) {
    super(user);
    this.text = text;
    this.id = id;
  }

  /**
   * Determines if the message matches the given regex.
   * @param  {} regex A Regex to check.
   * @returns Match object or null.
   */
  match(regex) {
    return this.text.match(regex);
  }

  /**
   * String representation of a TextMessage
   * @returns Returns the message text
   */
  toString() {
    return this.text;
  }
}

// Represents an incoming user entrance notification.
//


/** Class that represents an incoming user entrance notification. 
* user - A User instance for the user who entered.
* text - Always null.
* id   - A String of the message ID.
*/
class EnterMessage extends Message { }

/** Class that represents an incoming user exit notification.
* user - A User instance for the user who left.
* text - Always null.
* id   - A String of the message ID.
*/
class LeaveMessage extends Message { }

/** Class that represents an incoming topic change notification.
* user - A User instance for the user who changed the topic.
* text - A String of the new topic
* id   - A String of the message ID.
*/
class TopicMessage extends TextMessage { }

/** Class that represents a message that no matchers matched.
*/
class CatchAllMessage extends Message {
  /**
   * @param  {} message The original message.
   */
  constructor(message) {
    super(message.user);
    this.message = message;
  }
}

export {
  Message,
  TextMessage,
  EnterMessage,
  LeaveMessage,
  TopicMessage,
  CatchAllMessage
};
