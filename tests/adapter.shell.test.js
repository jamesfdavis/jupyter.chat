/* eslint-disable no-undef */

import { Shell } from "./../src/adapter.shell.js";
import { Robot } from "./../src/robot.js";

describe("Shell", function () {
  test("Check to see if the Shell Adapter loads.", (done) => {
    const robot = new Robot(Shell);
    robot.adapter.once("connected", () => {
      robot.shutdown();
      done();
    });
    robot.run();
  });
});
