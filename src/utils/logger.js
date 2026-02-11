const chalk = require('chalk');

class Logger {
  constructor(verbose = false, noColor = false) {
    this.verbose = verbose;
    this.noColor = noColor;
  }

  _colorize(color, text) {
    if (this.noColor) {
      return text;
    }
    return chalk[color](text);
  }

  info(message) {
    console.log(this._colorize('cyan', 'ℹ') + '  ' + message);
  }

  success(message) {
    console.log(this._colorize('green', '✓') + '  ' + message);
  }

  error(message) {
    console.error(this._colorize('red', '✖') + '  ' + message);
  }

  warn(message) {
    console.warn(this._colorize('yellow', '⚠') + '  ' + message);
  }

  debug(message) {
    if (this.verbose) {
      console.log(this._colorize('gray', '▪') + '  ' + message);
    }
  }

  log(message) {
    console.log(message);
  }

  table(data) {
    console.log(data);
  }

  json(data) {
    console.log(JSON.stringify(data, null, 2));
  }

  blank() {
    console.log('');
  }
}

module.exports = Logger;
