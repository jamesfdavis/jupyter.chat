/* eslint-disable no-undef */

import { Shell } from "./../src/shell.js";
import { Robot } from "./../src/robot.js";

jest.mock("./../src/shell.js");

// // console.log(Shell);
describe("Adapter", function () {
  beforeEach(function () {
    Shell.mockClear();
  });
  it("Check if the consumer called the class constructor.", function () {
    this.robot = new Robot();
    expect(Shell).toHaveBeenCalledTimes(1);
  });
});
