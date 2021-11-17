import * as fs from 'fs';
import * as readline from 'readline';
import { Duplex } from 'stream';
import * as chalk from 'chalk';
import cline from 'cline'
import log from 'log'
import * as  _require from './message.js';
import { Adapter } from './adapter.js'

const TextMessage = _require.TextMessage
const historySize = 1024
const historyPath = '.shell_history'

class Shell extends Adapter {

  cli;
  log;

  send(envelope) {
    const strings = [].slice.call(arguments, 1)
    Array.from(strings).forEach(str => console.log(chalk.bold(`${str}`)))
  }

  emote(envelope) {
    const strings = [].slice.call(arguments, 1)
    Array.from(strings).map(str => this.send(envelope))
  }

  reply(envelope) {
    // const strings = [].slice.call(arguments, 1).map((s) => `${s}`)
    // this.send.apply(this, [envelope].concat(strings))
  }

  run() {
    this.buildCli();

    loadHistory((error, history) => {
      if (error) {
        console.log(error.message);
      } else {
        this.cli.history(history);

      }
      this.cli.interact(`${this.robot.name}> `);
      return this.emit('connected');
    })
  }

  shutdown() {
    this.robot.shutdown()
    return process.exit(0)
  }

  buildCli() {
    this.cli = cline()

    this.cli.command('*', input => {
      const userName = process.env.JUPYTER_SHELL_USER_NAME || 'Shell'
      let user = { name: "User", room: "Shell" }
      this.receive(new TextMessage(user, input, 'messageId'))
    })

    this.cli.command('history', () => {
      Array.from(this.cli.history()).map(item => console.log(item))
    })

    this.cli.on('history', (item) => {
      if (item.length > 0 && item !== 'exit' && item !== 'history') {
        fs.appendFile(historyPath, `${item}\n`, error => {
          if (error) {
            this.robot.emit('error', error)
          }
        })
      }
    })

    this.cli.on('close', () => {
      let fileOpts, history, i, item, len, outstream, startIndex

      history = this.cli.history()

      if (history.length <= historySize) {
        return this.shutdown()
      }

      startIndex = history.length - historySize
      history = history.reverse().splice(startIndex, historySize)
      fileOpts = {
        mode: 0x180
      }

      outstream = fs.createWriteStream(historyPath, fileOpts)
      outstream.on('finish', this.shutdown.bind(this))

      for (i = 0, len = history.length; i < len; i++) {
        item = history[i]
        outstream.write(item + '\n')
      }

      outstream.end(this.shutdown.bind(this));
    })
  }
}

function create(robot) {
  return new Shell(robot)
}

export { create as default }

// exports.use =

// load history from .shell_history.
//
// callback - A Function that is called with the loaded history items (or an empty array if there is no history)
function loadHistory(callback) {
  if (!fs.existsSync(historyPath)) {
    return callback(new Error('No history available'))
  }

  const instream = fs.createReadStream(historyPath)
  const outstream = new Duplex();
  const items = []

  readline.createInterface({ input: instream, output: outstream, terminal: false })
    .on('line', function (line) {
      line = line.trim()
      if (line.length > 0) {
        items.push(line)
      }
    })
    .on('close', () => callback(null, items))
    .on('error', callback)
}
