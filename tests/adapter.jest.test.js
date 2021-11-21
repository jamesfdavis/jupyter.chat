/* eslint-disable no-undef */
import path from "path";

import { Jest } from "./../src/adapter.jest.js";
import { Robot } from "./../src/robot.js";

describe.skip("Jest Shell", function () {
  test("Check to see if the Jest Adapter loads.", (done) => {
    const robot = new Robot(Jest);
    robot.adapter.once("connected", () => {
      robot.load(path.resolve("./", "scripts"));
      robot.adapter.incoming("Badger");
      done();
    });
    robot.run();
  });
});
