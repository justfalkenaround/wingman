'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Chat from '../../models/chat_model.js';
import Notification from '../../models/notification_model.js';
import Model from '../../models/model_model.js';
import { createError } from '../../helpers/errors.js';
import { io } from '../../app.js'

/*_____ DELETE A PROFILE AND ALL REFERENCES TO IT _____*/
export const delete_profile = async (req, res, next) => {
    try {
        /*_____ FIND AND DELETE THE PROFILE _____*/
        const profile = await Profile.findByIdAndRemove(req.id).exec();
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ ASYNC LOOP OVER THIS PROFILES CHATS _____*/
        await Profile.populate(profile, [
            { path: 'chats', select: '-messages' }
        ])
        for await (let chat of profile.chats || []) {
            /*_____ PULL THIS CHAT FROM THE OTHER PROFILES CHATS _____*/
            chat.owners.pull(profile._id)
            const prof = await Profile.findById(chat.owners[0]).exec();
            prof.chats.pull({ _id: chat._id })
            await prof.save()
            io.to(`user:${prof._id}`).emit('refresh_user', 'refresh')
            /*_____ DELETE THE CHAT _____*/
            await Chat.findByIdAndDelete(chat._id).exec();
        }
        /*_____ ASYNC LOOP OVER THIS PROFILES NOTICATIONS _____*/
        for await (let note of profile.notifications || []) {
            /*_____ DELETE THEM _____*/
            await Notification.findByIdAndDelete(note).exec();
        }
        /*_____ DELETE THE MACHINE LEARNING MODEL ASSIGNED TO THE PROFILE _____*/
        if (profile.model) {
            await Model.findByIdAndDelete(profile.model).exec();
        }
        /*_____ PULL ALL REFERENCES TO THIS PROFILE FROM ANY OTHER PROFILES MATCHES _____*/
        const profs_one = await Profile.find({ matches: profile._id }).exec();
        for await (let prof of profs_one || []) {
            prof.matches.pull(profile._id)
            await prof.save()
            /*_____ UPDATE AFFECTED USERS _____*/
            io.to(`user:${prof._id}`).emit('refresh_user', 'refresh')
        }
        /*_____ PULL ANY REFERENCES TO THIS PROFILE FROM ANY OTHER PROFILES SEEN ARRAY _____*/
        const profs_two = await Profile.find({ seen_profiles: profile._id }).exec();
        for await (let prof of profs_two || []) {
            prof.seen_profiles.pull(profile._id)
            await prof.save()
            /*_____ UPDATE AFFECTED USERS _____*/
            io.to(`user:${prof._id}`).emit('refresh_user', 'refresh')
        }
        res.status(200).json({ deleted: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Delete Profile'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default delete_profile;