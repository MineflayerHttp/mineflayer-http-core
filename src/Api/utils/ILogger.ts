import { LogLevel, Logger } from "./Logger";

export abstract class ILogger {
    abstract getLogger(): Logger;
    
    debug(message: string) {
        this.log(LogLevel.DEBUG, message);
    }

    info(message: string) {
        this.log(LogLevel.INFO, message);
    }

    warning(message: string) {
        this.log(LogLevel.WARNING, message);
    }

    error(message: string) {
        this.log(LogLevel.ERROR, message);
    }

    log(level: LogLevel, message: string) {
        this.getLogger().log(level, message);
    }
}