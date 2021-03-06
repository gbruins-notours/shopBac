if(process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const server = require('./index');
const manifest = require('./manifest');
const Config = require('./config');

const startServer = async function() {
    try {
        const options = {
            relativeTo: __dirname
        };

        await server.init(manifest, options);
        console.log('API server started, port:', Config.get('/port/server'));
    }
    catch(err) {
        console.log('ERROR STARTING SERVER:', err);
        process.exit(1);
    }
};

startServer();
