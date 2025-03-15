let selectedAvatar = null;
let currentVideoPath = null;
let audioElement = null; // Global audio element

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');

    textInput.addEventListener('input', () => {
        charCount.textContent = textInput.value.length;
    });

    document.querySelectorAll('.avatar-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            selectedAvatar = item.querySelector('img').dataset.url;

            item.style.transform = 'scale(1.1)';
            setTimeout(() => item.style.transform = '', 200);
        });
    });
});

// ✅ Voice Preview with Fixed Delay
async function previewVoice() {
    const text = document.getElementById('textInput').value.trim();
    const voice = document.getElementById('voiceSelect').value;

    if (!text) {
        showToast('Please enter some text first', 'warning');
        return;
    }

    try {
        const response = await fetch('/preview-voice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.slice(0, 50) + '...', voice })
        });

        if (!response.ok) throw new Error('Failed to generate voice preview');

        const data = await response.json();
        if (audioElement) audioElement.pause(); // Stop previous preview
        audioElement = new Audio(data.audio_url);
        audioElement.play();
    } catch (error) {
        showToast('Error previewing voice', 'error');
    }
}

// ✅ Video Generation with Lip Sync Fix
async function generateVideo() {
    if (!validateInputs()) return;

    const textInput = document.getElementById('textInput').value.trim();
    const voice = document.getElementById('voiceSelect').value;
    const speed = document.getElementById('speedRange').value;
    const bgMusic = document.getElementById('bgMusicSelect').value;
    const generateBtn = document.getElementById('generateBtn');
    const spinner = generateBtn.querySelector('.spinner-border');

    generateBtn.disabled = true;
    spinner.classList.remove('d-none');
    showProgress();

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textInput, avatar: selectedAvatar, voice, speed, background_music: bgMusic })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // ✅ Fix Lip Sync Delay
        currentVideoPath = data.video_path;
        const videoElement = document.getElementById('videoPreview');
        videoElement.src = `/download/${currentVideoPath.split('/').pop()}`;

        // ✅ Sync Video & Audio
        if (audioElement) audioElement.pause();
        audioElement = new Audio(data.audio_url);
        videoElement.onplay = () => {
            setTimeout(() => audioElement.play(), 500); // 500ms delay for better sync
        };

        document.getElementById('previewSection').classList.remove('d-none');
        showToast('Video generated successfully!', 'success');
    } catch (error) {
        showToast('Error generating video: ' + error.message, 'error');
    } finally {
        generateBtn.disabled = false;
        spinner.classList.add('d-none');
        hideProgress();
    }
}

// ✅ Input Validation
function validateInputs() {
    if (!selectedAvatar) {
        showToast('Please select an avatar', 'warning');
        return false;
    }
    if (!document.getElementById('textInput').value.trim()) {
        showToast('Please enter some text', 'warning');
        return false;
    }
    return true;
}

// ✅ Show Progress Bar
function showProgress() {
    const progress = document.createElement('div');
    progress.className = 'progress-wrapper';
    progress.innerHTML = `<div class="progress"><div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div></div>`;
    document.getElementById('generateBtn').insertAdjacentElement('afterend', progress);
}

function hideProgress() {
    const progress = document.querySelector('.progress-wrapper');
    if (progress) progress.remove();
}

// ✅ Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;

    const container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.appendChild(toast);
    document.body.appendChild(container);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    toast.addEventListener('hidden.bs.toast', () => container.remove());
}

// ✅ Fixed Download Function
function downloadVideo() {
    if (!currentVideoPath) {
        showToast('No video available for download', 'warning');
        return;
    }
    window.location.href = `/download/${currentVideoPath.split('/').pop()}`;
}

// ✅ Share Video Function
function shareVideo() {
    if (!currentVideoPath) return;
    const shareUrl = `${window.location.origin}/share/${currentVideoPath.split('/').pop()}`;

    if (navigator.share) {
        navigator.share({ title: 'Check out my AI-generated video!', url: shareUrl });
    } else {
        navigator.clipboard.writeText(shareUrl)
            .then(() => showToast('Share link copied to clipboard!', 'success'))
            .catch(() => showToast('Failed to copy share link', 'error'));
    }
}

// ✅ Copy Share Link
function copyShareLink(videoPath) {
    const shareUrl = `${window.location.origin}/share/${videoPath.split('/').pop()}`;
    navigator.clipboard.writeText(shareUrl)
        .then(() => showToast('Share link copied to clipboard!', 'success'))
        .catch(() => showToast('Failed to copy share link', 'error'));
}