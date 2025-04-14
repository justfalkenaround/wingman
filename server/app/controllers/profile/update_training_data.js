'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ UPDATE THE MACHINE LEARNING DATA SETS _____*/
export const update_training_data = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).exec()
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        profile.trained_set.push(...profile.untrained_set)
        profile.model_last_trained = Date.now()
        await profile.save()
        await Profile.findByIdAndUpdate(req.id, { untrained_set: [] }).exec()
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Update Training Data'
        }, err));
    }
}

export default update_training_data;