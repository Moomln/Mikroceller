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

  // Define the required password. Change this value to your desired password.
  const REQUIRED_PASSWORD = 'hemmeligkode';

  /**
   * Checks the entered password and either hides the overlay or shows an error.
   */
  function authenticate() {
    const entered = passwordInput.value;
    if (entered === REQUIRED_PASSWORD) {
      authOverlay.style.display = 'none';
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
      };
      reader.readAsDataURL(file);
    });
  }

  // Event listener for the file input (click-to-select)
  fileInput.addEventListener('change', (event) => {
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
      handleFiles(dt.files);
      dt.clearData();
    }
  });
});
