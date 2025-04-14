'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import Notification from '../../models/notification_model.js';
import { createError } from '../../helpers/errors.js';

/*_____ FUNCTION WILL UPDATE A NOTIFICATION DOCUMENT IN THE COLLECTION _____*/
export const update_notification = async (req, res, next) => {
    try {
        /*_____ FIND BY ID AN UPDATE _____*/
        const notification = await Notification.findByIdAndUpdate({ _id: req.params.id }, req.body).exec()
        res.status(200).json(notification);
    }
    catch (err) {
        return next(createError({
            status: 500,
            message: 'Could Not Update Notification'
        }, err));
    }
}

/*_____ EXPORT THE FUNCTION _____*/
export default update_notification;