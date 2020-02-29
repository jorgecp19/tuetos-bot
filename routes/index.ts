import express from "express";

import botRouter from "./bot";

const routes = express.Router();

// Controller
routes.use("/", botRouter);

export default routes;
