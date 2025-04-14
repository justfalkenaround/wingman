'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Photo from '../../models/photo_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ THIS FUNCTION WILL HANDLE CASES WHERE A USER INTENDS TO ADD REMOVE OR SWAP AN IMAGE AS PROFILE PICTURE _____*/
export const read_next_photo = async (req, res, next) => {
    try {
        /*_____ GET THE USER PROFILE DOCUMENT _____*/
        const profile = await Profile.findOne({ _id: req.id });
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ FIND AN IMAGE THAT IS NEW TO THE USER AND MATCHES THIER PREFERENCE _____*/
        /*_____ RANDOMIZE ORDER _____*/
        let images = null;
        /*_____ ANY GENDER _____*/
        if (profile.preference === 'any') {
            images = await Photo.aggregate([
                {
                    $match:
                    {
                        $and:
                            [
                                { _id: { $nin: profile.seen_images } }
                            ]
                    }
                },
                {
                    $sample: { size: 1 }
                },
            ]).exec();
        }
        /*_____ WITH PREFERENCE _____*/
        else {
            images = await Photo.aggregate([
                {
                    $match:
                    {
                        $and:
                            [
                                { _id: { $nin: profile.seen_images } },
                                { descriptor: profile.preference }
                            ]
                    }
                },
                {
                    $sample: { size: 1 }
                },
            ]).exec();
        }
        if (!images.length) {
            return next(createError({
                status: 404,
                message: 'No More Training Images Available'
            }));
        }
        res.status(200).json(images[0]);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Get Next Training Image'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default read_next_photo;