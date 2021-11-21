import * as  _require from "./message.js";
import { Adapter } from "./adapter.js";

const TextMessage = _require.TextMessage;

/** Shell Adapter concrete class. */
export class Jest extends Adapter {

  constructor(robot) {
    super();
    this.robot = robot;
  }

  /**
  * Send a message
  * @param {Envelope} envelope - Send a message.
  */
  // eslint-disable-next-line no-unused-vars
  send(envelope) {
    // const strings = [].slice.call(arguments, 1);
    // Array.from(strings).forEach(str => console.log(chalk.green`${str}`));
  }

  /**
  * Reply to a message
  * @param {Envelope} envelope - Send a reply
  */
  // eslint-disable-next-line no-unused-vars
  reply(envelope) {
    // const strings = [].slice.call(arguments, 1).map((s) => `${s}`);
    // this.send.apply(this, [envelope].concat(strings));
  }

  /**
  * Run the instance.
  */
  run() {
    this.emit("connected");
  }

  /**
   * Build and the interface
   */
  incoming(message) {
    // const userName = process.env.JUPYTER_SHELL_USER_NAME || "Shell";
    let user = { name: "User", room: "Shell" };
    this.receive(new TextMessage(user, message, "messageId"));
  }

}
