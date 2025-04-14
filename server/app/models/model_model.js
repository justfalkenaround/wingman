'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import mongoose from 'mongoose';

/*_____ SCHEMA FOR A MACHINE LEARNING MODEL _____*/

/*_____ NAMED EXPORT OF SCHEMA _____*/
export const Model = new mongoose.Schema(
    {
        /*_____ OWNER FIELD _____*/
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
        /*_____ STATISTICS FIELD _____*/
        metrics: [{
            timestamp: { type: Date, required: true },
            set_size: { type: Number, required: true },
            history: { type: Object, required: true }
        }],
        /*_____ ARRAY OF FILE LIKE OBJECTS _____*/
        files: [{
            name: String,
            data: Buffer
        }],
        /*_____ MODEL SIZE IN BYTES _____*/
        size: { type: Number, default: 0 }
    }
);

/*_____ EXPORT THE MODEL _____*/
export default mongoose.model('Model', Model);