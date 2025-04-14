'use strict';

/*_____ IMPORT DEPENDENCIES FOR AUTHENTICATION SUPPORT _____*/
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
/*_____ CONFIGURE ENVIROMENT _____*/
dotenv.config();

/*_____ FUNCTION CREATES A TOKEN FOR THE CLIENT _____*/
export const create_token = async user => {
    /*_____ USE A LOCAL ENVIROMENT VARIABLE FOR THE PRIVATE KEY _____*/
    const { DEV_TOKEN } = process.env;
    /*_____ TOKEN EXPIRES AFTER SIX HOURS _____*/
    const token = await jwt.sign({ id: user._id }, DEV_TOKEN, {
        expiresIn: 21600
    });
    return token;
};

/*_____ EXPORT THE HELPER FUNCTION _____*/
export default create_token;