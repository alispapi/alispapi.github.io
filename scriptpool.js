// Render API Adresin
const API_BASE_URL = "https://api-2-iq17.onrender.com/api/ftp";

const filesContainer = document.getElementById('filesContainer');
const emptyState = document.getElementById('emptyState');
const totalFilesEl = document.getElementById('totalFiles');
const totalSizeEl = document.getElementById('totalSize');

// Sayfa yüklenince çalış
document.addEventListener('DOMContentLoaded', () => {
    console.log("Yeni script v2 çalıştı! API'ye gidiliyor..."); // Konsolda bunu göreceğiz
    fetchFiles();
});

async function fetchFiles() {
    filesContainer.innerHTML = '<p style="text-align:center; padding:20px;">Dosyalar yükleniyor...</p>';

    try {
        // API'den gerçek listeyi çek
        const response = await fetch(`${API_BASE_URL}/list`);
        
        if (!response.ok) throw new Error('Liste alınamadı');
        
        const fileNames = await response.json();
        console.log("API'den gelen dosyalar:", fileNames); // Konsola yazdır
        
        displayFiles(fileNames);
        
    } catch (error) {
        console.error(error);
        filesContainer.innerHTML = <p style="color:red; text-align:center">Hata: ${error.message}</p>;
    }
}

function displayFiles(fileNames) {
    filesContainer.innerHTML = '';
    
    // İstatistikleri güncelle
    if(totalFilesEl) totalFilesEl.textContent = fileNames.length;
    if(totalSizeEl) totalSizeEl.textContent = "-";

    // Liste boşsa
    if (!fileNames || fileNames.length === 0) {
        if(emptyState) emptyState.classList.add('show');
        filesContainer.style.display = 'none';
        return;
    }
    
    // Liste doluysa
    if(emptyState) emptyState.classList.remove('show');
    filesContainer.style.display = 'grid';
    
    fileNames.forEach(name => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        let icon = '📄';
        if (name.match(/\.(jpg|png|gif)$/i)) icon = '🖼';
        else if (name.match(/\.(mp4|mov)$/i)) icon = '🎥';
        
        fileCard.innerHTML = `
            <div class="file-card-header">
                <div class="file-type-icon">${icon}</div>
                <div class="file-card-info">
                    <h3 title="${name}">${name}</h3>
                    <div class="file-card-meta"><span>DriveHQ Dosyası</span></div>
                </div>
            </div>
            <div class="file-card-actions">
                <button class="btn-action btn-download" onclick="downloadFile('${name}')">⬇ İndir</button>
            </div>
        `;
        filesContainer.appendChild(fileCard);
    });
}

window.downloadFile = function(fileName) {
    const downloadUrl = `${API_BASE_URL}/download?fileName=${encodeURIComponent(fileName)}`;
    window.location.href = downloadUrl;
}