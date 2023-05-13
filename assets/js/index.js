/******  drag and drop for file input *****/

const dropContainer = document.querySelector("#dropContainer");
const input = document.querySelector("#file-upload");

dropContainer.ondragover = dropContainer.ondragenter = (e) => {
  e.preventDefault();
};

dropContainer.ondrop = (e) => {
  e.preventDefault();

  input.files = e.dataTransfer.files;

  if ("createEvent" in document) {
    var e = document.createEvent("HTMLEvents");
    e.initEvent("change", false, true);
    input.dispatchEvent(e);
  } else input.fireEvent("onchange");
};

/******  select file input *****/

const selectedFile = document.querySelector("#file-upload");
const selectFileDiv = document.querySelector(".file-upload-input-div");
const displayFileName = document.querySelector("#selected-file-name");

selectFileDiv.addEventListener("click", () => {
  selectedFile.click();
});

selectedFile.addEventListener("change", () => {
  if (selectedFile.files.length > 0) {
    displayFileName.innerText = selectedFile.files[0].name;

    const isBoldText = displayFileName.classList.contains("bold-text");

    if (!isBoldText) {
      displayFileName.classList.add("bold-text");
    }
  }
});

/****** Sweet Alert Toast *****/

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  showCloseButton: true,
});

/******  functions for file upload *****/

const uploadBtn = document.querySelector("#upload");
const downloadBtn = document.querySelector("#download");
const fileIdDiv = document.querySelector(".file-id-div");
const fileIdText = document.querySelector("#file-id-text");
const loadingDiv = document.querySelector(".loading-div");

let msgRef = firebase.database().ref("docs");

uploadBtn.addEventListener("click", () => {
  uploadFile();
});
downloadBtn.addEventListener("click", () => {
  downloadFile();
  Toast.fire({
    icon: "info",
    title: "LOADING \nPlease wait...",
  });
});

let saveMsg = (fileUrl) => {
  let newMsgRef = msgRef.push();
  let fileId = getUniqueId();

  console.log("File Id : ", fileId);

  newMsgRef.set({
    url: fileUrl,
    number: fileId,
  });

  fileIdText.innerHTML = fileId;
};

let getUniqueId = () => {
  // let randNumb = Math.floor(100000 + Math.random() * 900000);

  alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  nanoid = customAlphabet(alphabet, 6);

  const number = nanoid();

  let generatedId = number.toString();

  let ref = firebase.database().ref("docs");
  ref.on("value", (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      let childData = childSnapshot.val();
      if (childData.number == number) {
        getUniqueId();
      }
    });
  });

  return generatedId;
};

let uploadFile = () => {
  if (selectedFile.files.length == 0 || selectedFile.files[0] == undefined) {
    // console.log("no file selected");
    Swal.fire({
      icon: "info",
      confirmButtonColor: "#004c8a",
      confirmButtonText: "OK",
      title: "No file selected!",
      text: "You need to select a file before upload.",
    });
  } else if (selectedFile.files[0].size > 100000000) {
    Swal.fire({
      icon: "warning",
      confirmButtonColor: "#004c8a",
      confirmButtonText: "OK",
      title: "File size limit exceeded!",
      text: "File size limit is 100mb. Select a file less than 100mb.",
    });
    selectedFile.value = "";
    displayFileName.innerText = "no file selected";
  } else {
    const file = selectedFile.files[0];

    let storageRefernce = firebase.storage().ref("docs/" + file.name);
    let uploadStatus = storageRefernce.put(file);

    uploadStatus.on(
      "state_changed",
      (snapshot) => {
        // console.log(snapshot)
        loadingDiv.style.display = "block";
        uploadBtn.style.display = "none";

        let progressStatus = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(2);

        document.querySelector("#upload-progress").innerHTML = progressStatus;
      },
      (error) => {
        console.log("Error : ", error.message);

        Swal.fire({
          icon: "info",
          confirmButtonColor: "#004c8a",
          confirmButtonText: "OK",
          title: "Something went wrong.!",
          text: `File upload failed. ${error.message}`,
        });
      },
      () => {
        uploadStatus.snapshot.ref.getDownloadURL().then((fileUrl) => {
          // console.log('file : ', fileUrl);
          saveMsg(fileUrl);
          fileIdDiv.style.display = "block";
          loadingDiv.style.display = "none";
          uploadBtn.style.display = "block";

          Swal.fire({
            icon: "success",
            confirmButtonText: "OK",
            title: "File uploaded!",
            text: "Your file is uploaded successfully.",
            confirmButtonAriaLabel: "Thumbs up, OK!",
            confirmButtonColor: "#3bb300",
          }).then(() => {
            selectedFile.value = "";
            displayFileName.innerText = "no file selected";
          });
        });
      }
    );
  }
};

let downloadFile = () => {
  const fileId = document.querySelector("#file-id");

  if (fileId.value == "") {
    Swal.fire({
      icon: "info",
      confirmButtonColor: "#004c8a",
      confirmButtonText: "OK",
      title: "Enter file ID!",
      text: "You need to enter file ID before download.",
    });
  } else {
    const fileUniqueId = fileId.value;

    let ref = firebase.database().ref("docs");
    let fileFound = false;

    ref.on("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        let childData = childSnapshot.val();
        if (childData.number == fileUniqueId) {
          fileFound = true;
          window.open(childData.url, "_blank");

          // console.log('file deleted from database')
          setTimeout(() => {
            let storageRef = firebase.storage().refFromURL(childData.url);
            storageRef
              .delete()
              .then(() => {
                ref.child(childSnapshot.key).remove();
              })
              .catch((error) => {
                console.log(error);
              });
            // console.log('file deleted from storage')
          }, 1250);
        }
      });
    });

    setTimeout(() => {
      if (!fileFound) {
        Swal.fire({
          icon: "question",
          confirmButtonColor: "#004c8a",
          confirmButtonText: "OK",
          title: "File not found!",
          text: "Your requested file does not exist.",
        });
      }
    }, 1500);
  }
};
