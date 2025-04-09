import { signinValidator, signupValidator } from "../validators/authValidator.js";
import userModal from "../model/user-modal.js";
import { createToken, verifyToken } from "../utils/jwt.js";
// import { myroutes } from "../config/constants.js";
// import { networkInterfaces } from "os";

export async function handleSignupwithEmail(req, res) {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        // validate
        const {error, _} = signupValidator.validate({name, email, password})
        if(error){
            res.status(400).json({error: error})
        }

        // create token
        let token = createToken({email: email})
        if(!token){
            res.status(400).json({message: 'error generating access token'})
        }

        const user = await userModal.findOne({where: {email: email}})
        if(user){
            res.status(400).json({message: 'User Already exists'})
            return;
        }

        // insert user in database
        const newuser = await userModal.create({name: name, email: email, password: password, authToken: token})
        console.log('created new user', newuser);
    
            // send token to user
        res.status(200).json({
            token: token,
        })
    } catch (error) {
        res.status(500).json({message: error})
    }
}

export async function handleSigninEmail(req, res) {
   try {
    const email = req.body.email;
    const password = req.body.password;
    console.log('email: ', email);

        // validation
    const {error, _} = signinValidator.validate({email: email, password: password})

    console.log('error: ', error);
    
    if(error){
        res.status(400).json({error: error.details[0].message})
        return;
    }

    // find email id in database
    const user = await userModal.findOne({
        where : { email: email }
    })

    if(!user){
        res.status(400).json({message:'user not found'})
        return;
    }

    console.log('user found in database: ', user);

    // verifying password
    if(user.password !== password){
        res.status(400).json({message:'invalid password'})
        return;
    }
    
    // create token
    let token = createToken({email: email})
    if(!token){
        res.status(400).json({message: 'error generating access token'})
        return;
    }

    const rowUpdated =  await userModal.update({authToken: token}, {
        where: {
            email: email
        }
    })

    if(rowUpdated < 0){
        res.status(400).json({message: 'failed to update new token on database'})
        return;
    }

        // send token to user
    res.status(200).json({
        token: token,
    })   
   } catch (error) {
        res.status(500).json({message: error})
   }

}

export function handleGoogleRedirect(req, res) {
    // console.log('user in req', req.user.dataValues.authToken);
    res.json({token : req.user.dataValues.authToken})
}

export async function handleLogout(req, res) {
    console.log('header ', req.header('authorization'));
    
    let token = req.header('authorization').toString().split(' ');
    if(token.length != 2)
        res.status(400).json({message: 'invalid authorization token'})

    token = token[1];
    const email = verifyToken(token);
    if(!email.email)
        res.status(400).json({message: 'invalid token'})

    console.log('email: ', email.email);
    

    const deletedrows = await userModal.update({
        authToken: ''
    },{
        where : {
            email: email.email
        }
    })

    if(deletedrows > 0)
        res.send('logout successfull')
}

export async function handlegoogleCallback(access, refresh, profile, done){
    try {
        // check if user already exists
        let user = await userModal.findOne({ where: {googleID : profile.id} })
        console.log('searching user : ', user);

        const newtoken = createToken({email: profile.emails[0].value, token: access})
        if(!newtoken){
            res.status(400).json({message: 'failed to create token'})
            return;
        }
        
        if(!user) {
            // create new user if doesn't exist
            console.log('creating new user');
            // create new token because google one does not contain good data
            
            console.log('new token: ', newtoken);
            user = await userModal.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                dp: profile.photos[0].value,
                authToken: newtoken,
                googleID: profile.id
            })
            
        }else{
            await userModal.update({authToken: newtoken}, {where: {googleID: profile.id}})
            user.authToken = newtoken
        }
        return done(null, user)
    } catch (error) {
        return done(error , null)
    }
}
