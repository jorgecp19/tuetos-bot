import express, { Request, Response } from "express";
import { Update } from "../../types/update";
import axios from "axios";
import crypto from "crypto";
import { fireDb } from "../../firebase";

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

    const signature = crypto
        .createHmac("sha1", encodeURIComponent(oauthConsumerSecret) + "&")
        .update(signatureBaseStr)
        .digest("base64");

    return signature;
};

const getAuthorizationHeader = (params: { [label: string]: string }) => {
    let authorizationHeaderStr = "OAuth ";

    const keyList = Object.keys(params);
    keyList.forEach((key: string, index: number) => {
        authorizationHeaderStr =
            authorizationHeaderStr +
            encodeURIComponent(key) +
            '="' +
            encodeURIComponent(params[key]) +
            '"';
        if (index !== keyList.length - 1) {
            authorizationHeaderStr = authorizationHeaderStr + ", ";
        }
    });

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

const getOauthToken = (str: string) => {
    const list = str.split("&");
    const oauthToken = list[0].split("=", 2)[1];
    const oauthSecret = list[1].split("=", 2)[1];
    return { oauth_token: oauthToken, oauth_secret: oauthSecret };
};

const insertCredentials = async (
    oauthToken: string,
    oauthTokenSecret: string,
) => {
    await fireDb
        .collection("credentials")
        .doc()
        .set({
            oauth_token: oauthToken,
            oauth_token_secret: oauthTokenSecret,
        });
};

const getCredentials = async () => {
    const querySnapshot = await fireDb
        .collection("credentials")
        .limit(1)
        .get();
    let documentData: any;
    querySnapshot.forEach((doc) => {
        //console.log("AAAAAA")
        //console.log(doc.data())
        documentData = doc.data();
    });
    return documentData;
};

const getUpdate = async (req: Request, res: Response) => {
    console.log("-- telegram update");

    const body: Update = req.body;

    const { message } = body;

    if (message) {
        const { text, chat } = message;
        console.log("    * " + chat.username);
        console.log("    * " + text);

        const botToken = process.env.TELEGRAM_BOT_TOKEN!;
        const telegramApiUrl = process.env.TELEGRAM_API_URL!;
        const twitterApiUrl = process.env.TWITTER_API_URL!;

        if (text === "/login") {
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

            const requestTokenUrl = twitterApiUrl + "oauth/request_token";

            const oauthSignature = getOauthSignature(
                method,
                requestTokenUrl,
                params,
                oauthConsumerSecret,
            );

            const authorization: { [label: string]: string } = {
                oauth_consumer_key: oauthConsumerKey,
                oauth_nonce: oauthNonce,
                oauth_signature: oauthSignature,
                oauth_signature_method: oauthSignatureMethod,
                oauth_timestamp: oauthTimestamp,
                oauth_version: oauthVersion,
            };

            axios({
                method,
                url: requestTokenUrl + "?oauth_callback=" + oauthCallback,
                headers: {
                    Authorization: getAuthorizationHeader(authorization),
                },
            })
                .then(async (response) => {
                    console.log(response.data);
                    const { oauth_token, oauth_secret } = getOauthToken(
                        response.data,
                    );
                    await insertCredentials(oauth_token, oauth_secret);
                    console.log("    * authorizate SUCCESS");
                    const authorizateUrl =
                        twitterApiUrl +
                        "oauth/authenticate?oauth_token=" +
                        oauth_token;
                    axios({
                        method: "post",
                        url:
                            telegramApiUrl +
                            "bot" +
                            botToken +
                            "/sendMessage?chat_id=" +
                            chat.id +
                            "&text=" +
                            encodeURIComponent(authorizateUrl),
                    })
                        .then(() => console.log("    * sendEmail SUCCESS"))
                        .catch((response) => {
                            console.log(response);
                            console.log("    * sendEmail FAIL");
                        });
                })
                .catch((response) => {
                    console.log(response);
                    console.log("    * request_token FAIL");
                });
        } else if (text.split(" ", 2)[0] === "/code") {
            const oauthVerifier = text.split(" ", 2)[1];
            const requestTokenUrl = twitterApiUrl + "oauth/access_token";
            const { oauth_token } = await getCredentials();
            console.log(oauth_token);
            axios({
                method: "post",
                url:
                    requestTokenUrl +
                    "?oauth_token=" +
                    encodeURIComponent(oauth_token) +
                    "&" +
                    "oauth_verifier=" +
                    encodeURIComponent(oauthVerifier),
            })
                .then((response) => {
                    console.log(response.data);
                    console.log("    * access_token SUCCESS");
                    axios({
                        method: "post",
                        url:
                            telegramApiUrl +
                            "bot" +
                            botToken +
                            "/sendMessage?chat_id=" +
                            chat.id +
                            "&text=" +
                            encodeURIComponent("Registro completado :D"),
                    })
                        .then(() => console.log("    * sendEmail SUCCESS"))
                        .catch((response) => {
                            console.log(response);
                            console.log("    * sendEmail FAIL");
                        });
                })
                .catch((response) => {
                    console.log(response);
                    console.log("    * access_token FAIL");
                });
        }
    }

    return res.json();
};

telegramRouter.post("/telegram/get-update", getUpdate);

export default telegramRouter;
