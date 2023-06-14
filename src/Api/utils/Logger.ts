import fs = require('fs');
import path = require('path');
import { getServerLogger } from '../../index';
import { ILogger } from './ILogger';

export enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
}

const dir = `${__dirname}/../../../logs/`;
var dirExists = true;
if (!fs.existsSync(dir))
    fs.mkdir(dir, _failedToMakeLogsDir);

function _failedToMakeLogsDir(err: NodeJS.ErrnoException | null) {
    if (err) {
        console.log("Error occurred: could not initialize logs directory!")
        dirExists = false;
    }
}

export class Logger extends ILogger {
    id: string;
    filepath: string;
    _submitLogLine: (line: string, level: LogLevel) => void = this._submitToLogFile;

    constructor(id: string) {
        super();
        this.id = id;
        this.filepath = path.join(dir, id + ".log");
    }
    
    getLogger(): Logger {
        return this;
    }

    override log(level: LogLevel, message: string) {
        this._submitLogLine(`[${new Date().toISOString()}] ${level}: ${message}`, level);
    }

    _submitToLogFile(line: string) {
        if (dirExists)
            fs.appendFile(this.filepath, line.endsWith('\n') ? line : line + '\n', this._fileCallback);
    }

    _fileCallback(err: NodeJS.ErrnoException | null) {
        if (err == null) return;

        getServerLogger().log(LogLevel.ERROR, 'ERROR | Could not submit log line to file!');
        getServerLogger().log(LogLevel.ERROR, `${err}`);
    }

}