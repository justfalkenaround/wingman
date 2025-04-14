'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Model from '../../models/model_model.js';
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ GET THE USERS MACHINE LEARNING MODEL FOLLOWING THE PATTERN OF STATIC RESOURCES _____*/
export const read_model = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).exec();
        if (!profile) {
            return next(createError({
                status: 401,
                message: 'Must Be Signed In To Read Model'
            }));
        }
        /*_____ USER MUST HAVE A MODEL TRAINED _____*/
        else if (!profile.model) {
            return next(createError({
                status: 404,
                message: 'No Model Saved To User'
            }));
        }
        const { userid } = req.params;
        const dest_profile = await Profile.findById(userid).exec();
        if (!dest_profile) {
            return next(createError({
                status: 404,
                message: 'Could Not Find Profile'
            }));
        }
        /*_____ FIND THE MODEL ASSIGNED TO THE USER _____*/
        const model = await Model.findById(dest_profile.model).exec();
        let file = null;
        /*_____ LOOP OVER THE FILE LIKE OBJECTS AND FIND THE ONE REQUESTED _____*/
        for (let i = 0; i < model.files.length; i++) {
            if (model.files[i].name === req.params.filename) {
                /*_____ FOUND IT _____*/
                file = model.files[i];
                break;
            }
        }
        /*_____ RETURN ONLY THE REQUESTED FILE _____*/
        if (file.name.includes('.json')) {
            res.json(JSON.parse(file.data))
        }
        else {
            res.send(file.data)
        }
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Failed To Get Model'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default read_model;