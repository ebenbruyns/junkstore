const isLoggerEnabled = () => { return localStorage.getItem('enableLogger') === 'true' || false };

declare global {
    interface Window {
        JunkStoreLoggerEnable(): void;
        JunkStoreLoggerDisable(): void;
    }
}

window.JunkStoreLoggerEnable = () => {
    localStorage.setItem('enableLogger', 'true');
};


window.JunkStoreLoggerDisable = () => {
    localStorage.setItem('enableLogger', 'false');
};

export const log = (name: string) => {
    if (isLoggerEnabled()) {
      return console.info.bind(
          window.console,
          `%c Junk Store %c ${name} %c`,
          'background: #16a085; color: black;',
          'background: #1abc9c; color: black;',
          'background: transparent;',
      );
    } else {
      return function (..._: any[]) { }
    }
};

export const debug = (name: string) => {
    if (isLoggerEnabled()) {
      return console.debug.bind(window.console,
          `%c Junk Store %c ${name} %c`,
          'background: #16a085; color: black;',
          'background: #1abc9c; color: black;',
          'color: blue;');
    } else {
      return function (..._: any[]) { }
    }
}

export const error = (name: string) => {
    return console.error.bind(window.console,
        `%c Junk Store %c ${name} %c`,
        'background: #16a085; color: black;',
        'background: #FF0000;',
        'background: transparent;'
    );
};

export const warn = (name: string) => {
    return console.warn.bind(window.console,
        `%c Junk Store %c ${name} %c`,
        'background: #16a085; color: black;',
        'background: #c4a000;',
        'background: transparent;'
    );
}

class Logger {
    get log(): (...args: any[]) => void {
        return this._log;
    }
    get debug(): (...args: any[]) => void {
        return this._debug;
    }
    get error(): (...args: any[]) => void {
        return this._error;
    }

    get warn(): (...args: any[]) => void {
        return this._warn;
    }

    constructor(private readonly name: string) {
        this.name = name;
    }

    private _log = log.bind(this)(this.name).bind(this);

    private _debug = debug.bind(this)(this.name).bind(this);

    private _error = error.bind(this)(this.name).bind(this);

    private _warn = warn.bind(this)(this.name).bind(this);
}

export default Logger;