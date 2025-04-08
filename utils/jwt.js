import jsonwebtoken from 'jsonwebtoken';
import { appConfig } from '../config/appConfig.js';


export function createToken(payload){
    try{
        return jsonwebtoken.sign(payload, appConfig.jwtSecret)
    }catch(e){
        console.log('error while creating JWT token ', e);
        return null;        
    }
}

export function verifyToken(token) {
    try{
       return jsonwebtoken.verify(token, appConfig.jwtSecret)
    }catch(e){
        console.log('error while parsing the token ', e);
        return null
    }
}