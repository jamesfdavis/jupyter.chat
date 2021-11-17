import log from "log";
// import yargs from "yargs";
// import { hideBin } from "yargs/helpers";
import { Robot } from "./src/robot.js";

let r = new Robot();

r.adapter.once("connected", () => {
  log.info("Connected Event");
});

r.run();
