'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import mongoose from 'mongoose';

/*_____ SCHEMA FOR A PHOTO MODEL _____*/
/*_____ PHOTOS WILL PERSIST INDEPENDENT OF ALL OTHER MODELS _____*/

/*_____ NAMED EXPORT OF SCHEMA _____*/
export const Photo = new mongoose.Schema(
    {
        /*_____ THE DATA URL OR URL TO IMAGE _____*/
        url: { type: String, required: true },
        /*_____ ORIGINAL OWNER OF IMAGE _____*/
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
        /*_____ OPTIONAL GENDER DESCRIPTOR OR ALT _____*/
        descriptor: { type: String, default: 'any' }
    },
    { timestamps: true }
);

/*_____ EXPORT THE MODEL _____*/
export default mongoose.model('Photo', Photo);