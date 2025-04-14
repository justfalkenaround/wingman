'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import mongoose from 'mongoose';

/*_____ DEFINE LOCAL CONNECTION PATH(S) _____*/
const DB_PATH = 'mongodb://localhost/wing_man';

/*_____ TO GET RID OF WARNING _____*/
mongoose.set('strictQuery', false);

/*_____ MAKE THE CONNECTION _____*/
export default mongoose.connect(DB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/*_____ LOG RELEVANT MONGOOSE EVENTS _____*/
mongoose.connection.on('connected', () => {
    console.log(`MONGOOSE CONNECTION INITIATED: ${DB_PATH}`);
});

mongoose.connection.on('error', err => {
    console.log(`MONGOOSE CONNECTION FAILURE: ${err}`);
    process.exit();
});

mongoose.connection.on('disconnected', () => {
    console.log('MONGOOSE DISCONNECTED');
});