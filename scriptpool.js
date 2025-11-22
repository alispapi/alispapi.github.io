// API Adresin
const API_BASE_URL = "https://api-2-iq17.onrender.com/api/ftp";

const filesContainer = document.getElementById('filesContainer');
const emptyState = document.getElementById('emptyState');
const totalFilesEl = document.getElementById('totalFiles');
const totalSizeEl = document.getElementById('totalSize');
const latestDateEl = document.getElementById('latestDate');
const searchInput = document.getElementById('searchInput');

// Tüm dosyaları burada tutacağız (Arama yapabilmek için)
let allFilesData = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("Script vFinal (Stats+Search) çalıştı...");
    fetchFiles();
    
    // Arama kutusuna yazıldıkça filtrele
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterFiles(searchTerm);
        });
    }
});

async function fetchFiles() {
    if (filesContainer) filesContainer.innerHTML = '<p style="text-align:center; padding:20px;">Dosyalar yükleniyor...</p>';

    try {
        var url = API_BASE_URL + "/list";
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Liste alınamadı');
        
        // Artık { Name, Size, ModifiedDate } objeleri geliyor
        allFilesData = await response.json();
        console.log("Gelen Veri:", allFilesData);
        
        updateStats(allFilesData);
        displayFiles(allFilesData);
        
    } catch (error) {
        console.error(error);
        if (filesContainer) {
            filesContainer.innerHTML = '<p style="color:red; text-align:center">Hata: ' + error.message + '</p>';
        }
    }
}

function filterFiles(term) {
    const filtered = allFilesData.filter(file => 
        file.name.toLowerCase().includes(term)
    );
    displayFiles(filtered);
}

function updateStats(files) {
    // 1. Toplam Dosya
    if(totalFilesEl) totalFilesEl.textContent = files.length;

    // 2. Toplam Boyut (Byte -> MB çevirme)
    if(totalSizeEl) {
        let totalBytes = files.reduce((acc, file) => acc + file.size, 0);
        totalSizeEl.textContent = formatFileSize(totalBytes);
    }

    // 3. Son Yükleme
    if(latestDateEl && files.length > 0) {
        // Tarihe göre sırala (En yeni en başa)
        const sorted = [...files].sort((a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate));
        const lastDate = new Date(sorted[0].modifiedDate);
        latestDateEl.textContent = lastDate.toLocaleDateString('tr-TR');
    } else if (latestDateEl) {
        latestDateEl.textContent = "-";
    }
}

function displayFiles(files) {
    if (!filesContainer) return;
    filesContainer.innerHTML = '';

    if (!files || files.length === 0) {
        if(emptyState) emptyState.classList.add('show');
        filesContainer.style.display = 'none';
        return;
    }
    
    if(emptyState) emptyState.classList.remove('show');
    filesContainer.style.display = 'grid';
    
    files.forEach(file => {
        // Backend'den gelen özellikler küçük harfle başlayabilir (camelCase)
        const name = file.name || file.Name;
        const size = formatFileSize(file.size || file.Size || 0);
        const date = new Date(file.modifiedDate || file.ModifiedDate).toLocaleDateString('tr-TR');

        const fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        let icon = '📄';
        if (name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) icon = '🖼';
        else if (name.match(/\.(mp4|mov|avi)$/i)) icon = '🎥';
        else if (name.match(/\.(zip|rar|7z)$/i)) icon = '📦';
        else if (name.match(/\.(pdf)$/i)) icon = '📕';
        
        fileCard.innerHTML = 
            '<div class="file-card-header">' +
                '<div class="file-type-icon">' + icon + '</div>' +
                '<div class="file-card-info">' +
                    '<h3 title="' + name + '">' + name + '</h3>' +
                    '<div class="file-card-meta">' +
                        '<span>' + size + '</span> • ' +
                        '<span>' + date + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="file-card-actions">' +
                '<button class="btn-action btn-download" onclick="downloadFile(\'' + name + '\')">⬇ İndir</button>' +
            '</div>';
            
        filesContainer.appendChild(fileCard);
    });
}

// Helper: Dosya boyutu formatlama
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

window.downloadFile = function(fileName) {
    var downloadUrl = API_BASE_URL + "/download?fileName=" + encodeURIComponent(fileName);
    window.location.href = downloadUrl;
}