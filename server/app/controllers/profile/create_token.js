'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import _create_token from '../../helpers/create_token.js';
import { createError } from '../../helpers/errors.js';

/*_____ SIGN INTO A PROFILE AND RETURN THE CREATED TOKEN _____*/
export const create_token = async (req, res, next) => {
    try {
        /*_____ ENSURE PARAMETERS EXIST _____*/
        const { email, password } = req.body;
        if (!email || !password) {
            return next(createError({
                status: 400,
                message: 'Please Enter A Valid Email And Password'
            }));
        }
        /*_____ ATTEMPT TO FIND THE PROFILE USING THE PROVIDED EMAIL _____*/
        const profile = await Profile.findOne({ email });
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Cannot Find A Profile With That Email'
            }));
        }
        /*_____ COMPARE THE PASSWORD PROVIDED WITH THE PROFILE FOUND _____*/
        profile.comparePassword(password, async (err, match) => {
            if (err) {
                return next(createError({
                    status: 401,
                    message: 'Could Not Validate Password'
                }, err));
            }
            if (!match) {
                return next(createError({
                    status: 401,
                    message: 'Password Incorrect'
                }));
            }
            /*_____ CREATE AND RETURN THE ACCESS TOKEN _____*/
            const token = await _create_token(profile);
            return res.status(200).json({ token, message: 'Signed In Successfully' });
        });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Create Token'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default create_token;