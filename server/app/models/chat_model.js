'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import mongoose from 'mongoose';

/*_____ SCHEMA FOR A CHATROOM DOCUMENT _____*/

/*_____ NAMED EXPORT OF SCHEMA _____*/
export const Chat = new mongoose.Schema(
    {
        /*_____ FIELD OF OWNER REFERENCES _____*/
        owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
        /*_____ FIELD SHOWS WHICH OWNERS HAVE UNREAD MESSAGES _____*/
        unread_owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
        /*_____ ARRAY OF MESSAGES WITH TIMESTAMPS _____*/
        messages: [{
            owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
            content: { type: String, maxlength: 1000 },
            timestamp: Number
        }]
    },
    { timestamps: true }
);

/*_____ EXPORT THE MODEL _____*/
export default mongoose.model('Chat', Chat);