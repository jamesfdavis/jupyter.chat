/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import { Robot } from "./../src/robot.js";
import { Jest } from "./../src/adapter.jest.js";
import { log, level } from "./../src/logger";

const logger = log(level.TRACE);

import * as  _require from "./../src/message.js";
const TextMessage = _require.TextMessage;

import { ext } from "./../scripts/simple.js";

describe("Jest (Testing Framework) Adapter", () => {

  test("Bot is able to connect to adapter.", (done) => {
    const r = new Robot(Jest);
    r.adapter.once("connected", () => {
      r.shutdown();
      done();
    });
    r.run();
  });

  test("Bot is able HEAR a message from the adapter and return a response.", (done) => {
    const r = new Robot(Jest);

    r.adapter.once("connected", () => {
      // Load response module onto Bot.
      r.load({ module: ext, name: "Simple.js" });
      let user = { name: "User", room: "Jest" };
      // Send a message to the Bot.
      r.adapter.receive(new TextMessage(user, "Badger", "messageId"));
    });

    // Listen for a response from the Bot.
    r.adapter.on("send", (message) => {
      expect(message.length).toBeGreaterThan(10);
      done();
    });

    r.run();
  });


  test("Bot is able RESPOND to a message from the adapter and return a response.", (done) => {
    const r = new Robot(Jest);

    r.adapter.once("connected", () => {
      // Load response module onto Bot.
      r.load({ module: ext, name: "Simple.js" });
      let user = { name: "User", room: "Jest" };
      // Send a message to the Bot.
      r.adapter.receive(new TextMessage(user, "jupyter: open the pod bay doors", "messageId"));
    });

    // Listen for a response from the Bot.
    r.adapter.on("send", (message) => {
      expect(message.length).toBeGreaterThan(10);
      done();
    });

    r.run();
  });



});
