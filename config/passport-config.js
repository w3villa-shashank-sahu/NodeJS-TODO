import passport from "passport";
import googleStrategy from 'passport-google-oauth20';
import { passportConfig } from "./appConfig.js";
import { handlegoogleCallback } from "../controllers/auth-controllers.js";
import userModal from "../model/user-modal.js";

passport.use(new googleStrategy({
    clientID: passportConfig.googleClientID,
    clientSecret: passportConfig.googleSecret,
    callbackURL: passportConfig.googleRedirectUrl,
}, handlegoogleCallback))

// passport.serializeUser((user, done)=>{
//     done(null, user.id)
// })

// passport.deserializeUser( async (id, done) => {
//     try{
//         const user = await userModal.findByPk(id);
//         done(null, user)
//     }catch(error){
//         done(error, null)
//     }
// })