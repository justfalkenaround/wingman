'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import create from './create.js';
import create_token from './create_token.js';
import read from './read.js';
import read_potentials from './read_potentials.js';
import read_count from './read_count.js';
import read_chat from './read_chat.js';
import read_next_photo from './read_next_photo.js';
import read_matches from './read_matches.js';
import update_match from './update_match.js';
import create_match from './create_match.js';
import upsert_model from './upsert_model.js';
import read_model_metrics from './read_model_metrics.js';
import read_model from './read_model.js';
import delete_chat from './delete_chat.js';
import post_on_chat from './post_on_chat.js';
import push_metric from './push_metric.js';
import delete_profile from './delete_profile.js';
import delete_notification from './delete_notification.js';
import update_notification from './update_notification.js';
import all_seen_notification from './all_seen_notification.js';
import clear_all_notification from './clear_all_notification.js';
import push_notification from './push_notification.js';
import push_training_data from './push_training_data.js';
import skip_training_data from './skip_training_data.js';
import update_training_data from './update_training_data.js';
import read_training_sets from './read_training_sets.js';
import update from './update.js';
import update_images from './update_images.js';

/*_____ AN INDEX OF ALL PROFILE CONTROLLERS FOR MODULARIZATION GUTTED _____*/

/*_____ EXPORT THE PROFILE CONTROLLER _____*/
export default {
    push_metric,
    push_training_data,
    skip_training_data,
    update_training_data,
    read_training_sets,
    upsert_model,
    read_model,
    read_model_metrics,
    read_next_photo,
    update_match,
    create_match,
    delete_chat,
    post_on_chat,
    create,
    create_token,
    read,
    read_potentials,
    read_count,
    read_chat,
    read_matches,
    delete_profile,
    delete_notification,
    update_notification,
    all_seen_notification,
    clear_all_notification,
    push_notification,
    update,
    update_images
};