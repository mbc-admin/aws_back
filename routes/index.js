/* Controllers */
const specialityController = require('../controllers/speciality');
const organizationsController = require('../controllers/organization');
const departmentsController = require('../controllers/department');
const usersController = require('../controllers/user');
const devicesController = require('../controllers/device');
const postsController = require('../controllers/post');
const channelsController = require('../controllers/channel');
const messagesController = require('../controllers/message');
const userChannelController= require('../controllers/userchannel');
const channelResponseRateController = require('../controllers/channelresponserate');
const PostCategoryController = require('../controllers/postcategory');


const verifyToken = require('../middlewares/validate-token');

module.exports = (app, chatIo) => {

   app.get('/api', (req, res) => res.status(200).send ({
        message: 'Example project did not give you access to the api web services',
   }));   


   // Users CRUD
   app.get('/api/users', verifyToken(['admin']), usersController.index);

    // get only coaches
   app.get('/api/coaches', verifyToken(['coach','user','admin','superadmin']), usersController.coaches);

   // get only users
   app.get('/api/users_only', verifyToken(['coach','user','admin','superadmin']), usersController.users_only);



   app.get('/api/users/:id', usersController.show);
   app.post('/api/users', usersController.create);
   app.put('/api/users/:id', usersController.update);
   app.post('/api/users/:id', usersController.destroy);
   app.post('/api/login', usersController.login);
   app.get('/api/my_profile', verifyToken(['coach','user','admin','superadmin']), usersController.my_profile);
   app.get('/api/my_coaches', verifyToken(['user']), usersController.my_coaches);
   app.get('/api/coaches', verifyToken(['user','admin','superadmin']), usersController.coaches);
   app.get('/api/coaches/:id', verifyToken(['user','admin','superadmin']), usersController.coach);
   app.post('/api/add_user_speciality',verifyToken(['admin','superadmin']), usersController.add_user_speciality);
   app.post('/api/delete_user_speciality',verifyToken(['admin','superadmin']), usersController.delete_user_speciality);
   app.post('/api/change_user_password',verifyToken(['coach','user','admin','superadmin']), usersController.change_user_password);
   app.post('/api/check_token',verifyToken(['coach','user','admin','superadmin']), usersController.check_token);
   app.post('/api/update_profile_image',verifyToken(['coach','user','admin','superadmin']), usersController.update_profile_image);
   app.post('/api/logout',verifyToken(['coach','user','admin','superadmin']), usersController.logout);

   // add working hours
   app.post('/api/add_working_hours',verifyToken(['coach','user','admin','superadmin']), usersController.add_working_hours);
   // Get working hours
   app.get('/api/get_working_hours/:user_id',verifyToken(['coach','user','admin','superadmin']), usersController.get_working_hours);
   // Delete working hours
   app.post('/api/delete_working_hours',verifyToken(['coach','user','admin','superadmin']), usersController.delete_working_hours);

   

   // Devices
   app.post('/api/devices', verifyToken(['coach','user','admin','superadmin']), devicesController.create);
   app.put('/api/devices/:id', verifyToken(['coach','user','admin','superadmin']), devicesController.update);


   // Specialities CRUD
   app.get('/api/specialities', specialityController.index);
   app.get('/api/specialities/:id', specialityController.show);
   app.post('/api/specialities', specialityController.create);
   app.put('/api/specialities/:id', specialityController.update);
   app.post('/api/specialities/:id', specialityController.destroy);



   // Organizations CRUD
   app.get('/api/organizations', organizationsController.index);
   app.get('/api/organizations/:id', organizationsController.show);
   app.post('/api/organizations', organizationsController.create);
   app.put('/api/organizations/:id', organizationsController.update);
   app.post('/api/organizations/:id', organizationsController.destroy);


   // Departments CRUD
   app.get('/api/departments', departmentsController.index);
   app.get('/api/departments/:id', departmentsController.show);
   app.post('/api/departments', departmentsController.create);
   app.put('/api/departments/:id', departmentsController.update);
   app.post('/api/departments/:id', departmentsController.destroy);



   // Post categories CRUD
   app.get('/api/post_categories', PostCategoryController.index);
   app.get('/api/post_categories/:id', PostCategoryController.show);
   app.post('/api/post_categories', PostCategoryController.create);
   app.put('/api/post_category/:id', PostCategoryController.update);
   app.post('/api/post_categories/:id', PostCategoryController.destroy);


   // POSTS CRUD
    app.get('/api/posts', postsController.index);
    app.get('/api/posts/:id', postsController.show);
    app.post('/api/posts', postsController.create);
    app.put('/api/posts/:id', postsController.update);
    app.post('/api/posts/:id', postsController.destroy);
    app.post('/api/create_user_post', postsController.create_user_post);
    app.post('/api/delete_user_post', postsController.delete_user_post);
    app.get('/api/get_user_posts',verifyToken(['']), postsController.get_user_posts);

    // CHANNELS CRUD
    app.get('/api/channels/test/:id', verifyToken(['coach','user','admin','superadmin']), channelsController.test);
    app.get('/api/channels', verifyToken(['coach','admin','superadmin']), channelsController.index);
    app.get('/api/channels/:id',verifyToken(['coach','user','admin','superadmin']), channelsController.show);
    app.post('/api/channels',verifyToken(['user','admin','superadmin']), channelsController.create);
    app.post('/api/start_conversation',verifyToken(['user']), channelsController.start_conversation);
    app.get('/api/channels/finalize/:id',verifyToken(['coach','admin','superadmin']), channelsController.finalize_conversation);
    app.put('/api/channels/:id', verifyToken(['admin','superadmin']), channelsController.update);
    app.delete('/api/channels/:id', verifyToken(['admin','superadmin']), channelsController.destroy);

    // MESSAGES CRUD
    app.get('/api/messages', verifyToken(['coach','user','admin','superadmin']), messagesController(chatIo).index);
    app.get('/api/messages/:id', verifyToken(['coach','user','admin','superadmin']), messagesController(chatIo).show);
    app.post('/api/messages', verifyToken(['coach','user','admin','superadmin']), messagesController(chatIo).create);
    app.put('/api/messages/:id', verifyToken(['admin','superadmin']), messagesController(chatIo).update);
    app.delete('/api/messages/:id', verifyToken(['admin','superadmin']), messagesController(chatIo).destroy);

    // CHANNELRATERESPONSE CRUD
//     app.get('/api/channel_response_rate', verifyToken(['']), channelResponseRateController.index);
//     app.get('/api/channel_response_rate/:id', verifyToken(['']), channelResponseRateController.show);
//     app.post('/api/channel_response_rate', verifyToken(['']), channelResponseRateController.create);
//     app.put('/api/channel_response_rate/:id', verifyToken(['']), channelResponseRateController.destroy);
//     app.delete('/api/channel_response_rate/:id', verifyToken(['']), channelResponseRateController.destroy);


    // USERCHANNEL CRUD
//     app.get('/api/user_channel', verifyToken(['']), userChannelController.index);
//     app.get('/api/user_channel/:id', verifyToken(['']), userChannelController.show);
//     app.post('/api/user_channel', verifyToken(['']), userChannelController.create);
//     app.put('/api/user_channel/:id', verifyToken(['']), userChannelController.destroy);
//     app.delete('/api/user_channel/:id', verifyToken(['']), userChannelController.destroy);

};


