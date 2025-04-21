import userModal from "../model/user-modal.js";
import { createToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";
import {logger, logError} from "../utils/winston.js"

class AuthController {
   
    async handleSignupwithEmail(req, res) {
        try {
            const {name, email, password} = req.body;

            // create token
            let token = createToken({email: email, role: 'USER'})
            if(!token){
                return sendError(res, 500, 'Error generating access token');
            }

            const user = await userModal.findOne({where: {email: email}})
            if(user){
                return sendError(res, 400, 'User Already exists');
            }

            // insert user in database
            const newuser = await userModal.create({name: name, email: email, password: password, authToken: token})
            logger.info('created new user', newuser);

            res.cookie("token",token,{httpOnly: true, maxAge: 1000 * 60 * 60});
            logger.warn('cookie has been set')
            

            // send token to user
            return sendSuccess(res, 201, 'User created successfully', { token: token });
        } catch (error) {
            logError({
                error,
                functionName: 'handleSignupwithEmail',
                route: req.originalUrl
            });
            return sendError(res, 500, 'Internal server error during signup', error.message);
        }
    }

    async handleSigninEmail(req, res) {
    try {
        const {email, password} = req.body;

        // find email id in database
        const user = await userModal.findOne({
            where : { email: email ?? null }
        })

        if(!user){
            return sendError(res, 404, 'User not found');
        }

        logger.info('user found in database: ', user);

        // verifying password
        if(user.password !== password){
            return sendError(res, 401, 'Invalid password');
        }

        // create token
        let token = createToken({email: email, role: 'USER'})
        if(!token){
            return sendError(res, 500, 'Error generating access token');
        }

        const rowUpdated =  await userModal.update({authToken: token}, {
            where: {
                email: email
            }
        })

        if(rowUpdated < 0){ // Should likely be rowUpdated === 0 if no rows were updated
            return sendError(res, 500, 'Failed to update token in database');
        }

        res.cookie("token",token,{maxAge:1000 * 60 * 60, httpOnly: true});
        logger.warn('cookie has been set')

        // send token to user
        return sendSuccess(res, 200, 'Signin successful', { token: token });
    } catch (error) {
            logError({
                error,
                functionName: 'handleSigninEmail',
                route: req.originalUrl
            });
            return sendError(res, 500, 'Internal server error during signin', error.message);
    }

    }

    handleGoogleRedirect(req, res) {
        // Assuming req.user contains the necessary data after successful Google auth
        if (req.user && req.user.dataValues && req.user.dataValues.authToken) {
            res.cookie("token",req.user.dataValues.authToken)
            return sendSuccess(res, 200, 'Google authentication successful', { token: req.user.dataValues.authToken });
        } else {
            // Redirect to a failure page or send an error
            // For now, sending an error response
            logError({
                error: new Error("Google Redirect Error: User data or token missing in request"),
                functionName: 'handleGoogleRedirect',
                route: req.originalUrl
            });
            return sendError(res, 401, 'Google authentication failed, user data missing.');
            // Alternatively, redirect: res.redirect('/login-failure');
        }
    }

    async handleLogout(req, res) {
        try {
            const updatedRows = await userModal.update({
                authToken: '' // Set token to null or empty string
            }, {
                where: {
                    email: req.email
                }
            });

            if (updatedRows[0] > 0) { // Sequelize update returns an array [numberOfAffectedRows]
                return sendSuccess(res, 200, 'Logout successful');
            } else {
                // This might happen if the user was already logged out or token didn't match any user
                return sendError(res, 404, 'User not found or already logged out');
            }
        } catch (error) {
            logError({
                error,
                functionName: 'handleLogout',
                route: req.originalUrl
            });
            return sendError(res, 500, 'Internal server error during logout', error.message);
        }
    }

    async handlegoogleCallback(access, refresh, profile, done){
        try {
            // check if user already exists
            let user = await userModal.findOne({ where: { googleID: profile.id } });
            logger.info('searching user : ', user);

            // Ensure email exists
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (!email) {
                logError({
                    error: new Error("Google Profile Error: Email not found in profile"),
                    functionName: 'handlegoogleCallback',
                    route: req.originalUrl
                });
                return done(new Error('Email not found in Google profile'), null);
            }

            const newtoken = createToken({ email: email, accessToken: access, role: 'ADMIN'});
            if (!newtoken) {
                // This is a server error, should not happen if createToken is reliable
                logError({
                    error: new Error("Token Creation Error: Failed to create token for Google user"),
                    functionName: 'createToken',
                    route: req.originalUrl
                });
                return done(new Error('Failed to create authentication token'), null);
            }

            if (!user) {
                // Create new user if doesn't exist
                logger.info('creating new user with google ID:', profile.id);
                user = await userModal.create({
                    name: profile.displayName,
                    email: email,
                    dp: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                    authToken: newtoken,
                    googleID: profile.id
                });
                logger.info('New user created:', user.toJSON());

            } else {
                // Update existing user's token
                logger.info('Updating token for existing user with google ID:', profile.id);
                await userModal.update({ authToken: newtoken }, { where: { googleID: profile.id } });
                // Reload user instance to get updated data if necessary, or just update the token in memory
                user.authToken = newtoken; // Update in-memory object passed to done
                logger.info('User token updated');
            }
            return done(null, user);
        } catch (error) {
            // Passport expects an error object in the first argument of done
            logError({
                error,
                functionName: 'handlegoogleCallback',
                route: req.originalUrl
            });
            return done(error, null);
        }
    }
}

export default new AuthController();

AuthController.prototype.about = () => {console.log('contains authentication related controller functions')}