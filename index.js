// import yargs from "yargs";
// import { hideBin } from "yargs/helpers";

import path from "path";

import { Robot } from "./src/robot.js";
import { Shell } from "./src/adapter.shell.js";

let robot = new Robot(Shell);
robot.adapter.once("connected", () => {
  robot.load(path.resolve("./", "scripts"));
});
robot.run();
