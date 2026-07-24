/**
 * Pot protéiné - Feedback Quiz Interactive Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 4; // Step 5 is the Reward Screen

    // State object
    const feedbackData = {
        freshness: '',
        freshnessTags: [],
        tasteRating: 0,
        tasteTags: [],
        packaging: '',
        nps: null,
        oneLineFeedback: ''
    };

    // DOM Elements
    const progressBarFill = document.getElementById('progress-bar-fill');
    const stepIndicator = document.getElementById('step-indicator');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const quizFooter = document.getElementById('quiz-footer');
    const quizStepContainer = document.getElementById('quiz-step-container');

    // Steps
    const steps = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
        4: document.getElementById('step-4'),
        5: document.getElementById('step-5')
    };

    // Initialize UI
    updateStepUI();

    // ── STEP 1: Freshness Card Selection ──
    const freshnessCards = document.querySelectorAll('.freshness-card');
    freshnessCards.forEach(card => {
        card.addEventListener('click', () => {
            freshnessCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            feedbackData.freshness = card.dataset.value;
            clearError('step-1-error');
        });
    });

    // Freshness Tag Chips (Multi-select)
    const freshnessChips = document.querySelectorAll('.freshness-chip');
    freshnessChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
            const value = chip.dataset.value;
            if (chip.classList.contains('selected')) {
                if (!feedbackData.freshnessTags.includes(value)) {
                    feedbackData.freshnessTags.push(value);
                }
            } else {
                feedbackData.freshnessTags = feedbackData.freshnessTags.filter(t => t !== value);
            }
        });
    });

    // ── STEP 2: Taste & Protein Rating (Stars) ──
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
            clearError('step-2-error');
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

    // ── STEP 3: Packaging Card Selection ──
    const packagingCards = document.querySelectorAll('.packaging-card');
    packagingCards.forEach(card => {
        card.addEventListener('click', () => {
            packagingCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            feedbackData.packaging = card.dataset.value;
            clearError('step-3-error');
        });
    });

    // ── STEP 4: NPS Rating Scale (1-10) ──
    const npsBtns = document.querySelectorAll('.nps-btn');
    npsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            npsBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            feedbackData.nps = parseInt(btn.dataset.score);
            clearError('step-4-error');
        });
    });

    // ── NAVIGATION CONTROLS ──
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < totalSteps) {
                currentStep++;
                updateStepUI();
            } else if (currentStep === totalSteps) {
                // Submit feedback
                submitFeedback();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepUI();
        }
    });

    function validateStep(step) {
        let isValid = true;

        if (step === 1) {
            if (!feedbackData.freshness) {
                showError('step-1-error', 'Please select how fresh your bowl was!');
                isValid = false;
            }
        } else if (step === 2) {
            if (feedbackData.tasteRating === 0) {
                showError('step-2-error', 'Please select a star rating for taste!');
                isValid = false;
            }
        } else if (step === 3) {
            if (!feedbackData.packaging) {
                showError('step-3-error', 'Please rate your packaging & delivery experience!');
                isValid = false;
            }
        } else if (step === 4) {
            if (feedbackData.nps === null) {
                showError('step-4-error', 'Please select a score from 1 to 10!');
                isValid = false;
            }
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

    function updateStepUI() {
        // Show current step, hide others
        Object.keys(steps).forEach(s => {
            const stepNum = parseInt(s);
            if (stepNum === currentStep) {
                steps[stepNum].classList.remove('hidden');
                steps[stepNum].classList.add('quiz-step');
            } else {
                steps[stepNum].classList.add('hidden');
                steps[stepNum].classList.remove('quiz-step');
            }
        });

        // Update progress bar
        if (currentStep <= totalSteps) {
            const percent = (currentStep / totalSteps) * 100;
            progressBarFill.style.width = `${percent}%`;
            stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;
            quizFooter.classList.remove('hidden');
        } else {
            // Reward screen
            progressBarFill.style.width = '100%';
            stepIndicator.textContent = 'Completed 🎉';
            quizFooter.classList.add('hidden');
        }

        // Prev Button state
        if (currentStep === 1) {
            prevBtn.classList.add('invisible');
        } else {
            prevBtn.classList.remove('invisible');
        }

        // Next Button label
        if (currentStep === totalSteps) {
            nextBtn.innerHTML = `Submit Feedback 🎉`;
        } else {
            nextBtn.innerHTML = `Next →`;
        }

        // Scroll smooth to top of card container
        quizStepContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function submitFeedback() {
        // Grab optional one-line feedback text
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

        // Move to Reward Step
        currentStep = 5;
        updateStepUI();
        triggerConfetti();
    }

    // ── REWARD SCREEN: COPY PROMO CODE ──
    const copyCouponBtn = document.getElementById('copy-coupon-btn');
    const couponCode = document.getElementById('coupon-code');
    const copyToast = document.getElementById('copy-toast');

    if (copyCouponBtn) {
        copyCouponBtn.addEventListener('click', () => {
            const codeText = couponCode.textContent.trim();
            navigator.clipboard.writeText(codeText).then(() => {
                copyToast.classList.remove('hidden');
                setTimeout(() => {
                    copyToast.classList.add('hidden');
                }, 3000);
            }).catch(err => {
                console.error('Clipboard copy failed', err);
            });
        });
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
