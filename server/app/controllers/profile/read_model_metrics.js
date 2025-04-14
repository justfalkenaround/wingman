'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ GET THE MACHINE LEARNING TRAINING DATA _____*/
export const read_model_metrics = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).exec()
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ POPULATE THE DATA _____*/
        await Profile.populate(profile, [
            { path: 'model', select: 'metrics size' },
        ]);
        res.status(200).json({ metrics: profile.model.metrics, size: profile.model.size });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Read Model Metrics'
        }, err));
    }
}

export default read_model_metrics;