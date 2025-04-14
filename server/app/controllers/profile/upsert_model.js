'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import formidable from 'formidable';
import { createError } from '../../helpers/errors.js';
import Model from '../../models/model_model.js';
import Profile from '../../models/profile_model.js';
import fs from 'fs/promises';

/*_____ CREATE OR UPDATE A MACHINE LEARNING MODEL IN MULTIPART/FORMDATA FORM _____*/
export const upsert_model = async (req, res, next) => {
    try {
        /*_____ USING FORMIDABLE PARSER HERE AND WRAPPING IT IN A PROMISE _____*/
        let model = null;
        const form = formidable();
        form.encoding = 'utf-8';
        await new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) { throw err };
                let total_size = 0;
                /*_____ CREATE AN OBJECT MIRRORING THE SCHEMA _____*/
                const tempMod = {
                    owner: null,
                    files: []
                };
                /*_____ FILL IT WITH FILE LIKE OBJECTS _____*/
                const keys = Object.keys(files);
                for await (let filename of keys) {
                    let temp_data = null;
                    if (filename.includes('.json')) {
                        temp_data = await fs.readFile(files[filename][0].filepath, 'UTF-8');
                    }
                    else {
                        temp_data = await fs.readFile(files[filename][0].filepath);
                    }
                    total_size += files[filename][0].size;
                    tempMod.files.push({
                        name: filename,
                        data: temp_data
                    });
                }
                tempMod.size = total_size;
                /*_____ GET THE USERS PROFILE _____*/
                const profile = await Profile.findById(req.id).exec();
                if (!profile) {
                    return next(createError({
                        status: 401,
                        message: 'Must Be Signed In To Save Model'
                    }));
                }
                /*_____ ASSIGN THE MODELS OWNER _____*/
                tempMod.owner = profile._id;
                if (profile.model) {
                    /*_____ EITHER REPLACE THE OLD MODEL _____*/
                    const old_model = await Model.findOne({ _id: profile.model }).exec();
                    /*_____ COPY THE METRICS _____*/
                    if (old_model.metrics) {
                        tempMod.metrics = [...old_model.metrics]
                    }
                    model = await Model.create(tempMod);
                    if (old_model) {
                        await Model.findByIdAndRemove(old_model._id).exec();
                    }
                }
                else {
                    /*_____ OR CREATE A NEW ONE _____*/
                    model = await Model.create(tempMod);
                }
                /*_____ UPDATE THE MODEL ID ON THE PROFILE _____*/
                profile.model = model._id;
                profile.needs_training = false;
                /*_____ AND SAVE THE CHANGES _____*/
                await profile.save();
                resolve();
            })
        })
        res.status(200).json({ success: true })
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Failed To Save Model'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default upsert_model;