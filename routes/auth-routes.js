import express from 'express';
import passport from 'passport';
import {handleGoogleRedirect, handleLogout, handleSigninEmail, handleSignupwithEmail} from '../controllers/auth-controllers.js'
import { myroutes } from '../config/constants.js';

const authRouter = express.Router();

// Ping-Pong api
authRouter.get(myroutes.ping, (_,res)=>res.send('ok'))

// sign-up
authRouter.post(myroutes.signup, handleSignupwithEmail)

// sign-in with google 
authRouter.get(myroutes.googleAuth,  passport.authenticate('google', {scope: ['profile', 'email'], session: false}))

// sign-in with email
authRouter.get(myroutes.signinEmail, handleSigninEmail)

// google redirect reciever
authRouter.get(myroutes.googleRedirect, passport.authenticate('google', {session: false}), handleGoogleRedirect)

authRouter.get(myroutes.logout, handleLogout)


export default authRouter;
