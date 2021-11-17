/* eslint-disable no-undef */
import Robot from "./../src/robot.js";

// jest.mock("./../src/robot.js");

describe("Entry Point -", () => {
  test("ChatBot able to connect.", (done) => {
    const r = new Robot();
    r.adapter.once("connected", () => {

      r.shutdown();
      r.adapter.close();
      done();

    });
    r.run();
  });
});

