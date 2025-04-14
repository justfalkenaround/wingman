'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import Chat from '../../models/chat_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ READ FUNCTION RETURNS A SEMI-POPULATED PROFILE _____*/
export const read = async (req, res, next) => {
    try {
        /*_____ FIND THE USERS PROFILE ONLY WITH NEEDED DATA _____*/
        const profile = await Profile.findById(req.id).select('-password -__v');
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        /*_____ POPULATE COMMONLY NEEDED DATA _____*/
        await Profile.populate(profile, [
            { path: 'image' },
            { path: 'images' },
            { path: 'notifications' },
            { path: 'chats', select: 'owners unread_owners updatedAt' },
        ]);
        /*_____ ASYNC LOOP OVER CHATS AND POPULATE DATA WITHIN EACH _____*/
        for await (let chat of profile.chats) {
            await Chat.populate(chat, [
                { path: 'owners', select: 'name _id image' },
            ]);
        }
        /*_____ ASYNC LOOP OVER CHATS AND POPULATE IMAGE DATA WITHIN EACH _____*/
        for await (let chat of profile.chats) {
            for await (let owner of chat.owners) {
                if (owner._id !== profile._id) {
                    await Profile.populate(owner, [
                        { path: 'image' },
                    ]);
                }
            }
        }
        res.status(200).json(profile);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could read Profile'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default read;