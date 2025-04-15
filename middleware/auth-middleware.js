import userModal from "../model/user-modal.js";
import { verifyToken } from "../utils/jwt.js";
import {logger} from "../utils/winston.js"

export async function isAuth(req, res, next) {
    let token = req.header('authorization')
    if(!token) {
        res.status(400).send('No token found')
        return;
    }
    token = token.toString().split(' ')
    if(token.length != 2){
        res.status(400).send('Invalid token')
        return;
    }
    token = token[1];
    const {email} = verifyToken(token);
    if(!email){
        res.status(400).send('Invalid token')
        return;
    }

    const user = await userModal.findOne({where: {email : email.email}});
    if(!user){
        res.status(400).send('Invalid token')
        return;
    }
    logger.info('user :', user);
    

    if(user.dataValues.authToken.length == 0){
        res.status(400).send('User not Authenticated, Signin Again');
        return;
    }

    next();
}