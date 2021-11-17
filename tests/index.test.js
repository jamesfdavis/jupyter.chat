/* eslint-disable no-undef */


// const Robot = require("./src/robot.js");
import Robot from "./../src/robot.js";

// jest.mock("./../src/robot.js");


describe("Entry Point -", () => {

  test("ChatBot able to connect.", (done) => {
    const r = new Robot();
    r.adapter.once("connected", () => {
      // r.shutdown();
      done();

    });
    r.run();
  });

});

