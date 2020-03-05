import express, { Request, Response } from "express";
import { Update } from "../../types/update";
import axios from "axios";
import crypto from "crypto";

const telegramRouter = express.Router();

const getOauthSignature = (
    method: string,
    url: string,
    params: { [label: string]: string },
    oauthConsumerSecret: string,
) => {
    const keyList = Object.keys(params);
    const keyListEncoded = keyList
        .map((value) => encodeURIComponent(value))
        .sort();

    let paramsString: string = "";
    keyListEncoded.forEach((key: string, index: number) => {
        paramsString =
            paramsString + key + "=" + encodeURIComponent(params[key]);
        if (index !== keyListEncoded.length - 1) {
            paramsString = paramsString + "&";
        }
    });

    const signatureBaseStr =
        method.toUpperCase() +
        "&" +
        encodeURIComponent(url) +
        "&" +
        encodeURIComponent(paramsString);

    console.log(signatureBaseStr);
    //console.log(oauthConsumerSecret);

    const signature = crypto
        .createHmac("sha1", encodeURIComponent(oauthConsumerSecret) + "&")
        .update(signatureBaseStr)
        .digest("base64");

    console.log(signature);
    return signature;
};

const getAuthorizationHeader = (
    oauthConsumerKey: string,
    oauthNonce: string,
    oauthSignatureMethod: string,
    oauthTimestamp: string,
    oauthVersion: string,
    oauthSignature: string,
) => {
    const authorizationHeaderStr: string = `Oauth oauth_consumer_key=${oauthConsumerKey},oauth_nonce=${oauthNonce},oauth_signature_method=${oauthSignatureMethod},oauth_signature=${oauthSignature},oauth_timestamp=${oauthTimestamp},oauth_version=${oauthVersion}`;

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
                .TWITTER_OAUTH_CONSUMER_SECRET!;
            const oauthCallback = "oob";
            const oauthConsumerKey = process.env.TWITTER_OAUTH_CONSUMER_KEY!;
            const oauthTimestamp = getOauthTimestamp().toString();
            const oauthNonce = getOauthNonce(oauthTimestamp);
            const oauthSignatureMethod = "HMAC-SHA1";
            const oauthVersion = "1.0";

            const params: { [label: string]: string } = {
                oauth_callback: oauthCallback,
                oauth_consumer_key: oauthConsumerKey,
                oauth_nonce: oauthNonce,
                oauth_signature_method: oauthSignatureMethod,
                oauth_timestamp: oauthTimestamp,
                oauth_version: oauthVersion,
            };

            const method = "post";

            const url = twitterApiUrl + "oauth/request_token";

            const oauthSignature = getOauthSignature(
                method,
                url,
                params,
                oauthConsumerSecret,
            );

            console.log(
                getAuthorizationHeader(
                    oauthConsumerKey,
                    oauthNonce,
                    oauthSignatureMethod,
                    oauthTimestamp,
                    oauthVersion,
                    oauthSignature,
                ),
            );

            axios({
                method,
                url: url + "?oauth_callback=" + oauthCallback,
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
                responseType: "json",
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
                    })
                        .then((response) =>
                            //response.data.pipe(fs.createWriteStream("ada_lovelace.jpg"));
                            console.log("    * respuesta enviada"),
                        )
                        .catch((response) => {
                            console.log(response);
                            console.log("falló telegram");
                        });
                })
                .catch((response) => {
                    console.log(response);
                    console.log("falló twitter");
                });
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
