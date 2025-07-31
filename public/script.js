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

// Create gallery item element
function createGalleryItem(image) {
    const item = document.createElement('div');
    item.className = 'gallery-item';

    const uploadDate = new Date(image.uploadTime);
    const formattedDate = uploadDate.toLocaleDateString();
    const formattedTime = uploadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    item.innerHTML = `
        <img src="${image.url}" alt="Uploaded Photo" loading="lazy">
        <div class="gallery-item-info">
            <p>🗓️ ${formattedDate}</p>
            <p>⏰ ${formattedTime}</p>
        </div>
    `;

    // Add click event to open modal
    item.addEventListener('click', () => openImageModal(image));

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
