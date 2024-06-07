const firebase = require("firebase");

const firebaseConfig = {
    apiKey: "AIzaSyCwiRnfO63ugA_NAvNCtOjfCfwmPlCFMx4",
    authDomain: "test-octoplace.firebaseapp.com",
    projectId: "test-octoplace",
    storageBucket: "test-octoplace.appspot.com",
    messagingSenderId: "1037401068930",
    appId: "1:1037401068930:web:6616bcde609c518bc96b9b",
    measurementId: "G-58BK6WN2T5"
  };
  

  firebase.initializeApp(firebaseConfig); //initialize firebase app 
  module.exports = { firebase }; //export the app