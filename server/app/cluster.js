'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
// import os from 'os';
// import cluster from 'cluster';
import { startServer } from './app.js';
import portfinder from 'portfinder';

/*_____ CLUSTERING DISABLED UNTIL RELEASE WHEN I CAN USE THE PROPER NODE MODULES _____*/
/*_____ CLUSTERING IS INCOMPATABLE WITH SOCKET.IO BY NATURE WITHOUT EXTRA SETUP _____*/
/*_____

WILL NEED TO ADD THE FOLLOWING MODULES:

socket.io@sticky

socket.io@cluster-adapter

socket.io@redis

_____*/

// /*_____ FUNCTION TO CREATE A NEW WORKER _____*/
// const startWorker = (_port) => {
//     const worker = cluster.fork({_port});
//     console.log(`CLUSTER: WORKER ${worker.id} HAS JOINED THE CLUSTER.`);
// };

// /*_____ CLUSTER ENTRY POINT _____*/
// const initiateCluster = (err, port) => {
//     if (err) throw err;
//     /*_____ LOG INITIATION MESSAGE AFTER DELAY _____*/
//     setTimeout(()  => {
//         console.log('\n\nSERVER ACTIVE', '\n' + new Date().toDateString(), new Date().toTimeString(), `\nEnv Mode: ${process.env.NODE_ENV || 'development'}\nhttp://localhost:${port}/\nPress Ctrl-C to terminate.`);
//     }, 2500);
//     /*_____ FOR THE NUMBER OF CPU CORES _____*/
//     os.cpus().forEach(() => {
//         /*_____ INITIATE A NEW WORKER _____*/
//         startWorker(port);
//     });
//     /*_____ DISCONNECT LOGGER _____*/
//     cluster.on('disconnect', worker => console.log(
//         `CLUSTER: WORKER ${worker.id} DISCONNECTED FROM THE CLUSTER.`
//     ));
//     /*_____ EXIT LOGGER AND KEEP_ALIVE _____*/
//     cluster.on('exit', (worker, code, signal) => {
//         console.log(
//             `CLUSTER: WORKER ${worker.id} DIED.` +
//             `EXIT CODE: ${code} (${signal})`
//         );
//         startWorker(port);
//     });
// };

/*_____ IF THIS IS NOT A WORKER ENVIROMENT _____*/
// if (cluster.isMaster || cluster.isPrimary) {
//     /*_____ USE MANUALLY SET PORT IF SET _____*/
//     if (process.env.MANUAL_PORT) {
//         initiateCluster(null, process.env.MANUAL_PORT);
//     }
//     else {
//         /*_____ GET A FRESH PORT _____*/
//         portfinder.getPort(initiateCluster);
//     }
// }
// else {
//     /*_____ START THE SERVER ON THE SAME PORT _____*/
//     startServer(process.env._port);
// }

if (process.env.MANUAL_PORT) {
    /*_____ USE MANUALLY SET PORT IF SET _____*/
    if (process.env.MANUAL_PORT) {
        await startServer(process.env.MANUAL_PORT);
    }
    else {
        /*_____ GET A FRESH PORT _____*/
        await portfinder.getPort(port => startServer(port));
    }
    /*_____ LOG THE SERVER STARTING _____*/
    console.log('\n\nSERVER ACTIVE', '\n' + new Date().toDateString(), new Date().toTimeString(), `\nEnv Mode: ${process.env.NODE_ENV || 'development'}\nhttp://localhost:${process.env.MANUAL_PORT}/\nPress Ctrl-C to terminate.`);
}