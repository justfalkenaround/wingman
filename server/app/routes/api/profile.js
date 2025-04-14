'use strict';

/*_____ IMPORT DEPENDENCIES FIRST _____*/
import express from 'express';
import profile_controller from '../../controllers/profile/index.js';
import { verify_token } from '../../helpers/verify_token.js';

/*_____ CREATE ROUTER INSTANCE _____*/
const index = new express.Router();

/*_____ DEFAULT MESSAGE _____*/
index.get('/', (req, res, next) => res.json({ message: 'Welcome to the profile API.' }));

/*_____ CREATE A PROFILE _____*/
index.post('/signup', profile_controller.create);

/*_____ SIGN IN _____*/
index.post('/signin', profile_controller.create_token);

/*_____ GET CURRENT PROFILE _____*/
index.get('/currentprofile', verify_token, profile_controller.read);

/*_____ GET POTENTIAL MATCHES _____*/
index.get('/potentials/:minage/:maxage/:maxdist', verify_token, profile_controller.read_potentials);

/*_____ GET METRICS FOR POTENTIAL MATCHES _____*/
index.get('/count/:minage/:maxage/:maxdist', verify_token, profile_controller.read_count);

/*_____ GET MATCHES _____*/
index.get('/matches', verify_token, profile_controller.read_matches);

/*_____ GET CHAT DATA _____*/
index.get('/chat/:id', verify_token, profile_controller.read_chat);

/*_____ PUT CHAT DATA _____*/
index.put('/chat/:id', verify_token, profile_controller.post_on_chat);

/*_____ DELETE CHAT _____*/
index.delete('/chat/:id', verify_token, profile_controller.delete_chat);

/*_____ CREATE MATCH _____*/
index.post('/match/:id', verify_token, profile_controller.create_match);

/*_____ UPDATE MATCH _____*/
index.put('/match/:id/:disposition', verify_token, profile_controller.update_match);

/*_____ PUSH AN IMAGE TO DATASET _____*/
index.post('/pushtrainingdata', verify_token, profile_controller.push_training_data);

/*_____ SKIP AN IMAGE DATA _____*/
index.post('/skiptrainingdata/:id', verify_token, profile_controller.skip_training_data);

/*_____ CONVERGE DATASETS AND PUSH METRICS _____*/
index.put('/updatetrainingdata', verify_token, profile_controller.update_training_data);

/*_____ DELETE PROFILE _____*/
index.delete('/deleteprofile', verify_token, profile_controller.delete_profile);

/*_____ CREATE NOTIFICATION _____*/
index.post('/notification', verify_token, profile_controller.push_notification);

/*_____ MARK ALL AS SEEN NOTIFICATION _____*/
index.put('/notification/allseen', verify_token, profile_controller.all_seen_notification);

/*_____ CLEAR ALL NOTIFICATION _____*/
index.put('/notification/clearall', verify_token, profile_controller.clear_all_notification);

/*_____ UPDATE NOTIFICATION _____*/
index.put('/notification/:id', verify_token, profile_controller.update_notification);

/*_____ DELETE NOTIFICATION _____*/
index.delete('/notification/:id', verify_token, profile_controller.delete_notification);

/*_____ UPDATE PROFILE _____*/
index.put('/updateprofile', verify_token, profile_controller.update);

/*_____ UPDATE PROFILE IMAGES _____*/
index.put('/updateprofileimages', verify_token, profile_controller.update_images);

/*_____ READ MATCHES _____*/
index.get('/readmatches', verify_token, profile_controller.read_matches);

/*_____ SAVE ML MODEL _____*/
index.put('/savemodel', verify_token, profile_controller.upsert_model);

/*_____ PUSH ML METRIC _____*/
index.put('/pushmetric', verify_token, profile_controller.push_metric);

/*_____ READ ML METRIC _____*/
index.get('/readmetrics', verify_token, profile_controller.read_model_metrics);

/*_____ READ ML MODEL _____*/
index.get('/readmodel/:userid/:filename', verify_token, profile_controller.read_model);

/*_____ READ TRAINING IMAGE _____*/
index.get('/nextphoto', verify_token, profile_controller.read_next_photo);

/*_____ READ TRAINING DATA _____*/
index.get('/readtrainingsets', verify_token, profile_controller.read_training_sets);

/*_____ EXPORT THE OBJECT _____*/
export default index;