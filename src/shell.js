import * as fs from "fs";
import * as readline from "readline";
import { Duplex } from "stream";
import chalk from "chalk";
import cline from "cline";
import log from "log";
import * as  _require from "./message.js";
import { Adapter } from "./adapter.js";

const TextMessage = _require.TextMessage;
const historySize = 1024;
const historyPath = ".shell_history";

/** Shell Adapter concrete class. */
export class Shell extends Adapter {

  constructor(robot) {
    super();

    this.robot = robot;
    this.logger = log;

    this.logger.info("Constructing Shell");
    this.CommandLine = undefined;
  }

  /**
  * Send a message
  * @param {Envelope} envelope - Send a message.
  */
  // eslint-disable-next-line no-unused-vars
  send(envelope) {
    const strings = [].slice.call(arguments, 1);
    Array.from(strings).forEach(str => console.log(chalk.green`${str}`));
  }

  /**
  * Reply to a message
  * @param {Envelope} envelope - Send a reply
  */
  reply(envelope) {
    const strings = [].slice.call(arguments, 1).map((s) => `${s}`);
    this.send.apply(this, [envelope].concat(strings));
  }

  /**
  * Run the interface and load history.
  */
  run() {
    this.buildCli();

    loadHistory((error, history) => {
      if (error) {
        console.Logger(error.message);
      } else {
        this.CommandLine.history(history);
      }
      this.CommandLine.interact(`${this.robot.name}> `);
      return this.emit("connected");
    });
  }

  /**
   * Close the Shell
   */
  close() {
    this.CommandLine.close();
  }

  /**
   * Build and the interface
   */
  buildCli() {
    this.CommandLine = cline();

    this.CommandLine.command("*", input => {
      // const userName = process.env.JUPYTER_SHELL_USER_NAME || "Shell";
      let user = { name: "User", room: "Shell" };
      this.receive(new TextMessage(user, input, "messageId"));
    });

    this.CommandLine.command("history", () => {
      Array.from(this.CommandLine.history()).map(item => console.Logger(item));
    });

    this.CommandLine.on("history", (item) => {
      if (item.length > 0 && item !== "exit" && item !== "history") {
        fs.appendFile(historyPath, `${item}\n`, error => {
          if (error) {
            this.robot.emit("error", error);
          }
        });
      }
    });

    this.CommandLine.on("close", () => {
      let fileOpts, history, i, item, len, outstream, startIndex;

      history = this.CommandLine.history();

      if (history.length <= historySize) {
        return this.close();
      }

      startIndex = history.length - historySize;
      history = history.reverse().splice(startIndex, historySize);
      fileOpts = {
        mode: 0x180
      };

      outstream = fs.createWriteStream(historyPath, fileOpts);
      outstream.on("finish", this.shutdown.bind(this));

      for (i = 0, len = history.length; i < len; i++) {
        item = history[i];
        outstream.write(item + "\n");
      }

      outstream.end(this.close.bind(this));
    });
  }
}

/**
 * Load history from .shell_history.
 * @param  {} callback A Function that is called with the loaded history items (or an empty array if there is no history)
 */
function loadHistory(callback) {
  if (!fs.existsSync(historyPath)) {
    return callback(new Error("No history available"));
  }

  const instream = fs.createReadStream(historyPath);
  const outstream = new Duplex();
  const items = [];

  readline.createInterface({ input: instream, output: outstream, terminal: false })
    .on("line", function (line) {
      line = line.trim();
      if (line.length > 0) {
        items.push(line);
      }
    })
    .on("close", () => callback(null, items))
    .on("error", callback);
}

// /**
//  * @param  {} robot Robot instance
//  * @return  {} new Shell Adapter
//  */
// function CreateShell(robot) {
//   return new Shell(robot);
// }

// export { CreateShell };
