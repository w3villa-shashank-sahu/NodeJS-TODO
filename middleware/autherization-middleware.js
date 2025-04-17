import { sendError } from "../utils/response.js";

const AllowRole = (allowedUsers) => (req, res, next) =>  {
    if(!allowedUsers.includes(req.role)){
        sendError(res, 401, 'Not authorized', {message: req.role + ' are not authorized to visit this route'})
        return;
    }

    next()
}

export default AllowRole;