import express from "express";
import { myroutes } from "../config/constants.js";
import { handleDashboard } from "../controllers/dashboard-controllers.js";
import { isAuth } from "../middleware/auth-middleware.js";

const dashboardRoutes = express.Router();

dashboardRoutes.get(myroutes.ping, (_, res)=>res.send('ok'))

dashboardRoutes.get(myroutes.dashboard, isAuth, handleDashboard)


export default dashboardRoutes;