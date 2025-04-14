'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import express from 'express';
import api from './api/api.js';

/*_____ CREATE ROUTER INSTANCE _____*/
const index = new express.Router();

/*_____ API ROUTE _____*/
index.use('/api', api);

/*_____ IF IN PRODUCTION _____*/
if (process.env.NODE_ENV === 'production') {
    /*_____ OFFER UP THE BUNDLE AS STATIC RESOURCE _____*/
    index.use(express.static(new URL('../../../client/build', import.meta.url).pathname));
    /*_____ EVERYTHING ELSE IS ROUTED TO THE BUNDLE _____*/
    index.use('/*', (req, res, next) => {
        res.sendFile(new URL('../../../client/build/index.html', import.meta.url).pathname, {}, err => {
            if (err) return next(err);
        });
    });
}

/*_____ EXPORT THE OBJECT _____*/
export default index;