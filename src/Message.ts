class Message {

  user: any;
  done: any;
  room: any;

  // Represents an incoming message from the chat.
  //
  // user - A User instance that sent the message.
  constructor(user: any, done?: any) {
    this.user = user
    this.done = done || false
    this.room = this.user.room
  }

  // Indicates that no other Listener should be called on this object
  //
  // Returns nothing.
  finish() {
    this.done = true
  }
}

class TextMessage extends Message {
  text: any;
  id: any;
  // Represents an incoming message from the chat.
  //
  // user - A User instance that sent the message.
  // text - A String message.
  // id   - A String of the message ID.
  constructor(user: any, text: any, id: any) {
    super(user)
    this.text = text
    this.id = id
  }

  // Determines if the message matches the given regex.
  //
  // regex - A Regex to check.
  //
  // Returns a Match object or null.
  match(regex: any) {
    return this.text.match(regex)
  }

  // String representation of a TextMessage
  //
  // Returns the message text
  toString() {
    return this.text
  }
}

// Represents an incoming user entrance notification.
//
// user - A User instance for the user who entered.
// text - Always null.
// id   - A String of the message ID.
class EnterMessage extends Message { }

// Represents an incoming user exit notification.
//
// user - A User instance for the user who left.
// text - Always null.
// id   - A String of the message ID.
class LeaveMessage extends Message { }

// Represents an incoming topic change notification.
//
// user - A User instance for the user who changed the topic.
// text - A String of the new topic
// id   - A String of the message ID.
class TopicMessage extends TextMessage { }

class CatchAllMessage extends Message {
  message: any;
  // Represents a message that no matchers matched.
  //
  // message - The original message.
  constructor(message: any) {
    super(message.user)
    this.message = message
  }
}

export {
  Message,
  TextMessage,
  EnterMessage,
  LeaveMessage,
  TopicMessage,
  CatchAllMessage
}
