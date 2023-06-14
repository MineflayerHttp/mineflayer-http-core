import { getBot } from '../../Api/MinecraftBot';
import MainServer = require('../../index');

module.exports = () => 
MainServer.addHandle('/api/bot/getevents', (req, res, query) => {
    if (!query.token) {
        res.json({ code: 404, message: 'invalid credentials' });
        return;
    }

    if (!(query.eventId?.trim().length > 0)) {
        res.json({ code: 404, message: 'invalid eventId' });
        return;
    }
    
    let bot = getBot(query.token);
    if (!bot) {
        res.json({ code: 404, message: 'invalid credentials' });
        return;
    }
    
    res.json(bot.events.getEvents(query.eventId))
});