/*
 * JavaScript to handle image uploads and preview them in the gallery. This script
 * listens for file selection and drag-and-drop events, then reads image files
 * using the FileReader API. Once read, the images are added to the gallery
 * on the page. Non-image files are ignored gracefully.
 */

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const gallery = document.getElementById('gallery');
  const uploadArea = document.querySelector('.upload-area');

  // Authentication elements
  const authOverlay = document.getElementById('auth-overlay');
  const passwordInput = document.getElementById('password-input');
  const passwordSubmit = document.getElementById('password-submit');
  const errorMessage = document.getElementById('error-message');

  // Create a "Pass" button if it does not already exist. This button lives in the top-left
  // corner and allows the owner to authenticate before uploading images.
  let authButton = document.getElementById('auth-button');
  if (!authButton) {
    authButton = document.createElement('button');
    authButton.id = 'auth-button';
    authButton.className = 'auth-button';
    authButton.textContent = 'Pass';
    // Insert at beginning of body so it appears near the top-left
    document.body.prepend(authButton);
  }

  // Hide the authentication overlay by default until the owner chooses to log in.
  if (authOverlay) {
    authOverlay.style.display = 'none';
  }

  // Define the required password. Change this value to your desired password.
  const REQUIRED_PASSWORD = 'hemmeligkode';

  // Track whether the user has authenticated. Until authenticated, upload actions will be blocked.
  let authenticated = false;

  // Load any previously saved images from localStorage so they persist across sessions. If none
  // exist, default to an empty array. Images are stored as base64 data URIs under the key 'gallery'.
  let savedImages = [];
  try {
    const stored = localStorage.getItem('gallery');
    if (stored) {
      savedImages = JSON.parse(stored);
      savedImages.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
        gallery.appendChild(img);
      });
    }
  } catch (err) {
    // If JSON parsing fails or localStorage is unavailable, ignore gracefully
    savedImages = [];
  }

  /**
   * Checks the entered password and either hides the overlay or shows an error.
   */
  function authenticate() {
    const entered = passwordInput.value;
    if (entered === REQUIRED_PASSWORD) {
      authOverlay.style.display = 'none';
      // Mark the user as authenticated so subsequent uploads are allowed
      authenticated = true;
    } else {
      errorMessage.textContent = 'Forkert adgangskode, prøv venligst igen.';
      passwordInput.value = '';
    }
  }

  // Listen for click on login button
  if (passwordSubmit) {
    passwordSubmit.addEventListener('click', authenticate);
  }

  // Allow pressing Enter key to submit password
  if (passwordInput) {
    passwordInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter') {
        authenticate();
      }
    });
  }

  // When the owner clicks the "Pass" button, reveal the authentication overlay and focus the
  // password input. Clear any previous error message and reset the input field.
  if (authButton) {
    authButton.addEventListener('click', () => {
      errorMessage.textContent = '';
      passwordInput.value = '';
      authOverlay.style.display = 'flex';
      // focus the input after a short delay to ensure overlay is visible
      setTimeout(() => passwordInput.focus(), 0);
    });
  }

  /**
   * Handles a list of files by reading each image file and appending it to the gallery.
   * @param {FileList|Array} files - The files selected via input or dropped via drag-and-drop.
   */
  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      // Only process image files
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        gallery.appendChild(img);
        // Persist the uploaded image in localStorage so it remains across sessions on this device.
        savedImages.push(img.src);
        try {
          localStorage.setItem('gallery', JSON.stringify(savedImages));
        } catch (err) {
          // If saving fails (e.g. storage quota exceeded), silently ignore.
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Event listener for the file input (click-to-select)
  fileInput.addEventListener('change', (event) => {
    // If the user hasn't authenticated yet, inform them to authenticate via the Pass button and halt upload.
    if (!authenticated) {
      alert('Du skal logge ind via "Pass"-knappen for at uploade billeder.');
      // Reset input so the same file can be chosen again after authentication
      event.target.value = '';
      return;
    }
    if (event.target.files && event.target.files.length > 0) {
      handleFiles(event.target.files);
    }
    // Reset input so the same file can be uploaded again if desired
    event.target.value = '';
  });

  // Drag-and-drop events
  uploadArea.addEventListener('dragover', (event) => {
    event.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (event) => {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    const dt = event.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      // Require authentication before handling dropped files
      if (!authenticated) {
        alert('Du skal logge ind via "Pass"-knappen for at uploade billeder.');
        return;
      }
      handleFiles(dt.files);
      dt.clearData();
    }
  });
});
