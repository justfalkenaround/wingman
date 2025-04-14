'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Notification from '../../models/notification_model.js';
import { createError } from '../../helpers/errors.js';
import { io } from '../../app.js'

/*_____ THIS FUNCTION WILL EITHER ACCEPT OR REJECT A MATCH AS DIRECTED BY THE USER _____*/
export const create_match = async (req, res, next) => {
    try {
        /*_____ GET THE USERS PROFILE DOCUMENT _____*/
        const profile = await Profile.findById(req.id).exec()
        const { id } = req.params;
        /*_____ GET THE OTHER PROFILE IN QUESTION _____*/
        const other_profile = await Profile.findById(id).exec()
        if (!other_profile || !profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ POST NOTIFICATIONS TO BOTH USERS AND LINK MATCHES _____*/
        if (!profile.matches.includes(other_profile._id)) {
            profile.matches.unshift(other_profile._id)
            const note_one = await Notification.create({
                header: `You Matched With ${other_profile.name}!`,
                message: 'Click Here To View Matches.',
                href: `/account/matches`
            });
            profile.notifications.unshift(note_one._id);
            /*_____ SAVE THE CHANGES _____*/
            await profile.save()
        }
        if (!other_profile.matches.includes(profile._id)) {
            other_profile.matches.unshift(profile._id)
            const note_two = await Notification.create({
                header: `You Matched With ${profile.name}!`,
                message: 'Click Here To View Matches.',
                href: `/account/matches`
            });
            other_profile.notifications.unshift(note_two._id);
            /*_____ SAVE THE CHANGES _____*/
            await other_profile.save()
            io.to(`user:${other_profile._id}`).emit('refresh_user', 'refresh')
        }
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Create Match'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default create_match;