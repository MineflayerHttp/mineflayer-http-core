import { getBot } from '../../Api/MinecraftBot';
import MainServer = require('../../index');

module.exports = () => 
MainServer.addHandle('/api/bot/chat', (req, res, query) => {
    if (!query.token) {
        res.json({ code: 404, message: 'invalid credentials' });
        return;
    }

    if (!(query.message?.trim().length > 0)) {
        res.json({ code: 404, message: 'invalid message' });
        return;
    }
    
    let bot = getBot(query.token);
    if (!bot) {
        res.json({ code: 404, message: 'invalid credentials' });
        return;
    }
    
    if (!bot.client || !bot.isConnected) {
        res.json({ code: 404, message: 'bot is not connected' });
        return;
    }

    bot.client.chat(query.message);
    res.json({ code: 200 });
});