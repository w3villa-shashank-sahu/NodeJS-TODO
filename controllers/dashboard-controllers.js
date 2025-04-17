import { sendSuccess } from "../utils/response.js";

export function handleDashboard(req, res){
    // console.log(req.cookies.token);
    return sendSuccess(res, 200, 'Welcome to the dashboard', {fromCookie: req.cookies.token});
}
