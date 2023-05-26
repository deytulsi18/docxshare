firebase.initializeApp(firebaseConfig);

firebase
  .auth()
  .signInAnonymously()
  .then(() => {
    console.log("Logged in as Anonymous!");
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode);
    console.log(errorMessage);
  });
