
# PhotoShare - Instant Photo Sharing Website

A simple and open website where users can instantly upload or scan photos without needing to log in. All uploaded images are displayed publicly on a live gallery along with basic metadata like filename and upload time.

## 🌟 Features

- **No Login Required** - Start sharing photos instantly
- **Instant Upload** - Drag & drop or click to upload photos
- **Public Gallery** - All photos are displayed in a beautiful live gallery
- **Photo Metadata** - Shows filename, upload time, and file size
- **QR Code Scanner** - Scan QR codes to upload images from URLs
- **Real-time Updates** - Gallery refreshes automatically every 30 seconds
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **File Validation** - Supports JPG, PNG, GIF, WebP up to 10MB

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **File Upload**: Multer
- **QR Scanner**: html5-qrcode library
- **Styling**: Custom CSS with modern gradients and animations

## 📁 Project Structure

```
photo-sharing-website/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styles
│   └── script.js       # Frontend JavaScript
├── uploads/            # Uploaded photos (auto-created)
├── server.js           # Express server
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## 🔧 API Endpoints

- `GET /` - Serve the main page
- `GET /api/images` - Get all uploaded images with metadata
- `POST /api/upload` - Upload a new photo
- `GET /uploads/:filename` - Serve uploaded images

## 🎨 Features in Detail

### Photo Upload
- Drag and drop interface
- Click to browse files
- Real-time file validation
- Progress indication during upload
- Support for multiple image formats

### Gallery Display
- Grid layout with responsive design
- Image thumbnails with metadata
- Click to view full-size images
- Auto-refresh every 30 seconds
- Empty state when no photos exist

### QR Code Integration
- Built-in QR code scanner using device camera
- Automatically download images from QR code URLs
- Easy toggle on/off functionality

### User Experience
- Modern, clean interface
- Smooth animations and transitions
- Toast notifications for user feedback
- Modal dialogs for image viewing
- Mobile-friendly responsive design

## 🔮 Future Enhancements

- [ ] **Moderation Tools** - Admin interface for managing uploads
- [ ] **Auto-delete Old Uploads** - Automatic cleanup of old files
- [ ] **Database Integration** - Store metadata in a database
- [ ] **Image Compression** - Optimize uploaded images
- [ ] **Social Features** - Like/comment system
- [ ] **Search Functionality** - Search photos by filename or date
- [ ] **Bulk Upload** - Upload multiple photos at once

## 🚨 Important Notes

- All uploaded photos are **publicly visible** to anyone who visits the site
- Photos are stored in the `uploads/` directory on the server
- No user authentication or privacy controls are implemented
- This is designed for open, public photo sharing

## 📝 License

MIT License - Feel free to use and modify as needed.

## 🤝 Contributing

This is an open-source project. Feel free to submit issues and pull requests!

---

**Happy Photo Sharing! 📸✨**
#   D i s p l a y B o a r d 
 
 