'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Chat from '../../models/chat_model.js';
import { createError } from '../../helpers/errors.js';
import { io } from '../../app.js'

/*_____ DELETE A CHAT _____*/
export const delete_chat = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).exec();
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ FIND THE CHAT _____*/
        const chat = await Chat.findById(req.params.id).exec()
        if (!chat) {
            return next(createError({
                status: 404,
                message: 'Chat No Longer Exists'
            }));
        }
        /*_____ CONFIRM THAT THERE IS NO FISHY BUSINESS _____*/
        if (!chat.owners.includes(profile._id)) {
            return next(createError({
                status: 401,
                message: 'Access Denied'
            }));
        }
        /*_____ FIND THE OTHER PROFILE LISTED IN THE CHAT _____*/
        const other_profile = await Profile.findById(chat.owners.filter(x => x._id !== profile._id)[0]).exec()
        if (!other_profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ REMOVE REFERENCES TO THE CHAT _____*/
        profile.chats.pull({ _id: chat._id })
        other_profile.chats.pull({ _id: chat._id })
        /*_____ SAVE THE CHANGES _____*/
        await other_profile.save()
        await profile.save()
        /*_____ DELETE THE CHAT _____*/
        await Chat.findByIdAndRemove(req.params.id).exec()
        io.to(`user:${other_profile._id}`).emit('refresh_page', 'refresh')
        res.status(200).json({ success: true });
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Delete Chat'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default delete_chat;