import express, { Request, Response } from "express";
import { Update } from "../../types/update";
import axios from "axios";
import crypto from "crypto";

const telegramRouter = express.Router();

const getOauthSignature = (
    method: string,
    url: string,
    oauthCallback: string,
    oauthConsumerKey: string,
    oauthNonce: string,
    oauthSignatureMethod: string,
    oauthTimestamp: string,
    oauthVersion: string,
    oauthConsumerSecret: string,
) => {
    const paramsStr: string = `${method}&\
        oauth_callback=${oauthCallback}&\
        oauth_consumer_key=${oauthConsumerKey}&\
        oauth_nonce=${oauthNonce}&\
        oauth_signature_method=${oauthSignatureMethod}&\
        oauth_timestamp=${oauthTimestamp}&\
        oauth_version=${oauthVersion}`;

    return paramsStr;
    /*
    let paramsString: string = "";
    const keyList = Object.keys(params);
    keyList.forEach((key: string, index: number) => {
        paramsString = paramsString + key + "=" + params[key];
        if (index !== keyList.length - 1) {
            paramsString = paramsString + "&";
        }
    });
    console.log(paramsString);
    return paramsString;
    */
};

const getAuthorizationHeader = (
    oauthConsumerKey: string,
    oauthNonce: string,
    oauthSignatureMethod: string,
    oauthTimestamp: string,
    oauthVersion: string,
    oauthSignature: string,
) => {
    const authorizationHeaderStr: string = `Oauth oauth_consumer_key=${oauthConsumerKey},\
        oauth_nonce=${oauthNonce},\
        oauth_signature_method=${oauthSignatureMethod},\
        oauth_signature=${oauthSignature},\
        oauth_timestamp=${oauthTimestamp},\
        oauth_version=${oauthVersion}`;

    return authorizationHeaderStr;
};

const getOauthTimestamp = () => {
    return Math.round(new Date().getTime() / 1000.0);
};

const getOauthNonce = (oauthTimestamp: string) => {
    return crypto
        .createHash("sha1")
        .update(oauthTimestamp)
        .digest("hex");
};

const getUpdate = async (req: Request, res: Response) => {
    console.log("-- telegram update");

    const body: Update = req.body;

    const { message } = body;

    if (message) {
        const { text, chat } = message;
        console.log("    * " + chat.username);
        console.log("    * " + text);

        if (text === "/login") {
            const botToken = process.env.TELEGRAM_BOT_TOKEN!;
            const telegramApiUrl = process.env.TELEGRAM_API_URL!;
            const twitterApiUrl = process.env.TWITTER_API_URL!;

            const oauthConsumerSecret = process.env
                .TELEGRAM_OAUTH_CONSUMER_SECRET!;
            const oauthCallback = "oob";
            const oauthConsumerKey = process.env.TELEGRAM_OAUTH_CONSUMER_KEY!;
            const oauthTimestamp = getOauthTimestamp().toString();
            const oauthNonce = getOauthNonce(oauthTimestamp);
            const oauthSignatureMethod = "HMAC-SHA1";
            const oauthVersion = "1.0";

            /*const params: { [label: string]: string } = {
                oauth_callback: "oob",
                oauth_consumer_key: process.env.TELEGRAM_OAUTH_CONSUMER_KEY!,
                oauth_nonce: getOauthNonce(oauthTimestamp),
                oauth_signature_method: "HMAC-SHA1",
                oauth_timestamp: oauthTimestamp,
                oauth_version: "1.0",
            };*/

            const method = "post";

            const url =
                twitterApiUrl +
                "oauth/request_token?oauth_callback=" +
                oauthCallback;

            const oauthSignature = getOauthSignature(
                method,
                url,
                oauthCallback,
                oauthConsumerKey,
                oauthNonce,
                oauthSignatureMethod,
                oauthTimestamp,
                oauthVersion,
                oauthConsumerSecret,
            );

            axios({
                method,
                url,
                headers: {
                    Authorization: getAuthorizationHeader(
                        oauthConsumerKey,
                        oauthNonce,
                        oauthSignatureMethod,
                        oauthTimestamp,
                        oauthVersion,
                        oauthSignature,
                    ),
                },
            })
                .then((response) => {
                    axios({
                        method: "post",
                        url:
                            telegramApiUrl +
                            "bot" +
                            botToken +
                            "/sendMessage?chat_id=" +
                            chat.id +
                            "&text=" +
                            response,
                    }).then((response) =>
                        //response.data.pipe(fs.createWriteStream("ada_lovelace.jpg"));
                        console.log("    * respuesta enviada"),
                    );
                })
                .catch((response) => console.log(response));
        }
    }

    return res.json();
};

telegramRouter.post("/telegram/get-update", getUpdate);

export default telegramRouter;

/*
    headers: {
        'Authorization': 'Basic Y2xpZW50OnNlY3JldA==',
        'Content-Type': 'application/x-www-form-urlencoded'
    }

*/
