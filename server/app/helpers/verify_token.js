'use strict';

/*_____ IMPORT THE DEPENDENCIES FOR AUTHENTICATION SUPPORT _____*/
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
/*_____ CONFIGURE THE ENVIROMENT _____*/
dotenv.config();
import { createError } from './errors.js';

/*_____ FUNCTION DECRYPTS THE TOKEN USING THE PRIVATE KEY AND CONFIRMS VALIDITY _____*/
export const verify_token = async (req, res, next) => {
    try {
        /*_____ GET AUTHORIZATION THE HEADER _____*/
        const authHeader = req.headers['authorization'];
        /*_____ GET THE DATA PORTION OF THE STRING _____*/
        const token = authHeader && authHeader.split(' ')[1];
        /*_____ HANDLE ERRORS _____*/
        if (!token) {
            return next(createError({
                status: 401,
                message: 'Could Not Verify Token'
            }));
        }
        /*_____ DECRYPT TOKEN DATA AND VERIFY _____*/
        await jwt.verify(token, process.env.DEV_TOKEN, (err, profile) => {
            if (err) {
                return next(createError({
                    status: 403,
                    message: 'Invalid Access Token'
                }, err));
            }
            /*_____ ATTACH ID TO THE REQUEST OBJECT _____*/
            req.id = profile.id;
            next();
        });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Something Went Wrong Validating Token'
        }, err));
    }
}

/*_____ EXPORT THE HELPER FUNCTION AS DEFAULT _____*/
export default verify_token;