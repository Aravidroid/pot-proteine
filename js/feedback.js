/**
 * Pot protéiné - Single-Page Feedback Quiz Controller
 */
document.addEventListener('DOMContentLoaded', () => {

    // State object
    const feedbackData = {
        tasteRating: 0,
        tasteTags: [],
        freshness: '',
        portion: '',
        sweetness: '',
        nps: null,
        oneLineFeedback: ''
    };

    // DOM Elements
    const quizFormContainer = document.getElementById('quiz-form-container');
    const thankYouScreen = document.getElementById('thank-you-screen');
    const submitBtn = document.getElementById('submit-feedback-btn');

    // ── QUESTION 1: Taste & Rating ──
    const stars = document.querySelectorAll('.star-btn');
    const starLabel = document.getElementById('star-rating-label');
    const ratingLabels = {
        1: 'Needs Improvement 😕',
        2: 'Fair 🙂',
        3: 'Good & Healthy 👍',
        4: 'Delicious & Filling! 😋',
        5: 'Perfection! Loved It! 🌟'
    };

    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.dataset.star);
            highlightStars(val);
        });

        star.addEventListener('mouseleave', () => {
            highlightStars(feedbackData.tasteRating);
        });

        star.addEventListener('click', () => {
            feedbackData.tasteRating = parseInt(star.dataset.star);
            highlightStars(feedbackData.tasteRating);
            starLabel.textContent = ratingLabels[feedbackData.tasteRating];
            starLabel.classList.remove('text-gray-400');
            starLabel.classList.add('text-emerald-700', 'font-semibold');
            clearError('q1-error');
        });
    });

    function highlightStars(count) {
        stars.forEach(s => {
            const val = parseInt(s.dataset.star);
            if (val <= count) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }

    // Taste Chips (Multi-select)
    const tasteChips = document.querySelectorAll('.taste-chip');
    tasteChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
            const value = chip.dataset.value;
            if (chip.classList.contains('selected')) {
                if (!feedbackData.tasteTags.includes(value)) {
                    feedbackData.tasteTags.push(value);
                }
            } else {
                feedbackData.tasteTags = feedbackData.tasteTags.filter(t => t !== value);
            }
        });
    });

    // ── QUESTION 2: Fruit Freshness ──
    const freshnessCards = document.querySelectorAll('.freshness-card');
    freshnessCards.forEach(card => {
        card.addEventListener('click', () => {
            freshnessCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            feedbackData.freshness = card.dataset.value;
            clearError('q2-error');
        });
    });

    // ── QUESTION 3: Portion Size & Value ──
    const portionCards = document.querySelectorAll('.portion-card');
    portionCards.forEach(card => {
        card.addEventListener('click', () => {
            portionCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            feedbackData.portion = card.dataset.value;
            clearError('q3-error');
        });
    });

    // ── QUESTION 4: Sweetness & Flavor Balance ──
    const sweetnessCards = document.querySelectorAll('.sweetness-card');
    sweetnessCards.forEach(card => {
        card.addEventListener('click', () => {
            sweetnessCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            feedbackData.sweetness = card.dataset.value;
            clearError('q4-error');
        });
    });

    // ── QUESTION 5: NPS Rating Scale (1-10) ──
    const npsBtns = document.querySelectorAll('.nps-btn');
    npsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            npsBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            feedbackData.nps = parseInt(btn.dataset.score);
            clearError('q5-error');
        });
    });

    // ── SUBMIT FEEDBACK ──
    submitBtn.addEventListener('click', () => {
        if (validateAll()) {
            submitFeedback();
        }
    });

    function validateAll() {
        let isValid = true;
        let firstErrorCard = null;

        // Q1 validation
        if (feedbackData.tasteRating === 0) {
            showError('q1-error', 'Please select a star rating for taste!');
            if (!firstErrorCard) firstErrorCard = document.getElementById('q1-card');
            isValid = false;
        }

        // Q2 validation
        if (!feedbackData.freshness) {
            showError('q2-error', 'Please select how fresh your fruit Box was!');
            if (!firstErrorCard) firstErrorCard = document.getElementById('q2-card');
            isValid = false;
        }

        // Q3 validation
        if (!feedbackData.portion) {
            showError('q3-error', 'Please select your portion size satisfaction!');
            if (!firstErrorCard) firstErrorCard = document.getElementById('q3-card');
            isValid = false;
        }

        // Q4 validation
        if (!feedbackData.sweetness) {
            showError('q4-error', 'Please select your sweetness preference!');
            if (!firstErrorCard) firstErrorCard = document.getElementById('q4-card');
            isValid = false;
        }

        // Q5 validation
        if (feedbackData.nps === null) {
            showError('q5-error', 'Please select a score from 1 to 10!');
            if (!firstErrorCard) firstErrorCard = document.getElementById('q5-card');
            isValid = false;
        }

        // Scroll to first error card if invalid
        if (!isValid && firstErrorCard) {
            firstErrorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    function showError(elementId, message) {
        const errEl = document.getElementById(elementId);
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.remove('hidden');
        }
    }

    function clearError(elementId) {
        const errEl = document.getElementById(elementId);
        if (errEl) {
            errEl.classList.add('hidden');
            errEl.textContent = '';
        }
    }

    function submitFeedback() {
        // Grab optional feedback
        const oneLineInput = document.getElementById('one-line-feedback');
        if (oneLineInput) {
            feedbackData.oneLineFeedback = oneLineInput.value.trim();
        }

        feedbackData.submittedAt = new Date().toISOString();

        // Save to LocalStorage
        try {
            const existingFeedback = JSON.parse(localStorage.getItem('pot_protein_feedback') || '[]');
            existingFeedback.push(feedbackData);
            localStorage.setItem('pot_protein_feedback', JSON.stringify(existingFeedback));
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }

        // Hide form and show Thank You screen
        quizFormContainer.classList.add('hidden');
        thankYouScreen.classList.remove('hidden');
        thankYouScreen.scrollIntoView({ behavior: 'smooth', block: 'center' });

        triggerConfetti();
    }

    // ── CONFETTI ANIMATION ──
    function triggerConfetti() {
        const confettiContainer = document.getElementById('confetti-container');
        if (!confettiContainer) return;

        confettiContainer.innerHTML = '';
        const colors = ['#059669', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

        for (let i = 0; i < 40; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = `${Math.random() * 2}s`;
            piece.style.animationDuration = `${2 + Math.random() * 2}s`;
            confettiContainer.appendChild(piece);
        }
    }
});
