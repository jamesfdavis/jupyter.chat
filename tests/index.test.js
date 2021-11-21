/* eslint-disable no-undef */
import { Robot } from "./../src/robot.js";
import { Shell } from "./../src/adapter.shell.js";
import logger from "tracer";

import * as  _require from "./../src/message.js";
const TextMessage = _require.TextMessage;

import { ext } from "./../scripts/simple.js";

// eslint-disable-next-line no-unused-vars
const log = logger.console();

describe("Index - Entrypoint", () => {
  test("ChatBot able to connect.", (done) => {
    const r = new Robot(Shell);
    r.adapter.once("connected", () => {
      r.load(ext);
      let user = { name: "User", room: "Shell" };
      r.adapter.receive(new TextMessage(user, "Badger", "messageId"));
      r.shutdown();
      done();
    });
    r.run();
  });
});
