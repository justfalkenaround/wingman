'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Profile from '../../models/profile_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ READ A COUNT OF POSSIBLE MATCHES _____*/
export const read_count = async (req, res, next) => {
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
        /*_____ WE ARE GOING TO AGGREGATE _____*/
        /*_____ FIRST BY PHYSICAL DISTANCE _____*/
        /*_____ THEN FILTER BY GENDER PREFERENCE AND AGE _____*/
        /*_____ THEN COUNT THE POSSIBLE RESULTS _____*/
        const profiles = await Profile.aggregate([
            {
                $geoNear:
                {
                    geoNear: 'profiles',
                    distanceField: 'distance',
                    spherical: true,
                    near: profile.coord,
                    maxDistance: Number(maxdist) || Infinity,
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
                $project:
                {
                    _id: 1,
                }
            },
        ]).exec();
        if (!profiles) {
            return next(createError({
                status: 404,
                message: 'Could not find any matches.'
            }));
        }
        /*_____ RETURN THE QUANTITY FOUND _____*/
        res.status(200).json(profiles.length);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Read Match Count'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default read_count;