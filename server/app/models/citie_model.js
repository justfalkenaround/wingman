'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import mongoose from 'mongoose';

/*_____ SCHEMA FOR A CITY DOCUMENT _____*/

/*_____ NAMED EXPORT OF SCHEMA _____*/
export const Citie = new mongoose.Schema(
    {
        city: String,
        city_ascii: String,
        lat: Number,
        lng: Number,
        country: String,
        iso2: String,
        iso3: String,
        admin_name: String
    }
);

/*_____ EXPORT THE MODEL _____*/
export default mongoose.model('Citie', Citie);