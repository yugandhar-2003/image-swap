const form = document.getElementById("swapForm");
const thumbnailInput = document.getElementById("thumbnail");
const portraitInput = document.getElementById("portrait");
const instructionsInput = document.getElementById("instructions");
const generateBtn = document.getElementById("generateBtn");
const loader = document.getElementById("loader");
const errorEl = document.getElementById("error");
const resultSection = document.getElementById("resultSection");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");

const thumbnailPreview = document.getElementById("thumbnailPreview");
const portraitPreview = document.getElementById("portraitPreview");
const thumbnailDrop = document.getElementById("thumbnailDrop");
const portraitDrop = document.getElementById("portraitDrop");

function setPreview(input, previewElement) {
  const file = input.files?.[0];
  if (!file) {
    previewElement.hidden = true;
    previewElement.src = "";
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  previewElement.src = objectUrl;
  previewElement.hidden = false;
}

function bindPreview(input, previewElement) {
  input.addEventListener("change", () => setPreview(input, previewElement));
}

function bindDropZone(dropArea, input) {
  ["dragenter", "dragover"].forEach((evt) => {
    dropArea.addEventListener(evt, (e) => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach((evt) => {
    dropArea.addEventListener(evt, (e) => {
      e.preventDefault();
      dropArea.classList.remove("dragover");
    });
  });

  dropArea.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event("change"));
  });
}

function renderHistory(items) {
  historyList.innerHTML = "";

  if (!items?.length) {
    historySection.hidden = true;
    return;
  }

  items.forEach((entry) => {
    const img = document.createElement("img");
    img.src = entry.image;
    img.alt = `Generated on ${new Date(entry.createdAt).toLocaleString()}`;
    img.title = entry.instructions || "No custom instructions";
    historyList.appendChild(img);
  });

  historySection.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const thumbnail = thumbnailInput.files?.[0];
  const portrait = portraitInput.files?.[0];

  if (!thumbnail || !portrait) {
    errorEl.textContent = "Please upload both thumbnail and portrait images.";
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;
  resultSection.hidden = true;
  loader.hidden = false;
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  try {
    const formData = new FormData();
    formData.append("thumbnail", thumbnail);
    formData.append("portrait", portrait);
    formData.append("instructions", instructionsInput.value || "");

    const response = await fetch("/api/swap", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Face swap generation failed.");
    }

    resultImage.src = payload.image;
    downloadBtn.href = payload.image;
    resultSection.hidden = false;
    renderHistory(payload.history || []);
  } catch (error) {
    errorEl.textContent = error.message;
    errorEl.hidden = false;
  } finally {
    loader.hidden = true;
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate";
  }
});

bindPreview(thumbnailInput, thumbnailPreview);
bindPreview(portraitInput, portraitPreview);
bindDropZone(thumbnailDrop, thumbnailInput);
bindDropZone(portraitDrop, portraitInput);
