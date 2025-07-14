document.addEventListener('DOMContentLoaded', function() {

    const modal = document.getElementById('video-modal');
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    const closeModalBtn = document.querySelector('.video-modal-close');
    const videoPlayerContainer = document.getElementById('video-player-container');

    // Function to open the modal and play video
    function openModal(videoId) {
        videoPlayerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        modal.style.display = 'block';
    }

    // Function to close the modal
    function closeModal() {
        modal.style.display = 'none';
        videoPlayerContainer.innerHTML = ''; // Stop video by removing iframe
    }

    // Event listeners for each video thumbnail
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            if (videoId) {
                openModal(videoId);
            }
        });
    });

    // Event listener for the close button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Event listener to close modal when clicking on the background overlay
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });

    // Optional: Close modal with the Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

}); 