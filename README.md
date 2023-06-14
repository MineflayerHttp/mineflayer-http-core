# mineflayer-http-core
This is the core program to make the apis in other languages work.<br>
This program initializes a server to do whatever you tell it to do with http requests.

I added some scripts that should do everything you need to do:<br>
`npm clean` - Cleans the `bin` and `logs` directory.<br>
`npm build` - Builds the typescript program into a executable javascript program.<br>
`npm start` - Runs the build script and starts the program.<br>

> **Warning:**
Don't change the port unless you know what you're doing. By default, the port is set to `30194` and that is what the apis will use.

Api Documentation: _Coming Soon_

This program is based on [mineflayer](https://github.com/PrismarineJS/mineflayer). All http requests and api methods should reflect this base project as closely as possible for consistency.

**License:**
MIT License