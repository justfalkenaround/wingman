'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Photo from '../../models/photo_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ THIS FUNCTION WILL HANDLE CASES WHERE A USER INTENDS TO ADD REMOVE OR SWAP AN IMAGE AS PROFILE PICTURE _____*/
export const update_images = async (req, res, next) => {
    try {
        /*_____ GET THE USER PROFILE DOCUMENT _____*/
        const profile = await Profile.findOne({ _id: req.id });
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ CREATE _____*/
        if (req.body.newImage) {
            /*_____ CREATE THE PHOTO DOCUMENT _____*/
            const createdPhoto = await Photo.create({ url: req.body.newImage });
            /*_____ ADD THE PHOTO TO THE PROFILES IMAGES _____*/
            profile.images.push(createdPhoto._id);
            /*_____ ASSIGN THE PHOTOS ORIGINAL OWNER _____*/
            createdPhoto.owner = profile._id;
            createdPhoto.descriptor = profile.gender;
            /*_____ SAVE THE CHANGES _____*/
            await profile.save();
            await createdPhoto.save();
        }
        /*_____ DELETE _____*/
        if (req.body.deleteImage) {
            /*_____ REMOVE THE REFENCE FROM THE PROFILE _____*/
            profile.images.splice(profile.images.indexOf(req.body.deleteImage), 1);
            /*_____ AND SAVE _____*/
            await profile.save()
        }
        /*_____ UPDATE _____*/
        if (req.body.swapImage) {
            /*_____ SWAP THE REFERENCES OUT TO MAKE THE NEW PROFILE PICTURE _____*/
            profile.images.push(profile.image._id);
            profile.images.splice(profile.images.indexOf(req.body.swapImage), 1);
            profile.image = req.body.swapImage;
            /*_____ SAVE THE CHANGES _____*/
            await profile.save();
        }
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Update Profile Images'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default update_images;