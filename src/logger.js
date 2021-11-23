import logger from "tracer";
import fs from "fs";
import process from "process";

logger.dailyfile({
  root: ".",
  maxLogFiles: 10,
  allLogsFileName: "jupyter.chat"
});

const level = {
  LOG: "log",
  TRACE: "trace",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error"
};

/**
 * Logging Utility - With levels of Log, Trace, Debug, Info, Warn, and Error.
 * @param  {} level="log" - Log is the default.
 */
function log(lvl) {
  if (!lvl)
    lvl = level.LOG;

  let config = {
    level: lvl,
    format: [
      "{{timestamp}} <{{title}}> | {{message}} (in {{file}}:{{line}}):{{pos}} from {{method}}", //default format
      {
        error:
          "{{timestamp}} <{{title}}> | {{message}} (in {{file}}:{{line}}):{{pos}} from {{method}}\nCall Stack:\n{{stack}}" // error format
      }
    ],
    dateformat: "hh:mm:ss.l",
    preprocess: function (data) {
      data.title = data.title.toUpperCase();
    },
  };

  if (process.env.NODE_ENV === "test") {
    config.transport = function (data) {
      fs.createWriteStream("./tracer.log", {
        flags: "a",
        encoding: "utf8",
        mode: "0666",
      })
        .write(data.rawoutput + "\n");
    };
  }
  return logger.colorConsole(config);
}

export { log, level };
