import express from 'express';
import passport from 'passport';
import {handleGoogleRedirect, handleLogout, handleSigninEmail, handleSignupwithEmail} from '../controllers/auth-controllers.js'
import { myroutes } from '../config/constants.js';
import { validateLogout, validateSignIn, validateSignUpData } from '../middleware/dataValidation-middleware.js';

const authRouter = express.Router();

// Ping-Pong api
authRouter.get(myroutes.ping, (_,res)=>res.send('ok'))

authRouter.post(myroutes.signup, validateSignUpData ,handleSignupwithEmail)

// sign-in with google 
authRouter.get(myroutes.googleAuth,  passport.authenticate('google', {scope: ['profile', 'email'], session: false}))

// sign-in with email
authRouter.get(myroutes.signinEmail, validateSignIn, handleSigninEmail)

// google redirect reciever
authRouter.get(myroutes.googleRedirect, passport.authenticate('google', {session: false}), handleGoogleRedirect)

authRouter.get(myroutes.logout, validateLogout, handleLogout)


export default authRouter;
