'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import express from 'express';
import get_twenty from '../../controllers/citie/get_twenty.js';

/*_____ CREATE ROUTER INSTANCE _____*/
const index = new express.Router();

/*_____ DEFAULT MESSAGE _____*/
index.get('/', (req, res, next) => res.json({ message: 'Welcome to the citie API.' }));

/*_____ GET TWENTY MATCHES _____*/
index.get('/twenty/:search', get_twenty);

/*_____ EXPORT THE OBJECT _____*/
export default index;