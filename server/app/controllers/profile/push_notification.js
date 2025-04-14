'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Notification from '../../models/notification_model.js';
import { createError } from '../../helpers/errors.js';
import { io } from '../../app.js';

/*_____ ADD A NOTIFICATION TO THE PROFILE _____*/
export const push_notification = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findOne({ _id: req.id });
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ CREATE A NOTIFICATION DOCUMENT _____*/
        const notification = await Notification.create(req.body);
        /*_____ ADD TO THE TOP OF THE LIST _____*/
        profile.notifications.unshift(notification._id);
        /*_____ SAVE THE CHANGES _____*/
        await profile.save();
        res.status(200).json(notification);
        /*_____ UPDATE THE USERS CLIENT _____*/
        io.to(`user:${req.id}`).emit('refresh_user', 'refresh')
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Create Notification'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default push_notification;