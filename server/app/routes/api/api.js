'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import express from 'express';
import profile from './profile.js';
import citie from './citie.js';

/*_____ CREATE ROUTER INSTANCE _____*/
const index = new express.Router();

/*_____ DEFAULT MESSAGE _____*/
index.get('/', (req, res, next) => res.json({ message: 'Welcome to the API.' }));

/*_____ CONNECT PROFILE API _____*/
index.use('/profile', profile);

/*_____ CONNECT PROFILE API _____*/
index.use('/citie', citie);

/*_____ EXPORT THE OBJECT _____*/
export default index;