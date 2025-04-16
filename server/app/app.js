'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import cluster from 'cluster';
import mongoose from 'mongoose';
import http from 'http';
import cors from 'cors';
import verify_token from './helpers/verify_token.js'
import { Server } from 'socket.io';
/*_____ EXECUTE THE MONGOOSE CONNECTION _____*/
import mongoPromise from './config/mongo_connect.js';
/*_____ IMPORT THE ROUTES OBJECT _____*/
import routes from './routes/routes.js';
/*_____ CREATE AN EXPRESS INSTANCE _____*/
const app = express();
/*_____ CREATE A SERVER FOR THE WEB SOCKETS _____*/
const socket_server = http.Server(app)
/*_____ ATTACH SOCKET SERVER TO THE EXPRESS SERVER _____*/
export const io = new Server(socket_server)
/*_____ MUST USE CORS FOR API ROUTES _____*/
app.use(cors());
/*_____ DUPLICATE AUTHENTICATION FOR SOCKET REQUESTS _____*/
io.engine.use(async (req, res, next) => {
    if (!req._query.sid) {
        await verify_token(req, res, next);
    }
    else {
        next();
    }
})
/*_____ WEB SOCKET HANDLER _____*/
io.on('connection', async socket => {
    /*_____ USER NOTIFICATION NAMESPACE _____*/
    socket.join(`user:${socket.request.id}`);
    /*_____ JOIN CHATROOM SIGNAL _____*/
    socket.on('join_chat', async id => {
        /*_____ JOIN CHATROOM _____*/
        await socket.join(`chatroom:${id}`)
        /*_____ TYPE HANDLERS RELAY MESSAGES TO ALL PARTIES _____*/
        socket.on('type', async user_id => {
            io.sockets.in(`chatroom:${id}`).emit('type', user_id)
        })
        socket.on('type_end', async user_id => {
            io.sockets.in(`chatroom:${id}`).emit('type_end', user_id)
        })
        /*_____ MESSAGE HANDLERS RELAY MESSAGES TO ALL PARTIES _____*/
        const sockets = await io.in(`chatroom:${id}`).fetchSockets();
        io.sockets.in(`chatroom:${id}`).emit('members', sockets.length)
        /*_____ EXIT HANDLERS CLEAN UP _____*/
        socket.on('disconnect', async () => {
            const sockets = await io.in(`chatroom:${id}`).fetchSockets();
            io.sockets.in(`chatroom:${id}`).emit('members', sockets.length)
        })
        socket.on('exit_room', async () => {
            const sockets = await io.in(`chatroom:${id}`).fetchSockets();
            io.sockets.in(`chatroom:${id}`).emit('members', sockets.length - 1)
            await socket.leave(`chatroom:${id}`)
        })
    })
})
/*_____ DISABLE DEFAULT SERVER HEADERS FOR SECURITY _____*/
app.disable('x-powered-by');
/*_____ USE THE BODY PARSER _____*/
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
/*_____ AGAIN _____*/
app.use(express.json({ limit: '10mb' }));
/*_____ USE MORGAN FOR LOGGING REQUESTS __ LOG TO FILE IN PRODUCTION _____*/
if (process.env.NODE_ENV === 'production') {
    const stream = fs.createWriteStream(new URL('../', import.meta.url).pathname + 'access.log', { flags: 'a' });
    app.use(morgan('combined', { stream }));
}
else {
    app.use(morgan('dev'));
}
/*_____ LOG CLUSTER WORKER REQUESTS _____*/
app.use((req, res, next) => {
    if (cluster.isWorker && process.env.NODE_ENV !== 'production') {
        console.log(`WORKER ${cluster.worker.id} HANDLED REQUEST`);
    }
    next();
});
/*_____ LINK THE ROUTES ROUTER _____*/
app.use('/', routes);
/*_____ 404 ERROR HANDLER -- SEND AN ERROR PAGE _____*/
app.use((req, res, next) => {
    res.status(404);
    res.send(`
    <html>
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css' crossorigin='anonymous'>
        <div class='ui error message'>
            <div class='header'>Error: 404 Sorry I can't find anything at that url.</div>
            <p>Please check the url you are attempting to access.</p>
        </div>
    </html>
    `);
});
/*_____ GENERIC ERROR HANDLER _____*/
app.use((err, req, res, next) => {
    if (err._object && err._object.status) {
        res.status(err._object.status);
    }
    else {
        res.status(500);
    }
    !err._object
        ? res.send(`
    <html>
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css' crossorigin='anonymous'>
        <div class='ui error message'>
            <div class='header'>Error: 500 Sorry, there has been an internal server error.</div>
            <p>Please check back again later or notify the developer.</p>
        </div>
    </html>
    `)
        : res.json(err._object);
    if (process.env.NODE_ENV === 'production') {
        fs.appendFile(new URL('../', import.meta.url).pathname + 'error.log', JSON.stringify(err.stack), 'UTF-8', (err) => { if (err) throw err });
    }
    next();
});

/*_____ LOG APPLICATION EXITS _____*/
process.on('SIGINT', () => {
    if (cluster.isWorker) {
        console.log('MANUALLY KILLING CLUSTER WORKER VIA (Ctrl-C)');
    }
    else {
        console.log('MANUALLY KILLING CLUSTER MASTER VIA (Ctrl-C)');
    }
    mongoose.connection.close(() => {
        process.exit(0);
    });
});

/*_____ EXPORT THE MODULE ENTRY POINTS IN CLOSURE _____*/
const startServer = async (port) => {
    await mongoPromise;
    socket_server.listen(port);
};

/*_____ EXPORT APP FOR TESTING _____*/
export { app };
/*_____ STARTSERVER FOR CLUSTERING _____*/
export { startServer };