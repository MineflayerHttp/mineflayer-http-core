import mineflayer = require('mineflayer');
import MinecraftProtocol = require('minecraft-protocol');
import { LogLevel, Logger } from './utils/Logger';
import { ILogger } from './utils/ILogger';
import { v4 as newUuid } from 'uuid';
type Client = MinecraftProtocol.Client;
type LoginData = { client: Client; } & Partial<mineflayer.BotOptions>;

function generateUuid(knownUuids: string[] = []): string {
    let uuid = newUuid();
    return uuid in knownUuids ? generateUuid(knownUuids) : uuid;
}

class EventCache {
    _eventCache: {[ eventId: string ]: any[]} = {};

    fire(eventId: string, eventData: any) {
        if (!this._eventCache[eventId]) this._eventCache[eventId] = [eventData];
        else this._eventCache[eventId].push(eventData)
    }

    getEvents(eventId: string): any[] {
        return eventId in this._eventCache ? this._eventCache[eventId].splice(0) : [];
    }

}

const loggingUids: string[] = [];

class MinecraftBot extends ILogger {
    token: string;
    loginData: LoginData;
    reconnectDelay?: number;
    nextReconnectDelay?: number;

    scheduledReconnection?: NodeJS.Timeout;

    isConnected: boolean = false;

    events: EventCache = new EventCache();

    client?: mineflayer.Bot;

    _logger: Logger;
    _loggingId: string = generateUuid(loggingUids);
    getLogger = ()=>this._logger;

    constructor(token: string, loginData: LoginData, reconnectDelay?: number) {
        super();
        this.token = token;
        this.loginData = loginData;
        this.reconnectDelay = reconnectDelay;
        this._logger = new Logger(this._loggingId);

        this._logger._submitLogLine = this._logHandler;

        delete this.loginData.password;
        this.loginData.hideErrors = true;
        this.loginData.onMsaCode = this._onMsaCode;
    }

    scheduleReconnect(delay: number | undefined = this.nextReconnectDelay) {
        if (this.scheduledReconnection) return;

        if (delay) {
            this.info('Scheduling reconnect in ' + delay + 'ms...');
            this.events.fire('scheduleReconnect', {delay});
            this.scheduledReconnection = setTimeout(this._reconnect, delay);
        }
    }

    cancelAutoreconnect() {
        clearTimeout(this.scheduledReconnection);
        this.scheduledReconnection = undefined;
    }

    _reconnect() {
        this.info('Attempting to reconnect...');
        this.events.fire('reconnect', {});
        this.connect();
    }

    connect() {
        this.info('Connecting...')
        this.client = mineflayer.createBot(this.loginData);

        this.client.on('end', this._onEnd);
        this.client.on('messagestr', this._onMessageStr);
        this.client.on('spawn', this._onSpawn);
        this.client.on('error', this._onError);
    }

    _onEnd = (reason: string) => {
        this.isConnected = false;
        this.info('Disconnecting (reason: \'' + reason + '\')');
        this.events.fire('disconnect', {reason});
        if (reason == "disconnect.quitting")
            return;
    }

    _onMessageStr = (message: string) => {
        this.info('Minecraft > ' + message);
        this.events.fire('messageStr', {message});
    }

    _onSpawn = async () => {
        if (!this.client) return;
        
        this.isConnected = true;
        this.info(`Connected as '${this.client.username}'`);
        this.events.fire('connect', {});
        this.nextReconnectDelay = this.reconnectDelay;

        for (let i = 0; i < 20; i++)
            setTimeout(() => this.client?.chat('/testlimbo'), i*100);
        
        await this.client.waitForChunksToLoad();
        await this.client.waitForTicks(12);
    }

    _onError = (err: any & Error) => {
        if (err.code == 'ECONNREFUSED') {
            this._logger.error(`Failed to connect to ${err.address}:${err.port}`)
        }
        else {
            //this._logger.error(`Unhandled error: ${err}`);
        }

        this.scheduleReconnect();
        if (this.reconnectDelay && this.nextReconnectDelay)
            this.nextReconnectDelay += this.reconnectDelay;
    }

    _onMsaCode = (data: MinecraftProtocol.MicrosoftDeviceAuthorizationResponse) => {
        this.events.fire('requireAuth', data);
        this.info('Login requires authentication...')
    }

    _logHandler = (line: string, level: LogLevel) => {
        this.events.fire('log', {line, level});
        this._logger._submitToLogFile(line);
    }

}

let tokens: {[username: string]: {password: string, token: string}} = {};
let bots: {[token: string]: MinecraftBot} = {};

function generateToken(n: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for(let i = 0; i < n; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return bots[token] ? generateToken(n) : token;
}

export function getBot(token: string): MinecraftBot | undefined {
    return bots[token];
}

export function createBot(loginData: {autoreconnect?: number} & LoginData): string | null {
    if (loginData.username && loginData.password) {
        let x = tokens[loginData.username];
        if (x) return x.password == loginData.password ? x.token : null;

        let token = generateToken(32);
        tokens[loginData.username] = { password: loginData.password, token }

        bots[token] = new MinecraftBot(token, loginData, loginData.autoreconnect);
        return token;
    }
    return null;
}

export function deleteBot(token: string) {
    let bot = bots[token];
    if (bot && bot.client && bot.loginData.username) {
        bot.client.quit();
        delete tokens[bot.loginData.username];
        delete bots[token];
        delete bot.client;
    }
}