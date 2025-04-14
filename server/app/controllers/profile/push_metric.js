'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Model from '../../models/model_model.js';
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ ADD METRICS DATA TO ML MODEL DOCUMENT _____*/
export const push_metric = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).exec();
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ ENSURE A MODEL EXISTS _____*/
        if (!profile.model) {
            return next(createError({
                status: 404,
                message: 'No ML Model Saved To Profile'
            }));
        }
        /*_____ FIND THE USERS MODEL _____*/
        const model = await Model.findById(profile.model).exec()
        /*_____ UPLOAD THE DOC _____*/
        model.metrics.push(req.body)
        /*_____ SAVE THE CHANGES _____*/
        await model.save()
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Update Model Metrics'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default push_metric;