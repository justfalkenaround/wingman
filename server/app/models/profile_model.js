'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
/*_____ UNUSED IMPORTS ARE TO ENSURE THAT ALL MODELS ARE REGISTERED WITH MONGOOSE _____*/
/*_____ THEY MUST STAY FOR EDGE CASES _____*/
import { } from './chat_model.js';
import { } from './model_model.js';
import { } from './notification_model.js';
import { } from './photo_model.js';

/*_____ SCHEMA FOR A PROFILE DOCUMENT _____*/

/*_____ NAMED EXPORT OF SCHEMA _____*/
export const Profile = new mongoose.Schema(
    {
        /*_____ USERS NAME _____*/
        name: { type: String, required: true },
        /*_____ USERS EMAIL _____*/
        email: { type: String, required: true, unique: true },
        /*_____ USERS HASHED PASSWORD _____*/
        password: { type: String, required: true },
        /*_____ USERS THEME CHOICE _____*/
        theme: { type: String, default: 'light' },
        /*_____ USERS GENDER _____*/
        gender: { type: String, required: true },
        /*_____ USERS GENDER PREFERENCE _____*/
        preference: { type: String, required: true },
        /*_____ MAIN PROFILE PICTURE _____*/
        image: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
        /*_____ USERS ADDITIONAL IMAGES _____*/
        images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
        /*_____ USER LOCATION COORDINATE _____*/
        coord: { type: [Number], required: true },
        /*_____ USERS LOCATION IN STRING FORM _____*/
        location: { type: String, required: true },
        /*_____ USERS AGE _____*/
        age: { type: Number, required: true },
        /*_____ USERS BIO _____*/
        bio: { type: String },
        /*_____ LIST OF USERS NOTIFICATIONS _____*/
        notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
        /*_____ LIST OF USERS MATCHES _____*/
        matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
        /*_____ LIST OF USERS CHATS _____*/
        chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
        /*_____ LIST OF PROFILES THAT THE USER HAS ALREADY MATCHED OR INTERACTED WITH _____*/
        seen_profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
        /*_____ LIST OF IMAGES THAT HAVE ALREADY BEEN CLASSIFIED BY THE USER _____*/
        seen_images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }],
        /*_____ LIST CONTAINING THE CLASSIFIED IMAGES THAT THE USERS MODEL HAS NOT YET SEEN _____*/
        untrained_set: [{
            rating: Number,
            image: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }
        }],
        /*_____ LIST CONTAINING THE CLASSIFIED IMAGES THAT THE USERS MODEL HAS ALREADY SEEN _____*/
        trained_set: [{
            rating: Number,
            image: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }
        }],
        /*_____ TIMESTAMP WHEN THE USERS MODEL WAS LAST TRAINED _____*/
        model_last_trained: { type: Number, default: 0 },
        /*_____ USERS MACHINE LEARNING MODEL FOR ANALYZING IMAGES _____*/
        model: { type: mongoose.Schema.Types.ObjectId, ref: 'Model' },
        /*_____ NUMBER OF TIMES THIS ACCOUNT HAS BEEN FLAGGED FOR INNAPROPRIATE ACTIVITY _____*/
        flags: { type: Number, default: 0 },
        /*_____ BOOLEAN REPRESENTS THE INITIALIZATION OF THE DOCUMENT AND PASSWORD _____*/
        hashed: { type: Boolean, default: false },
        /*_____ BOOLEAN REPRESENTS THE NEED TO TRAIN ML MODEL _____*/
        needs_training: { type: Boolean, default: false }
    },
    { timestamps: true }
);

/*_____ SOME FIELDS ARE INDEXED FOR MORE EFFECIENT DB QUERIES _____*/
Profile.index({ gender: 1, preference: 1, age: 1, coord: '2dsphere' });

/*_____ HASH THE PASSWORD AND UPDATE IF RELEVANT _____*/
Profile.pre('save', function (next) {
    if (this.hashed) return next();
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) return next(err);
            this.hashed = true;
            this.password = hash;
            next();
        });
    });
});

/*_____ HASH THE PASSWORD AND UPDATE IF RELEVANT _____*/
Profile.pre('findOneAndUpdate', function (next) {
    if (!this._update.password) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(this._update.password, salt, (err, hash) => {
            if (err) return next(err);
            this._update.password = hash;
            next();
        });
    });
});

/*_____ COMPARE AN INPUTTED PASSWORD WITH THE HASH AND THE KEY FOR VALIDITY _____*/
Profile.methods.comparePassword = function (pass, done) {
    bcrypt.compare(pass, this.password, (err, match) => {
        if (err) return done(err);
        done(null, match);
    });
};

/*_____ EXPORT THE MODEL _____*/
export default mongoose.model('Profile', Profile);