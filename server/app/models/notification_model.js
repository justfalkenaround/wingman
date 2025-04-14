'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import mongoose from 'mongoose';

/*_____ SCHEMA FOR A NOTIFICATION DOCUMENT _____*/

/*_____ NAMED EXPORT OF SCHEMA _____*/
export const Notification = new mongoose.Schema(
    {
        /*_____ HEADER STRING _____*/
        header: { type: String, required: true },
        /*_____ MESSAGE CONTENT _____*/
        message: { type: String, required: true },
        /*_____ PATH TO ACTION LOCATION _____*/
        href: { type: String, required: true },
        /*_____ BOOLEAN FOR WARNING ICON AND COLOR _____*/
        warn: { type: Boolean, default: false },
        /*_____ BOOLEAN IF THE USER HAS INTERACTED WITH THE NOTIFICATION _____*/
        seen: { type: Boolean, default: false }
    },
    { timestamps: true }
);

/*_____ EXPORT THE MODEL _____*/
export default mongoose.model('Notification', Notification);