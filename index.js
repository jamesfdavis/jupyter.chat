// import log from "log";
// import yargs from "yargs";
// import { hideBin } from "yargs/helpers";

import { Robot } from "./src/robot.js";
import { Shell } from "./src/adapter.shell.js";

let robot = new Robot(Shell);
robot.run();
