import express, { Request, Response } from "express";
import { Update } from "../../types/update";

const botRouter = express.Router();

const webhook = async (req: Request, res: Response) => {
    console.log("-- BOT");

    const body: Update = req.body;

    console.log("    * " + body.message?.chat.username);
    console.log("    * " + body.message?.text);

    return res.json();
};

botRouter.post("/bot", webhook);

export default botRouter;
