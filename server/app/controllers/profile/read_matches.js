'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ GET ALL OF THE PROFILES MATCHES _____*/
export const read_matches = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).select('matches');
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ POPULATE THE MATCHES DATA _____*/
        await Profile.populate(profile, [
            { path: 'matches', select: 'name image gender preference images coord location age bio _id' },
        ]);
        /*_____ ASYNC LOOP OVER MATCHES AND POPULATE THE IMAGE DATA WITHING _____*/
        for await (let v of profile.matches) {
            await Profile.populate(v, [
                { path: 'image' },
                { path: 'images' },
            ]);
        }
        res.status(200).json(profile.matches);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Read Matches'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default read_matches;