'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Photo from '../../models/photo_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ GET THE MACHINE LEARNING TRAINING DATA SETS _____*/
export const read_training_sets = async (req, res, next) => {
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
            { path: 'untrained_set' },
            { path: 'trained_set' },
        ]);
        for await (let doc of profile.untrained_set) {
            await Photo.populate(doc, [
                { path: 'image' },
            ]);
        }
        for await (let doc of profile.trained_set) {
            await Photo.populate(doc, [
                { path: 'image' },
            ]);
        }
        /*_____ RETURN THE COMBINATION _____*/
        res.status(200).json([...profile.untrained_set, ...profile.trained_set]);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Read Training Data'
        }, err));
    }
}

export default read_training_sets;