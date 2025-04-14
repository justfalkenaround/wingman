'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Chat from '../../models/chat_model.js';
import Notification from '../../models/notification_model.js';
import { createError } from '../../helpers/errors.js';
import { io } from '../../app.js'

/*_____ THIS FUNCTION WILL EITHER ACCEPT OR REJECT A MATCH AS DIRECTED BY THE USER _____*/
export const update_match = async (req, res, next) => {
    try {
        /*_____ GET THE USERS PROFILE DOCUMENT _____*/
        const profile = await Profile.findById(req.id).exec()
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ DECONSTRUCT THE PARAMETERS _____*/
        const { id, disposition } = req.params;
        /*_____ GET THE OTHER PROFILE IN QUESTION _____*/
        const other_profile = await Profile.findById(id).exec()
        if (!other_profile) {
            profile.matches.splice(profile.matches.indexOf(id), 1);
            await profile.save()
            return res.status(200).json({ message: 'Profile No Longer Exists' });
        }
        /*_____ IF THE USER INTENDS TO ACCEPT THE MATCH _____*/
        if (disposition === 'accept') {
            /*_____ CREATE A CHATROOM DOCUMENT AND REGISTER THE OWNERS _____*/
            const chat = await Chat.create({
                owners: [
                    profile._id,
                    other_profile._id
                ]
            });
            /*_____ REMOVE PROFILE REFERENCES FROM BOTH PROFILES MATCHES _____*/
            profile.matches.splice(profile.matches.indexOf(other_profile._id), 1);
            /*_____ IF IT EXISTS _____*/
            other_profile.matches.includes(profile._id) ? other_profile.matches.splice(profile.matches.indexOf(profile._id), 1) : null;
            /*_____ ADD REFERNCES TO EACHOTHERS SEEN PROFILES TO PREVENT FUTURE MATCHING _____*/
            profile.seen_profiles.push(other_profile._id);
            other_profile.seen_profiles.push(profile._id);
            /*_____ LINK THE CHATROOM TO BOTH PROFILES _____*/
            profile.chats.push(chat);
            other_profile.chats.push(chat);
            /*_____ POST NOTIFICATIONS TO BOTH USERS LINKING TO THE CHATROOM _____*/
            const note_one = await Notification.create({
                header: `You Opened A Chat With ${other_profile.name}!`,
                message: 'Click Here To Chat.',
                href: `/chat/${chat._id}`
            });
            profile.notifications.unshift(note_one._id);
            const note_two = await Notification.create({
                header: `${profile.name} Opened A Chat With You!`,
                message: 'Click Here To Chat.',
                href: `/chat/${chat._id}`
            });
            other_profile.notifications.unshift(note_two._id);
            io.to(`user:${other_profile._id}`).emit('refresh_user', 'refresh')
            /*_____ SAVE THE CHANGES _____*/
            await other_profile.save()
            await profile.save()
        }
        /*_____ IF THE USER INTENDS TO REJECT THE MATCH _____*/
        else if (disposition === 'reject') {
            /*_____ REMOVE BOTH PROFILES FROM MATCHES _____*/
            profile.matches.splice(profile.matches.indexOf(other_profile._id), 1);
            /*_____ IF ONE EXISTS _____*/
            other_profile.matches.includes(profile._id) ? other_profile.matches.splice(profile.matches.indexOf(profile._id), 1) : null;
            /*_____ ADD REFERENCES TO BOTH PROFILES SEEN ARRAY TO PREVENT FURTHUR MATCHING _____*/
            profile.seen_profiles.push(other_profile._id);
            other_profile.seen_profiles.push(profile._id);
            /*_____ SAVE THE CHANGES _____*/
            await other_profile.save()
            await profile.save()
        }
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Update Match'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default update_match;