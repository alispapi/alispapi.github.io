// API Adresin
var API_BASE_URL = "https://api-2-iq17.onrender.com/api/ftp";

var filesContainer = document.getElementById('filesContainer');
var emptyState = document.getElementById('emptyState');
var totalFilesEl = document.getElementById('totalFiles');
var totalSizeEl = document.getElementById('totalSize');

// Sayfa yüklenince çalış
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script vFinal (No-Backtick) çalıştı...");
    fetchFiles();
});

async function fetchFiles() {
    if (filesContainer) {
        filesContainer.innerHTML = '<p style="text-align:center; padding:20px;">Dosyalar yükleniyor...</p>';
    }

    try {
        // DÜZELTME 1: Backtick yerine + ile birleştirme yaptık (Hata vermez)
        var url = API_BASE_URL + "/list";
        console.log("İstek:", url);
        
        var response = await fetch(url);
        
        if (!response.ok) throw new Error('Liste alınamadı');
        
        var fileNames = await response.json();
        displayFiles(fileNames);
        
    } catch (error) {
        console.error(error);
        if (filesContainer) {
            filesContainer.innerHTML = '<p style="color:red; text-align:center">Hata: ' + error.message + '</p>';
        }
    }
}

function displayFiles(fileNames) {
    if (!filesContainer) return;
    filesContainer.innerHTML = '';
    
    if(totalFilesEl) totalFilesEl.textContent = fileNames.length;
    if(totalSizeEl) totalSizeEl.textContent = "-";

    if (!fileNames || fileNames.length === 0) {
        if(emptyState) emptyState.classList.add('show');
        filesContainer.style.display = 'none';
        return;
    }
    
    if(emptyState) emptyState.classList.remove('show');
    filesContainer.style.display = 'grid';
    
    fileNames.forEach(function(name) {
        var fileCard = document.createElement('div');
        fileCard.className = 'file-card';
        
        var icon = '📄';
        if (name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) icon = '🖼';
        else if (name.match(/\.(mp4|mov|avi)$/i)) icon = '🎥';
        else if (name.match(/\.(zip|rar|7z)$/i)) icon = '📦';
        else if (name.match(/\.(pdf)$/i)) icon = '📕';
        
        // HTML stringini oluştururken de normal tırnak kullandık
        fileCard.innerHTML = 
            '<div class="file-card-header">' +
                '<div class="file-type-icon">' + icon + '</div>' +
                '<div class="file-card-info">' +
                    '<h3 title="' + name + '">' + name + '</h3>' +
                    '<div class="file-card-meta"><span>DriveHQ Dosyası</span></div>' +
                '</div>' +
            '</div>' +
            '<div class="file-card-actions">' +
                '<button class="btn-action btn-download" onclick="downloadFile(\'' + name + '\')">⬇ İndir</button>' +
            '</div>';
            
        filesContainer.appendChild(fileCard);
    });
}

// DÜZELTME 2: Burada da + işareti kullandık
window.downloadFile = function(fileName) {
    var downloadUrl = API_BASE_URL + "/download?fileName=" + encodeURIComponent(fileName);
    window.location.href = downloadUrl;
}