
document.addEventListener("DOMContentLoaded", function () {

    const fileInput = document.getElementById("fileInput");
    const browseButton = document.getElementById("browseButton");
    const dropZone = document.getElementById("dropZone");
    const previewContainer = document.getElementById("previewContainer");
    const imagePreview = document.getElementById("imagePreview");
    const fileName = document.getElementById("fileName");
    const removeButton = document.getElementById("removeButton");
    const uploadForm = document.getElementById("uploadForm");
    const analyzeButton = document.getElementById("analyzeButton");

    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = [
        "image/jpeg",
        "image/png"
    ];


    // ================= FILE VALIDATION =================

    function validateFile(file) {

        if (!file) {
            return false;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert("Please select a JPG, JPEG or PNG image.");
            return false;
        }

        if (file.size > MAX_SIZE) {
            alert("Image size must be less than 10 MB.");
            return false;
        }

        return true;
    }


    // ================= SHOW PREVIEW =================

    function showPreview(file) {

        if (!validateFile(file)) {
            fileInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            imagePreview.src = event.target.result;

            fileName.textContent = file.name;

            previewContainer.style.display = "block";

            dropZone.style.display = "none";
        };

        reader.readAsDataURL(file);
    }


    // ================= BROWSE =================

    browseButton.addEventListener("click", function (event) {

        event.stopPropagation();

        fileInput.click();
    });


    dropZone.addEventListener("click", function () {

        fileInput.click();
    });


    fileInput.addEventListener("change", function () {

        if (this.files.length > 0) {

            showPreview(this.files[0]);
        }
    });


    // ================= DRAG & DROP =================

    dropZone.addEventListener("dragover", function (event) {

        event.preventDefault();

        dropZone.classList.add("dragover");
    });


    dropZone.addEventListener("dragleave", function () {

        dropZone.classList.remove("dragover");
    });


    dropZone.addEventListener("drop", function (event) {

        event.preventDefault();

        dropZone.classList.remove("dragover");

        const file = event.dataTransfer.files[0];

        if (!file) {
            return;
        }

        if (!validateFile(file)) {
            return;
        }

        try {

            const dataTransfer = new DataTransfer();

            dataTransfer.items.add(file);

            fileInput.files = dataTransfer.files;

        } catch (error) {

            console.log("Could not assign dropped file.");
        }

        showPreview(file);
    });


    // ================= REMOVE IMAGE =================

    removeButton.addEventListener("click", function () {

        fileInput.value = "";

        imagePreview.src = "";

        fileName.textContent = "";

        previewContainer.style.display = "none";

        dropZone.style.display = "block";
    });


    // ================= FORM SUBMIT =================

    uploadForm.addEventListener("submit", function () {

        if (!fileInput.files.length) {

            alert("Please select an MRI image first.");

            return;
        }

        analyzeButton.disabled = true;

        analyzeButton.innerHTML =
            '<span class="loading-spinner"></span> Analyzing MRI...';
    });


    // ================= PROBABILITY ANIMATION =================

    const bars = document.querySelectorAll(".progress-bar");

    bars.forEach(function (bar) {

        const width = bar.getAttribute("data-width");

        bar.style.width = "0%";

        setTimeout(function () {

            bar.style.width = width + "%";

        }, 150);
    });

});
