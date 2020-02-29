import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";
import authMiddleware from "./middleware/auth";

const app = express();

const apiPort = process.env.API_PORT;

// middlewares
app.use(bodyParser.json());
app.use(authMiddleware);
app.use("/", routes);

// listening
app.listen(apiPort, () => console.log("Listening on port " + apiPort + "!"));
