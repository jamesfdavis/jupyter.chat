/* eslint-disable no-undef */
import { Robot } from "./../src/robot.js";
import { Shell } from "./../src/adapter.shell.js";

describe("Index - Entrypoint", () => {
  test("ChatBot able to connect.", (done) => {
    const r = new Robot(Shell);
    r.adapter.once("connected", () => {
      r.shutdown();
      done();
    });
    r.run();
  });
});
