'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Photo from '../../models/photo_model.js';
import create_token from '../../helpers/create_token.js';
import { createError } from '../../helpers/errors.js';

/*_____ CREATE A NEW PROFILE _____*/
export const create = async (req, res, next) => {
    try {
        /*_____ ENSURE THAT PARAMETERS EXIST _____*/
        const { name, email, password } = req.body;
        if (!name
            ||
            (name && !name.trim().length)
            ||
            !email
            ||
            (email && !email.trim().length)
            ||
            !password
            ||
            (password && password.trim().length < 6)) {
            return next(createError({
                status: 400,
                message: 'Please Fill Out All Of The Fields'
            }));
        }
        if (password && password.trim().length > 100) {
            return next(createError({
                status: 400,
                message: 'Password Is Way Too Long'
            }));
        }
        /*_____ ENSURE THAT EMAIL IS UNIQUE _____*/
        const profile = await Profile.findOne({ email });
        if (profile) {
            return next(createError({
                status: 400,
                message: 'A Profile Already Exists With That Email'
            }));
        }
        /*_____ CREATE A PHOTO DOCUMENT FOR THE PROFILE PICTURE _____*/
        const createdPhoto = await Photo.create({ url: req.body.image });
        /*_____ ATTACH THE PHOTO ID _____*/
        req.body.image = createdPhoto._id;
        /*_____ CREATE A NEW PROFILE _____*/
        const createdProfile = await Profile.create(req.body);
        /*_____ ASSIGN THE IMAGES OWNER TO THE NEW PROFILE _____*/
        createdPhoto.owner = createdProfile._id;
        createdPhoto.descriptor = createdProfile.gender;
        /*_____ SAVE THE CHANGES _____*/
        await createdPhoto.save();
        /*_____ CREATE AN ACCESS TOKEN _____*/
        const token = await create_token(createdProfile);
        return res.status(200).json({
            token,
            message: 'Profile Created Successfully',
        });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Create Profile'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default create;