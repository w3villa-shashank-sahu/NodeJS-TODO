import passport from "passport";
import googleStrategy from 'passport-google-oauth20';
import { passportConfig } from "./appConfig.js";
import authController  from "../controllers/auth-controllers.js";

passport.use(new googleStrategy({
    clientID: passportConfig.googleClientID,
    clientSecret: passportConfig.googleSecret,
    callbackURL: passportConfig.googleRedirectUrl,
}, authController.handlegoogleCallback))
 