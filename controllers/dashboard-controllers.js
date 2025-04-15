import { sendSuccess } from "../utils/response.js";

export function handleDashboard(req, res){
    return sendSuccess(res, 200, 'Welcome to the dashboard');
}
