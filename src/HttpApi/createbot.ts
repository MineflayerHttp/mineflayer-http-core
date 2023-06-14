import { createBot } from '../Api/MinecraftBot';
import MainServer = require('../index');

module.exports = () => 
MainServer.addHandle('/api/createbot', (req, res, query) => {
    if (query.username && query.host) {
        let token = createBot(query);
        res.json({token});
    }
    else res.json({err:400,errormessage:"invalid credentials"})
});