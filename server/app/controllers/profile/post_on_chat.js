'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Chat from '../../models/chat_model.js';
import { createError } from '../../helpers/errors.js';
import { io } from '../../app.js'

/*_____ GET ALL OF THE PROFILES MATCHES _____*/
export const post_on_chat = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE _____*/
        const profile = await Profile.findById(req.id).select('matches');
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ FIND THE CHAT _____*/
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return next(createError({
                status: 404,
                message: 'Chat No Longer Exists'
            }));
        }
        /*_____ CONFIRM THERE IS NO FISHY BUSINESS _____*/
        if (!chat.owners.includes(profile._id)) {
            return next(createError({
                status: 401,
                message: 'Access Denied'
            }));
        }
        /*_____ SET AS UNREAD _____*/
        chat.unread_owners = [...chat.owners];
        /*_____ ADD THE MESSAGE _____*/
        chat.messages.push(req.body);
        /*_____ SAVE THE CHANGES _____*/
        await chat.save()
        res.status(200).json(chat);
        /*_____ EMIT TO USERS IN THE CHATROOM _____*/
        io.sockets.in(`chatroom:${chat._id}`).emit('push_chat', req.body)
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Post To Chatroom'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default post_on_chat;