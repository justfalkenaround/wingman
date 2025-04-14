'use strict';

/*_____ FUNCTION FOR GENERATING A LESS DESCRIPTIVE ERROR _____*/
export const genericError = err => {
    err = err || new Error();
    err._object = err._object || {
        status: 500,
        message: 'Something Went Wrong'
    };
    return err;
};

/*_____ FUNCTION FOR CREATING A DESCRIPTIVE ERROR _____*/
export const createError = (object, err = new Error()) => {
    err._object = object;
    return err;
};

/*_____ EXPORT THE FUNCTIONS AS AN OBJECT _____*/
export default {
    genericError,
    createError
};