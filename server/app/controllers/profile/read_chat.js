'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Chat from '../../models/chat_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ GET ALL OF THE PROFILES MATCHES _____*/
export const read_chat = async (req, res, next) => {
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
        /*_____ CONFIRM THERE IS NO FISHY BUSINESS GOING ON _____*/
        if (!chat.owners.includes(profile._id)) {
            return next(createError({
                status: 401,
                message: 'Access Denied'
            }));
        }
        /*_____ SET AS READ _____*/
        chat.unread_owners.pull(profile._id);
        /*_____ SAVE THE CHANGES _____*/
        await chat.save()
        await Chat.populate(chat, [
            { path: 'owners', select: '_id name image gender age bio location images' }
        ])
        /*_____ ASYNC LOOP OVER THE OWNERS AND GET THIER IMAGES _____*/
        for await (let owner of chat.owners) {
            if (owner !== profile._id) {
                /*_____ POPULATE THEM _____*/
                await Profile.populate(owner, [
                    { path: 'image' },
                    { path: 'images' },
                ])
            }
        }
        res.status(200).json(chat);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Get Chat'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default read_chat;