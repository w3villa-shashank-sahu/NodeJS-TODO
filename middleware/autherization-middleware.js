import { sendError } from "../utils/response.js";
import { verifyToken } from "../utils/jwt.js";

const AllowRole = (allowedUsers) => (req, res, next) =>  {
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
    const {email, role} = verifyToken(token);
    if(!email){
        res.status(400).send('Invalid token')
        return;
    }
    if(!allowedUsers.includes(role)){
        sendError(res, 401, 'Not authorized', {message: role + ' are not authorized to visit this route'})
        return;
    }

    next()
}

export default AllowRole;