'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Citie from '../../models/citie_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ RETURNS TWENTY LOCATION DOCUMENTS THE BEST MATCH IN THE TEXT SEARCH _____*/
export const get_twenty = async (req, res, next) => {
    try {
        const query = req.params.search || 'undefined';
        /*_____ USE MONGODB BUILT IN TEXT SEARCHING _____*/
        /*_____ THE FIELDS SHOULD ALREADY BE INDEXED BY THE SEED SCRIPT _____*/
        const list = await Citie.find({ $text: { $search: query } }).limit(20).exec();
        res.status(200).json(list || []);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Collect Cities'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default get_twenty;