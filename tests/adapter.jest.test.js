/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Robot } from "./../src/robot.js";
import { Jest } from "./../src/adapter.jest.js";
import { log, level } from "./../src/logger";

const logger = log(level.WARN);

import * as  _require from "./../src/message.js";
const TextMessage = _require.TextMessage;

import { ext } from "./../scripts/simple.js";

// eslint-disable-next-line no-unused-vars
describe("Jest (Testing Framework) Adapter", () => {
  test("Bot is able to connect to adapter.", (done) => {
    const r = new Robot(Jest);
    r.adapter.once("connected", () => {
      r.shutdown();
      done();
    });
    r.run();
  });

  test("Bot is able to heard a message from adapter.", (done) => {
    const r = new Robot(Jest);
    r.adapter.once("connected", () => {
      // Load response module onto bot.
      r.load(ext);
      let user = { name: "User", room: "Shell" };
      r.adapter.receive(new TextMessage(user, "Badger", "messageId"));
      r.shutdown();
      done();
    });
    r.run();
  });
});
