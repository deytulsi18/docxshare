/******  drag and drop for file input *****/

const dropContainer = document.querySelector("#dropContainer");
const input = document.querySelector("#file-upload");

dropContainer.ondragover = dropContainer.ondragenter = function (e) {
    e.preventDefault();
};

dropContainer.ondrop = function (e) {
    e.preventDefault();

    input.files = e.dataTransfer.files;

    if ("createEvent" in document) {
        var e = document.createEvent("HTMLEvents");
        e.initEvent("change", false, true);
        input.dispatchEvent(e);
    }
    else
        input.fireEvent("onchange");
};

/******  select file input *****/

const selectedFile = document.querySelector('#file-upload');
const selectFileDiv = document.querySelector(".file-upload-input-div");
const displayFileName = document.querySelector('#selected-file-name');


selectFileDiv.addEventListener('click', () => {
    selectedFile.click();
})

selectedFile.addEventListener('change', () => {
    if (selectedFile.files.length > 0) {
        displayFileName.innerText = selectedFile.files[0].name;
    }
})