// Global variables
let html5QrCode = null;
let galleryRefreshInterval = null;

// DOM elements
const uploadForm = document.getElementById('uploadForm');
const photoInput = document.getElementById('photoInput');
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const gallery = document.getElementById('gallery');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyGallery = document.getElementById('emptyGallery');
const imageCount = document.getElementById('imageCount');
const refreshBtn = document.getElementById('refreshBtn');
const uploadModal = document.getElementById('uploadModal');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDetails = document.getElementById('modalDetails');
const closeBtn = document.querySelector('.close-btn');
const qrBtn = document.getElementById('qrBtn');
const qrReader = document.getElementById('qrReader');
const stopQrBtn = document.getElementById('stopQrBtn');

// --- QR for Mobile Upload ---
let qrUploadBtn = document.getElementById('qrUploadBtn');
let qrUploadModal = null;
function createQrUploadBtn() {
  if (qrUploadBtn) return;
  qrUploadBtn = document.createElement('button');
  qrUploadBtn.id = 'qrUploadBtn';
  qrUploadBtn.textContent = '📱 Upload from Mobile (QR)';
  qrUploadBtn.className = 'upload-btn';
  qrUploadBtn.style.margin = '1.2rem auto 0 auto';
  qrUploadBtn.style.display = 'block';
  uploadArea.parentNode.insertBefore(qrUploadBtn, uploadArea.nextSibling);
  qrUploadBtn.onclick = showQrUploadModal;
}

function showQrUploadModal() {
  if (!qrUploadModal) {
    qrUploadModal = document.createElement('div');
    qrUploadModal.className = 'modal';
    qrUploadModal.style.zIndex = 10010;
    qrUploadModal.innerHTML = `
      <div class="modal-content" style="max-width:350px;text-align:center;padding:2.2rem 1.5rem;">
        <h2 style="margin-bottom:1.2rem;">Scan to Upload</h2>
        <div id="qrUploadCode" style="margin:0 auto 1.2rem auto;"></div>
        <div style="color:#888;font-size:1rem;margin-bottom:1.2rem;">Scan this QR code with your phone to upload a photo directly from your device.</div>
        <button id="closeQrUploadModal" class="upload-btn" style="background:#dc3545;max-width:180px;">Close</button>
      </div>
    `;
    document.body.appendChild(qrUploadModal);
    document.getElementById('closeQrUploadModal').onclick = () => { qrUploadModal.style.display = 'none'; };
  }
  qrUploadModal.style.display = 'flex';
  // Generate QR code for public Render URL /upload
  let qrDiv = document.getElementById('qrUploadCode');
  qrDiv.innerHTML = '';
  let url = 'https://displayboard.onrender.com/upload';
  if (!window.QRCode) {
    let script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.onload = () => { new QRCode(qrDiv, { text: url, width: 200, height: 200 }); };
    document.body.appendChild(script);
  } else {
    new QRCode(qrDiv, { text: url, width: 200, height: 200 });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  createQrUploadBtn();
});

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadGallery();
    startAutoRefresh();
});

// Setup all event listeners
function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => photoInput.click());
    
    // File input change
    photoInput.addEventListener('change', handleFileSelect);
    
    // Form submit
    uploadForm.addEventListener('submit', handleUpload);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Refresh button
    refreshBtn.addEventListener('click', loadGallery);
    
    // Modal close
    closeBtn.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeImageModal();
    });
    
    // QR Code functionality
    qrBtn.addEventListener('click', toggleQRScanner);
    stopQrBtn.addEventListener('click', stopQRScanner);
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
            closeUploadModal();
        }
    });
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        photoInput.files = files;
        validateAndPreviewFile(file);
    }
}

// Validate and preview file
function validateAndPreviewFile(file) {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file.', 'error');
        return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    // Enable upload button
    uploadBtn.disabled = false;
    
    // Update upload area text
    const uploadText = uploadArea.querySelector('.upload-text');
    uploadText.innerHTML = `<strong>Selected:</strong> ${file.name}`;
    
    showNotification('File selected! Click "Upload Photo" to share it.', 'success');
}

// Handle form upload
async function handleUpload(e) {
    e.preventDefault();
    
    const file = photoInput.files[0];
    if (!file) {
        showNotification('Please select a file first.', 'error');
        return;
    }
    
    showUploadModal();
    
    const formData = new FormData();
    formData.append('photo', file);
    
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Photo uploaded successfully!', 'success');
            resetUploadForm();
            loadGallery(); // Refresh gallery
        } else {
            showNotification(result.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload failed. Please try again.', 'error');
    } finally {
        closeUploadModal();
    }
}

// Reset upload form
function resetUploadForm() {
    photoInput.value = '';
    uploadBtn.disabled = true;
    const uploadText = uploadArea.querySelector('.upload-text');
    uploadText.innerHTML = '<strong>Click to upload</strong> or drag and drop';
}

// Load gallery images
async function loadGallery() {
    try {
        showLoadingSpinner();
        
        const response = await fetch('/api/images');
        const images = await response.json();
        
        hideLoadingSpinner();
        
        if (images.length === 0) {
            showEmptyGallery();
        } else {
            displayImages(images);
        }
        
        updateImageCount(images.length);
    } catch (error) {
        console.error('Error loading gallery:', error);
        hideLoadingSpinner();
        showNotification('Failed to load gallery. Please try again.', 'error');
    }
}

// Display images in gallery
function displayImages(images) {
    gallery.innerHTML = '';
    emptyGallery.style.display = 'none';
    gallery.style.display = 'grid';
    
    images.forEach(image => {
        const galleryItem = createGalleryItem(image);
        gallery.appendChild(galleryItem);
    });
}

// --- Password Modal Logic ---
let passwordModal = null;
let passwordInput = null;
let passwordSubmitBtn = null;
let passwordCancelBtn = null;
let passwordModalCallback = null;
let passwordModalFilename = null;
let passwordModalDeleteBtn = null;

function createPasswordModal() {
    if (document.getElementById('passwordModal')) return;
    passwordModal = document.createElement('div');
    passwordModal.id = 'passwordModal';
    passwordModal.innerHTML = `
        <div class="modal-content password-modal-content" style="max-width:370px;padding:2.2rem 2.2rem 1.5rem 2.2rem;box-shadow:0 8px 40px rgba(79,140,255,0.18);border-radius:18px;background:var(--modal-content-bg,rgba(255,255,255,0.98));border:1.5px solid var(--glass-border,rgba(255,255,255,0.18));text-align:center;animation:fadeInScale 0.35s cubic-bezier(.4,2,.6,1) forwards;">
            <div style="font-size:2.7rem;margin-bottom:0.5rem;color:#dc3545;line-height:1;">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" style="display:inline-block;vertical-align:middle;"><path d="M12 2C7.03 2 3 6.03 3 11c0 4.97 4.03 9 9 9s9-4.03 9-9c0-4.97-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-1-3h2v2h-2zm0-8h2v6h-2z" fill="#dc3545"/></svg>
            </div>
            <h3 style="margin-bottom:0.7rem;font-weight:700;color:#222;letter-spacing:-0.5px;">Admin Delete</h3>
            <div style="color:#888;font-size:1rem;margin-bottom:1.2rem;">Enter the admin password to delete this photo. This action cannot be undone.</div>
            <input type="password" id="passwordInput" placeholder="Admin password" style="width:100%;padding:0.8rem 1rem;font-size:1.1rem;border-radius:8px;border:1.5px solid #bbb;margin-bottom:1.1rem;outline:none;transition:border 0.2s;">
            <div id="passwordErrorMsg" style="color:#dc3545;font-size:0.98rem;min-height:1.2em;margin-bottom:1.1rem;display:none;"></div>
            <div style="display:flex;gap:1rem;justify-content:flex-end;">
                <button id="passwordCancelBtn" style="background:#f3f3f3;color:#222;padding:0.7rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-weight:500;box-shadow:0 1px 4px rgba(0,0,0,0.04);">Cancel</button>
                <button id="passwordSubmitBtn" style="background:linear-gradient(120deg,#4f8cff 0%,#a259ff 100%);color:#fff;padding:0.7rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;box-shadow:0 2px 8px rgba(79,140,255,0.10);transition:background 0.2s;">Delete</button>
            </div>
        </div>
    `;
    Object.assign(passwordModal.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(20,24,34,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        backdropFilter: 'blur(2.5px)',
        animation: 'fadeInBg 0.25s cubic-bezier(.4,2,.6,1) forwards'
    });
    // Add fadeIn keyframes if not present
    if (!document.getElementById('pwModalAnim')) {
        const style = document.createElement('style');
        style.id = 'pwModalAnim';
        style.innerHTML = `@keyframes fadeInScale{0%{opacity:0;transform:scale(0.95);}100%{opacity:1;transform:scale(1);}}@keyframes fadeInBg{0%{opacity:0;}100%{opacity:1;}}`;
        document.head.appendChild(style);
    }
    document.body.appendChild(passwordModal);
    passwordInput = document.getElementById('passwordInput');
    passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
    passwordCancelBtn = document.getElementById('passwordCancelBtn');
    passwordErrorMsg = document.getElementById('passwordErrorMsg');

    passwordCancelBtn.onclick = hidePasswordModal;
    passwordInput.onkeydown = (e) => {
        if (e.key === 'Enter') passwordSubmitBtn.click();
    };
    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) hidePasswordModal();
    });
}

function showPasswordModal(filename, deleteBtn, callback) {
    createPasswordModal();
    passwordModal.style.display = 'flex';
    passwordInput.value = '';
    passwordInput.focus();
    passwordErrorMsg.style.display = 'none';
    passwordErrorMsg.textContent = '';
    passwordModalCallback = callback;
    passwordModalFilename = filename;
    passwordModalDeleteBtn = deleteBtn;
    passwordSubmitBtn.onclick = async () => {
        const password = passwordInput.value;
        if (!password) {
            passwordErrorMsg.textContent = 'Please enter the admin password.';
            passwordErrorMsg.style.display = 'block';
            passwordInput.style.border = '1.5px solid #dc3545';
            passwordInput.focus();
            return;
        } else {
            passwordErrorMsg.style.display = 'none';
            passwordInput.style.border = '1.5px solid #bbb';
        }
        passwordModalDeleteBtn.disabled = true;
        passwordModalDeleteBtn.style.opacity = '0.5';
        try {
            await passwordModalCallback(password, passwordModalFilename, passwordModalDeleteBtn);
        } finally {
            hidePasswordModal();
        }
    };
}

function hidePasswordModal() {
    if (passwordModal) passwordModal.style.display = 'none';
    if (passwordModalDeleteBtn) {
        passwordModalDeleteBtn.disabled = false;
        passwordModalDeleteBtn.style.opacity = '1';
    }
}

// Create gallery item element
function createGalleryItem(image) {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const uploadDate = new Date(image.uploadTime);
    const formattedDate = uploadDate.toLocaleDateString();
    const formattedTime = uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    item.innerHTML = `
        <div class="gallery-image-wrapper">
            <img src="${image.url}" alt="Uploaded Photo" loading="lazy">
            <div class="gallery-badge">
                <span class="badge-date">${formattedDate}</span>
                <span class="badge-time">${formattedTime}</span>
            </div>
            <button class="delete-btn" title="Delete Photo" style="display:none;position:absolute;top:10px;left:10px;background:rgba(220,53,69,0.85);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;z-index:3;align-items:center;justify-content:center;transition:background 0.2s;">
                <span style="color:#fff;font-size:1.2rem;line-height:1;">&#128465;</span>
            </button>
        </div>
    `;

    // Add click event to open modal (ignore if delete button is clicked)
    item.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) return;
        openImageModal(image);
    });

    // Show delete button on hover (desktop only)
    const wrapper = item.querySelector('.gallery-image-wrapper');
    const deleteBtn = item.querySelector('.delete-btn');
    wrapper.addEventListener('mouseenter', () => { deleteBtn.style.display = 'flex'; });
    wrapper.addEventListener('mouseleave', () => { deleteBtn.style.display = 'none'; });

    // Delete button logic with custom modal
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const filename = image.url.split('/').pop();
        showPasswordModal(filename, deleteBtn, async (password, filename, deleteBtn) => {
            try {
                const res = await fetch('/api/delete-image', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, password })
                });
                const result = await res.json();
                if (result.success) {
                    showNotification('Photo deleted!', 'success');
                    item.remove();
                    updateImageCount(document.querySelectorAll('.gallery-item').length);
                } else {
                    showNotification(result.error || 'Delete failed', 'error');
                }
            } catch (err) {
                showNotification('Delete failed. Please try again.', 'error');
            }
        });
    });

    return item;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show/hide loading spinner
function showLoadingSpinner() {
    loadingSpinner.style.display = 'block';
    gallery.style.display = 'none';
    emptyGallery.style.display = 'none';
}

function hideLoadingSpinner() {
    loadingSpinner.style.display = 'none';
}

// Show empty gallery
function showEmptyGallery() {
    gallery.style.display = 'none';
    emptyGallery.style.display = 'block';
}

// Update image count
function updateImageCount(count) {
    imageCount.textContent = `${count} photo${count !== 1 ? 's' : ''}`;
}

// Modal functions
function showUploadModal() {
    uploadModal.style.display = 'flex';
}

function closeUploadModal() {
    uploadModal.style.display = 'none';
}

function openImageModal(image) {
    modalImage.src = image.url;
    modalImage.alt = 'Uploaded Photo';
    modalTitle.textContent = '';

    const uploadDate = new Date(image.uploadTime);
    const formattedDate = uploadDate.toLocaleDateString();
    const formattedTime = uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    modalDetails.innerHTML = `
        <strong>📅 Uploaded:</strong> ${formattedDate}<br>
        <strong>⏰ Time:</strong> ${formattedTime}
    `;

    imageModal.style.display = 'flex';
}

function closeImageModal() {
    imageModal.style.display = 'none';
}

// QR Code functionality
function toggleQRScanner() {
    if (qrReader.style.display === 'none') {
        startQRScanner();
    } else {
        stopQRScanner();
    }
}

function startQRScanner() {
    qrReader.style.display = 'block';
    qrBtn.textContent = '📱 Scanner Active...';
    qrBtn.disabled = true;
    
    html5QrCode = new Html5Qrcode("qrReaderDiv");
    
    html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
            // Handle successful QR scan
            handleQRScan(decodedText);
        },
        (errorMessage) => {
            // Handle scan error (usually just no QR code found)
            console.log('QR scan error:', errorMessage);
        }
    ).catch(err => {
        console.error('Failed to start QR scanner:', err);
        showNotification('Failed to start camera. Please check permissions.', 'error');
        stopQRScanner();
    });
}

function stopQRScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
            html5QrCode = null;
        }).catch(err => {
            console.error('Error stopping QR scanner:', err);
        });
    }
    
    qrReader.style.display = 'none';
    qrBtn.textContent = '📱 Scan QR Code to Upload';
    qrBtn.disabled = false;
}

function handleQRScan(qrText) {
    stopQRScanner();
    
    // Check if QR code contains a URL to an image
    if (qrText.startsWith('http')) {
        showNotification('QR code detected! Attempting to download image...', 'info');
        downloadImageFromURL(qrText);
    } else {
        showNotification('QR code scanned, but it doesn\'t contain an image URL.', 'warning');
    }
}

// Download image from URL (for QR functionality)
async function downloadImageFromURL(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        
        if (blob.type.startsWith('image/')) {
            // Create a file from the blob
            const fileName = url.split('/').pop() || 'qr-image.jpg';
            const file = new File([blob], fileName, { type: blob.type });
            
            // Create a DataTransfer object to simulate file selection
            const dt = new DataTransfer();
            dt.items.add(file);
            photoInput.files = dt.files;
            
            validateAndPreviewFile(file);
        } else {
            showNotification('URL does not point to an image file.', 'error');
        }
    } catch (error) {
        console.error('Error downloading image:', error);
        showNotification('Failed to download image from URL.', 'error');
    }
}

// Auto-refresh gallery every 30 seconds
function startAutoRefresh() {
    galleryRefreshInterval = setInterval(() => {
        loadGallery();
    }, 30000); // 30 seconds
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    notification.style.background = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (html5QrCode) {
        html5QrCode.stop();
    }
    if (galleryRefreshInterval) {
        clearInterval(galleryRefreshInterval);
    }
});
