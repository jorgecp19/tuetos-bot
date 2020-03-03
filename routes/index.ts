import express from "express";

import telegramRouter from "./telegram";

const routes = express.Router();

// Controller
routes.use("/", telegramRouter);

export default routes;
