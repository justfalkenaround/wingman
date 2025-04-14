'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Notification from '../../models/notification_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ DELETE A NOTIFICATION _____*/
export const delete_notification = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findOne({ _id: req.id })
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ REMOVE THE NOTIFICATION FROM THIER NOTIFICATIONS _____*/
        profile.notifications.splice(profile.notifications.indexOf(req.params.id), 1);
        /*_____ SAVE THE CHANGES _____*/
        await profile.save()
        /*_____ DELETE THE NOTIFICATION DOCUMENT FROM THE COLLECTION _____*/
        const notification = await Notification.findByIdAndDelete({ _id: req.params.id }, { new: true }).exec()
        res.status(200).json(notification);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Delete Notification'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default delete_notification;