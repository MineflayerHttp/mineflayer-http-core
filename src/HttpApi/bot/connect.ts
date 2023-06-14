import { getBot } from '../../Api/MinecraftBot';
import MainServer = require('../../index');

module.exports = () => 
MainServer.addHandle('/api/bot/connect', (req, res, query) => {
    if (query.token) {
        let bot = getBot(query.token);
        if (bot) {
            bot.connect();
            res.json({});
            return;
        }
    }
    res.json({err:400,errormessage:"invalid credentials"})
});