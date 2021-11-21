/* eslint-disable no-undef */

import { Adapter } from "./../src/adapter.js";
import { Robot } from "./../src/robot.js";
import { Shell } from "./../src/adapter.shell.js";

jest.mock("./../src/adapter.js");

describe.skip("Adapter", function () {
  beforeEach(function () {
    Adapter.mockClear();
  });
  it("Check if the consumer called the class constructor.", function () {
    this.robot = new Robot(Shell);
    expect(Adapter).toHaveBeenCalledTimes(1);
  });
});
