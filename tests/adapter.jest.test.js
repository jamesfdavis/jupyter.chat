/* eslint-disable no-undef */

import { Jest } from "./../src/adapter.jest.js";
import { Robot } from "./../src/robot.js";

describe("Jest Shell", function () {
  test("Check to see if the Jest Adapter loads.", (done) => {
    const robot = new Robot(Jest);
    robot.adapter.once("connected", () => {
      robot.adapter.incoming("Badger");
      done();
    });
    robot.run();
  });
});
