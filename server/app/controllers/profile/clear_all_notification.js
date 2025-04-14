'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Notification from '../../models/notification_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ FUNCTION CLEARS ALL NOTIFICATIONS FROM A PROFILE _____*/
export const clear_all_notification = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findOne({ _id: req.id })
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ DELETE ALL NOTIFICATIONS RELATED TO PROFILE _____*/
        await Notification.deleteMany({ _id: profile.notifications }).exec()
        /*_____ CLEAR REFERENCES FROM PROFILE _____*/
        profile.notifications = [];
        /*_____ SAVE THE CHANGES _____*/
        await profile.save()
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Update Notifications'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default clear_all_notification;