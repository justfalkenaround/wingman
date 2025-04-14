'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ READ FUNCTION RETURNS A SEMI-POPULATED PROFILE _____*/
export const read_potentials = async (req, res, next) => {
    try {
        const { minage, maxage, maxdist } = req.params;
        /*_____ FIND THE USERS PROFILE ONLY WITH NEEDED DATA _____*/
        const profile = await Profile.findById(req.id).exec()
        if (!profile) {
            return next(createError({
                status: 404,
                message: 'Profile No Longer Exists'
            }));
        }
        if (profile.needs_training) {
            return next(createError({
                status: 400,
                message: 'Profile ML Model Needs Training'
            }));
        }
        /*_____ WE ARE GOING TO AGGREGATE _____*/
        /*_____ FIRST BY PHYSICAL DISTANCE _____*/
        /*_____ THEN FILTER BY GENDER PREFERENCE AND AGE _____*/
        /*_____ THEN RANDOMLY SELECT TEN _____*/
        /*_____ THEN ONLY RETURN SPECIFIC RESULTS _____*/
        const profiles = await Profile.aggregate([
            {
                $geoNear:
                {
                    geoNear: 'profiles',
                    distanceField: 'distance',
                    spherical: true,
                    near: profile.coord,
                    maxDistance: Number(maxdist) || Infinity,
                    limit: 5000,
                    key: 'coord'
                }
            },
            {
                $match:
                {
                    $and:
                        [
                            {
                                $nor:
                                    [
                                        { model: undefined },
                                    ]
                            },
                            {
                                $and:
                                    [
                                        { _id: { $ne: profile._id } },
                                        { _id: { $nin: profile.matches } },
                                        { _id: { $nin: profile.seen_profiles } }
                                    ],
                            },
                            {
                                $or:
                                    [
                                        { preference: profile.gender },
                                        { preference: 'any' },
                                    ],
                            },
                            {
                                $or:
                                    [
                                        { gender: profile.preference },
                                        profile.preference === 'any'
                                            ?
                                            {
                                                $or:
                                                    [
                                                        { gender: 'male' },
                                                        { gender: 'female' },
                                                        { gender: 'other' }
                                                    ]
                                            }
                                            :
                                            { gender: profile.preference }
                                    ],
                            },
                            {
                                $and:
                                    [
                                        { age: { $lte: Number(maxage) || Infinity } },
                                        { age: { $gte: Number(minage) || -Infinity } }
                                    ],
                            },
                            {
                                seen_profiles:
                                {
                                    $nin: profile.seen_profiles
                                },
                            },
                            {
                                matches:
                                {
                                    $nin: profile.matches
                                },
                            },
                        ]
                }
            },
            {
                $sample: { size: 50 }
            },
            {
                $project:
                {
                    _id: 1,
                    name: 1,
                    gender: 1,
                    preference: 1,
                    image: 1,
                    coord: 1,
                    location: 1,
                    age: 1,
                    bio: 1,
                    model: 1
                }
            },
        ]).exec();
        if (!profiles) {
            return next(createError({
                status: 404,
                message: 'Could not find any matches.'
            }));
        }
        /*_____ ASYNC LOOP OVER THE PROFILES FOUND _____*/
        for await (let prof of profiles) {
            /*_____ POPULATE NEEDED DATA _____*/
            await Profile.populate(prof, [
                { path: 'image' },
            ]);
        }
        profile.needs_training = true;
        await profile.save()
        /*_____ RETURN THE LIST OF PROFILES _____*/
        res.status(200).json(profiles);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Get Potential Matches'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default read_potentials;