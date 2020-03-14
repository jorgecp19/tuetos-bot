import firebase from "firebase";

var firebaseConfig = {
    apiKey: "AIzaSyBOMMy6vh6QUNnuXn5VtmqEGoqoT9pWQjU",
    authDomain: "tuetosbot-ae803.firebaseapp.com",
    databaseURL: "https://tuetosbot-ae803.firebaseio.com",
    projectId: "tuetosbot-ae803",
    storageBucket: "tuetosbot-ae803.appspot.com",
    messagingSenderId: "744051169965",
    appId: "1:744051169965:web:49f34f995c91cc856a4424",
};
// Initialize Firebase
var app = firebase.initializeApp(firebaseConfig);
export var fireDb = firebase.firestore(app);
