import express from 'express';
import passport from 'passport';
import authController from '../controllers/auth-controllers.js'
import { myroutes } from '../config/constants.js';
import {  validateSignIn, validateSignUpData } from '../middleware/dataValidation-middleware.js';
import { isAuth } from '../middleware/auth-middleware.js';

const authRouter = express.Router();

// Ping-Pong api
authRouter.get(myroutes.ping, (_,res)=>res.send('ok'))

authRouter.post(myroutes.signup, validateSignUpData ,authController.handleSignupwithEmail)

// sign-in with google 
authRouter.get(myroutes.googleAuth,  passport.authenticate('google', {scope: ['profile', 'email'], session: false}))

// sign-in with email
authRouter.get(myroutes.signinEmail, validateSignIn, authController.handleSigninEmail)
 
// google redirect reciever
authRouter.get(myroutes.googleRedirect, passport.authenticate('google', {session: false}), authController.handleGoogleRedirect)

authRouter.get(myroutes.logout, isAuth, authController.handleLogout)


export default authRouter;
