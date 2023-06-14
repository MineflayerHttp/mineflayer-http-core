import express = require('express');
import QueryString = require('qs');
import { Logger } from './Api/utils/Logger';
const app = express();
const _logger = new Logger('server');
export const getServerLogger = () => _logger;

_logger._submitLogLine = function(line: string) {
    console.log(line);
    this._submitToLogFile(line);
};

_logger._fileCallback = function(err: NodeJS.ErrnoException | null) {
    if (err == null) return;

    console.error('ERROR | Could not submit log line to file!');
    console.error(err);
}

const port = 30194;

export type IRequestPortal = express.RequestHandler<{}, any, any, QueryString.ParsedQs, Record<string, any>>;
export type Request = express.Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>;
export type Response = express.Response<any, Record<string, any>>;
export interface IRqstHandler {
    (req: Request, res: Response, query: any): void;
}

export function addHandle(path: string, handler: IRqstHandler) {
    app.get(path, createPortal(handler));
}

function createPortal(handler: IRqstHandler): IRequestPortal {
    return (req, res) => handler(req, res, req.query);
}

_logger.info('Started listening on port ' + port);
app.listen(port);

import { load } from './loader';
load();