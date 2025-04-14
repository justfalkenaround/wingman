'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ POST MACHINE LEARNING TRAINING DATA SETS _____*/
export const skip_training_data = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).exec();
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ UPLOAD THE DOC _____*/
        profile.seen_images.push(req.params.id);
        /*_____ SAVE THE CHANGES _____*/
        await profile.save()
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Skip Data Item'
        }, err));
    }
}

export default skip_training_data;