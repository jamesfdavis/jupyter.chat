/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Robot } from "./../src/robot.js";
import { Shell } from "./../src/adapter.shell.js";
import { log, level } from "./../src/logger";

const logger = log(level.WARN);

import * as  _require from "./../src/message.js";
const TextMessage = _require.TextMessage;

import { ext } from "./../scripts/simple.js";

// eslint-disable-next-line no-unused-vars
describe("Shell Adapter", () => {

  test("Bot is able to connect to adapter.", (done) => {
    const r = new Robot(Shell);
    r.adapter.once("connected", () => {
      r.shutdown();
      done();
    });
    r.run();
  });

  test("Bot is able to heard a message from adapter.", (done) => {
    const r = new Robot(Shell);
    r.adapter.once("connected", () => {
      // Load response module onto bot.
      r.load({ module: ext, name: "Simple.js" });
      let user = { name: "User", room: "Shell" };
      r.adapter.receive(new TextMessage(user, "Badger", "messageId"));
      r.shutdown();
    });
    // Listen for a response from the Bot.
    r.adapter.on("send", (message) => {
      done();
    });
    r.run();
  });

});