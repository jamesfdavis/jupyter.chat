/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Robot } from "./../src/robot.js";
import { Shell } from "./../src/adapter.shell.js";
import { log, level } from "./../src/logger";

const logger = log(level.WARN);

import * as  _require from "./../src/message.js";
const TextMessage = _require.TextMessage;

import { ext as moduleSimple } from "./../scripts/simple.js";

// eslint-disable-next-line no-unused-vars
describe.skip("Shell Adapter", () => {
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
      r.load(moduleSimple);
      let user = { name: "User", room: "Shell" };
      r.adapter.receive(new TextMessage(user, "Badger", "messageId"));
      r.shutdown();
      done();
    });
    r.run();
  });
});