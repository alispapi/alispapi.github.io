// ==============================
// FileBridge - Dosya Havuzu JS
// ==============================

// API Adresi (Render)
const API_BASE_URL = "https://api-2-iq17.onrender.com/api/Ftp";

// Elementler
const filesContainer = document.getElementById('filesContainer');
const emptyState = document.getElementById('emptyState');
const totalFilesEl = document.getElementById('totalFiles');
const totalSizeEl = document.getElementById('totalSize');
const latestDateEl = document.getElementById('latestDate');
const searchInput = document.getElementById('searchInput');

let allFilesData = [];

// Sayfa yüklendiğinde çalış
document.addEventListener('DOMContentLoaded', () => {
    console.log("FileBridge Pool script çalıştı...");
    fetchFiles();

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allFilesData.filter(file =>
                (file.name || file.Name || "").toLowerCase().includes(term)
            );
            displayFiles(filtered);
        });
    }
});

async function fetchFiles() {
    if (filesContainer) {
        filesContainer.innerHTML = '<p style="text-align:center; padding:20px;">Yükleniyor...</p>';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/list`);

        // 500 gibi durumlarda backend'in gönderdiği metni de oku
        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            throw new Error(`API Hatası: ${response.status} - ${errorText}`);
        }

        allFilesData = await response.json();
        console.log("Gelen Veri:", allFilesData);

        updateStats(allFilesData);
        displayFiles(allFilesData);

    } catch (error) {
        console.error("Dosya listesi alınırken hata:", error);
        if (filesContainer) {
            filesContainer.innerHTML =
                `<p style="color:red; text-align:center; padding:20px;">
                    Bağlantı Hatası: ${error.message}
                 </p>`;
        }
    }
}

function updateStats(files) {
    if (!files) return;

    if (totalFilesEl) {
        totalFilesEl.textContent = files.length;
    }

    if (totalSizeEl) {
        const totalBytes = files.reduce(
            (acc, file) => acc + (file.size || file.Size || 0),
            0
        );
        totalSizeEl.textContent = formatFileSize(totalBytes);
    }

    if (latestDateEl && files.length > 0) {
        const sorted = [...files].sort((a, b) => {
            const dateA = new Date(a.modifiedDate || a.ModifiedDate || 0);
            const dateB = new Date(b.modifiedDate || b.ModifiedDate || 0);
            return dateB - dateA;
        });

        const lastDate = new Date(
            sorted[0].modifiedDate || sorted[0].ModifiedDate
        );

        latestDateEl.textContent = isNaN(lastDate.getTime())
            ? "-"
            : lastDate.toLocaleDateString('tr-TR');
    }
}

function displayFiles(files) {
    if (!filesContainer) return;

    filesContainer.innerHTML = '';

    if (!files || files.length === 0) {
        if (emptyState) emptyState.classList.add('show');
        filesContainer.style.display = 'none';
        return;
    }

    if (emptyState) emptyState.classList.remove('show');
    filesContainer.style.display = 'grid';

    files.forEach(file => {
        const name = file.name || file.Name || "İsimsiz Dosya";
        const sizeVal = file.size || file.Size || 0;
        const size = formatFileSize(sizeVal);

        const dateRaw = file.modifiedDate || file.ModifiedDate;
        const date = dateRaw
            ? new Date(dateRaw).toLocaleDateString('tr-TR')
            : '-';

        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';

        let icon = '📄';
        if (name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) icon = '🖼';
        else if (name.match(/\.(mp4|mov|avi)$/i)) icon = '🎥';
        else if (name.match(/\.(zip|rar|7z)$/i)) icon = '📦';

        fileCard.innerHTML = `
            <div class="file-card-header">
                <div class="file-type-icon">${icon}</div>
                <div class="file-card-info">
                    <h3 title="${name}">${name}</h3>
                    <div class="file-card-meta">
                        <span>${size}</span> • <span>${date}</span>
                    </div>
                </div>
            </div>
            <div class="file-card-actions">
                <button class="btn-action btn-download"
                        onclick="downloadFile('${name}')">
                    ⬇ İndir
                </button>
            </div>
        `;

        filesContainer.appendChild(fileCard);
    });
}

// Boyutu okunabilir formata çevir
function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    if (i < 0) return '0 B';
    if (i >= sizes.length) return `${bytes} B`;

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Global download fonksiyonu
window.downloadFile = function (fileName) {
    const downloadUrl = `${API_BASE_URL}/download?fileName=${encodeURIComponent(fileName)}`;
    window.location.href = downloadUrl;
};