'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ GENERAL FUNCTION FOR UPDATING A PROFILE _____*/
export const update = async (req, res, next) => {
    try {
        /*_____ DONT LET MALICIOUS USERS CHANGE THE FLAGS _____*/
        req.body.flags = null;
        /*_____ UPDATE WITH VALIDATION _____*/
        const result = await Profile.findByIdAndUpdate(req.id, req.body, {
            new: true,
            select: '_id name image images coord location age bio'
        }).exec();
        res.status(200).json(result);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Update Profile'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default update;