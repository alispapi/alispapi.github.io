// ==============================
// FileBridge - Dosya Yükleme JS
// ==============================

const API_BASE_URL = "https://api-2-iq17.onrender.com/api/Ftp";

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusText = document.getElementById('statusText');
const typeSelect = document.getElementById('typeSelect');   // varsa
const pathInput = document.getElementById('pathInput');     // varsa

if (uploadBtn) {
    uploadBtn.addEventListener('click', handleUpload);
}

async function handleUpload() {
    if (!fileInput || fileInput.files.length === 0) {
        showStatus("Lütfen bir dosya seçin.", true);
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("File", file);

    // Eğer backend'de FileUploadModel.TargetPath varsa
    const targetPath = (pathInput && pathInput.value) ? pathInput.value : "/";
    formData.append("TargetPath", targetPath);

    try {
        showStatus("Yükleniyor...", false);

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            body: formData
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(`API Hatası: ${response.status} - ${text}`);
        }

        showStatus("Dosya başarıyla yüklendi.", false);
    } catch (err) {
        console.error("Upload hatası:", err);
        showStatus(`Yükleme hatası: ${err.message}`, true);
    }
}

function showStatus(message, isError) {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.style.color = isError ? "red" : "green";
}