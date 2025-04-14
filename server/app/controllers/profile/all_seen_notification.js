'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Notification from '../../models/notification_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ SET ALL PROFILES NOTIFICATIONS TO SEEN _____*/
export const all_seen_notification = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findOne({ _id: req.id })
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ UPDATE ALL OF THE PROFILES NOTIFICATIONS AS SEEN _____*/
        await Notification.updateMany({ _id: profile.notifications }, { seen: true }).exec()
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
export default all_seen_notification;