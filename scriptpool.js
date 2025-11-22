const API_BASE_URL = "https://api-2-iq17.onrender.com/api/ftp";

const filesContainer = document.getElementById('filesContainer');
const emptyState = document.getElementById('emptyState');
const totalFilesEl = document.getElementById('totalFiles');
const totalSizeEl = document.getElementById('totalSize'); // Toplam boyut (şimdilik gizleyebiliriz veya 0 yaparız)

// Sayfa yüklenince dosyaları çek
document.addEventListener('DOMContentLoaded', () => {
    fetchFiles();
});

async function fetchFiles() {
    // Yükleniyor... mesajı gösterelim
    filesContainer.innerHTML = '<p style="text-align:center; padding:20px;">Dosyalar yükleniyor...</p>';

    try {
        // 1. API'den listeyi iste
        const response = await fetch(`https://api-2-iq17.onrender.com/api/ftp/list`);
        
        if (!response.ok) {
            throw new Error('Liste alınamadı: ' + response.statusText);
        }
        
        // 2. Gelen listeyi JSON'a çevir
        const fileNames = await response.json();
        
        // 3. Ekrana bas
        displayFiles(fileNames);
        
    } catch (error) {
        console.error(error);
        filesContainer.innerHTML = `
            <div style="text-align:center; color:red; padding:20px;">
                <h3>⚠ Bağlantı Hatası</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" style="margin-top:10px; padding:5px 10px;">Tekrar Dene</button>
            </div>`;
    }
}

function displayFiles(fileNames) {
    filesContainer.innerHTML = '';
    
    // İstatistik güncelle
    if (totalFilesEl) totalFilesEl.textContent = fileNames.length;
    if (totalSizeEl) totalSizeEl.textContent = "-"; // FTP'den boyut çekmek ekstra işlem gerektirir, şimdilik boş verelim.

    // Eğer hiç dosya yoksa boş durumu göster
    if (!fileNames || fileNames.length === 0) {
        if (emptyState) emptyState.classList.add('show');
        filesContainer.style.display = 'none';
        return;
    }
    
    // Varsa listeyi göster
    if (emptyState) emptyState.classList.remove('show');
    filesContainer.style.display = 'grid';
    
    // Her dosya için bir kart oluştur
    fileNames.forEach(name => {
        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        // Dosya uzantısına göre basit ikon seçimi
        let icon = '📄';
        if (name.match(/\.(jpg|jpeg|png|gif)$/i)) icon = '🖼';
        else if (name.match(/\.(mp4|mov)$/i)) icon = '🎥';
        else if (name.match(/\.(zip|rar)$/i)) icon = '📦';
        
        fileCard.innerHTML = `
            <div class="file-card-header">
                <div class="file-type-icon">${icon}</div>
                <div class="file-card-info">
                    <h3 title="${name}">${name}</h3>
                    <div class="file-card-meta">
                        <span>FTP Dosyası</span>
                    </div>
                </div>
            </div>
            <div class="file-card-actions">
                <button class="btn-action btn-download" onclick="downloadFile('${name}')">
                    ⬇ İndir
                </button>
            </div>
        `;
        
        filesContainer.appendChild(fileCard);
    });
}

// İNDİRME FONKSİYONU
window.downloadFile = function(fileName) {
    // Direkt tarayıcıyı indirme linkine yönlendir
    // Bu sayede API dosyayı stream eder ve tarayıcı indirir
    const downloadUrl = `https://api-2-iq17.onrender.com/api/ftp/download?fileName=${encodeURIComponent(fileName)}`;
    window.location.href = downloadUrl;
}