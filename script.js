/* ==========================================================================
   Cozy & Magical Birthday Web App - Core Interactions & Logic
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Current date configuration
    const liveDateEl = document.getElementById("live-date");
    if (liveDateEl) {
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        liveDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // App state
    const STATE = {
        passcode: "",
        correctPasscode: "1468",
        unlocked: false,
        candlesBlown: 0,
        totalCandles: 4,
        letterOpened: false,
        stickerOpened: false,
        cakeOpened: false,
        placedStickers: 0,
        activePage: "page-lockscreen"
    };

    // DOM Elements
    const pageLockscreen = document.getElementById("page-lockscreen");
    const pageDashboard = document.getElementById("page-dashboard");
    const pageGallery = document.getElementById("page-gallery");

    const passcodeDots = document.querySelectorAll("#passcode-dots .dot");
    const lockscreenCard = document.querySelector(".lockscreen-card");
    const keypadButtons = document.querySelectorAll(".key-btn");

    const btnGoToGallery = document.getElementById("btn-go-to-gallery");
    const btnBackToDashboard = document.getElementById("btn-back-to-dashboard");

    const modalLetter = document.getElementById("modal-letter");
    const modalSticker = document.getElementById("modal-sticker");
    const modalCake = document.getElementById("modal-cake");
    const modalLightbox = document.getElementById("modal-lightbox");

    const btnGift1 = document.getElementById("btn-gift-1");
    const btnGift2 = document.getElementById("btn-gift-2");
    const btnGift3 = document.getElementById("btn-gift-3");

    const giftCard1 = document.getElementById("gift-card-1");
    const giftCard2 = document.getElementById("gift-card-2");
    const giftCard3 = document.getElementById("gift-card-3");

    const sourceSticker = document.getElementById("source-sticker");
    const activeStickerContainer = document.getElementById("active-sticker-container");

    const candles = document.querySelectorAll(".candle");
    const wishSuccessMessage = document.getElementById("wish-success-message");
    const cakeInstruction = document.getElementById("cake-instruction");

    const polaroidWall = document.getElementById("polaroid-wall");
    const fileInput = document.getElementById("file-input");
    const uploaderBox = document.getElementById("uploader-box");
    const customPrompt = document.getElementById("custom-prompt");
    const promptInput = document.getElementById("prompt-input");
    const btnPromptSubmit = document.getElementById("btn-prompt-submit");
    const btnPromptCancel = document.getElementById("btn-prompt-cancel");

    /* ==========================================================================
       Ambient Particle Generator (Drifting Hearts & Stars)
       ========================================================================== */
    const ambientContainer = document.getElementById("ambient-stars");

    function createStars() {
        const starCount = 35;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement("div");
            star.classList.add("star");
            star.style.left = `${Math.random() * 100}vw`;
            star.style.top = `${Math.random() * 100}vh`;
            const size = Math.random() * 2 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.animationDuration = `${Math.random() * 4 + 3}s`;
            star.style.animationDelay = `${Math.random() * 5}s`;
            ambientContainer.appendChild(star);
        }
    }

    function spawnHeart() {
        if (!STATE.unlocked) return; // Only spawn floating hearts once unlocked
        const heart = document.createElement("div");
        heart.classList.add("heart-particle");
        heart.innerHTML = ["💖", "🌸", "⭐", "🎂", "✨"][Math.floor(Math.random() * 5)];
        heart.style.left = `${Math.random() * 100}vw`;
        // Random drift sizes
        const size = Math.random() * 1 + 0.6;
        heart.style.transform = `scale(${size})`;
        heart.style.animationDuration = `${Math.random() * 4 + 4}s`;
        ambientContainer.appendChild(heart);

        // Cleanup
        setTimeout(() => {
            heart.remove();
        }, 8000);
    }

    createStars();
    setInterval(spawnHeart, 1200);

    /* ==========================================================================
       Web Audio Synthesis Engine (Synthesizes pops, puffs, & music box)
       ========================================================================== */
    let audioCtx = null;
    let synthInterval = null;
    let isSynthPlaying = false;
    let currentNoteIndex = 0;
    let mainGainNode = null;

    function initAudio() {
        if (audioCtx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        mainGainNode = audioCtx.createGain();
        mainGainNode.gain.setValueAtTime(0.25, audioCtx.currentTime); // Limit volume to pleasant level
        mainGainNode.connect(audioCtx.destination);
    }

    // Play short synthesized UI clicks/beeps
    function playTapSound(freq = 440, type = 'sine', duration = 0.08) {
        try {
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.log("Audio not supported yet", e);
        }
    }

    // Synthesize "shhh" candle puff sound via noise buffer
    function playPuffSound() {
        try {
            initAudio();
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const bufferSize = audioCtx.sampleRate * 0.15; // 150ms buffer
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);

            // Fill with white noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;

            const filter = audioCtx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(800, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            noise.start();
        } catch (e) {
            console.log("Noise synth error", e);
        }
    }




    /* ==========================================================================
       Virtual Canvas Confetti Engine (High performance particle physics)
       ========================================================================== */
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    let confettiParticles = [];
    let isConfettiActive = false;
    let confettiAnimId = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Confetti {
        constructor(isBlowout = false) {
            this.x = Math.random() * canvas.width;
            // Spawn from bottom/center if blown, otherwise fall from top
            this.y = isBlowout ? canvas.height - 50 : Math.random() * -100 - 20;
            this.size = Math.random() * 8 + 6;
            this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
            this.shape = Math.random() > 0.4 ? "circle" : "rect";

            // Physics
            this.speedX = isBlowout ? (Math.random() * 16 - 8) : (Math.random() * 4 - 2);
            this.speedY = isBlowout ? (Math.random() * -15 - 10) : (Math.random() * 5 + 4);
            this.gravity = 0.25;
            this.drag = isBlowout ? 0.96 : 0.98;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
        }

        update() {
            this.speedY += this.gravity;
            this.speedX *= this.drag;
            this.speedY *= this.drag;
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 4;
            ctx.shadowColor = this.color;

            ctx.beginPath();
            if (this.shape === "circle") {
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            } else {
                ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            ctx.fill();
            ctx.restore();
        }
    }

    function triggerConfetti(isBlowout = false, duration = 4000) {
        isConfettiActive = true;
        const particleRate = isBlowout ? 12 : 5;

        // Push batch of initial particles for a blowout burst
        if (isBlowout) {
            for (let i = 0; i < 80; i++) {
                confettiParticles.push(new Confetti(true));
            }
        }

        const interval = setInterval(() => {
            for (let i = 0; i < particleRate; i++) {
                confettiParticles.push(new Confetti(isBlowout));
            }
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            setTimeout(() => {
                isConfettiActive = false;
                cancelAnimationFrame(confettiAnimId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                confettiParticles = [];
            }, 3000); // Wait for remaining particles to fall off screen
        }, duration);

        if (!confettiAnimId || !isConfettiActive) {
            animateConfetti();
        }
    }

    function animateConfetti() {
        if (!isConfettiActive && confettiParticles.length === 0) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confettiParticles = confettiParticles.filter(p => p.y < canvas.height + 20 && p.x > -20 && p.x < canvas.width + 20);

        confettiParticles.forEach(p => {
            p.update();
            p.draw();
        });

        confettiAnimId = requestAnimationFrame(animateConfetti);
    }


    /* ==========================================================================
       PAGE 1: PASSCODE LOCKSCREEN SCREEN CONTROLS
       ========================================================================= */

    function updatePasscodeDots() {
        passcodeDots.forEach((dot, index) => {
            if (index < STATE.passcode.length) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    function verifyPasscode() {
        if (STATE.passcode === STATE.correctPasscode) {
            // Success
            STATE.unlocked = true;
            playTapSound(659.25, 'triangle', 0.15); // Happy Success Chime 1
            setTimeout(() => playTapSound(880.00, 'triangle', 0.25), 100); // Happy Success Chime 2

            triggerConfetti(false, 3000);

            setTimeout(() => {
                // Page slide transition
                pageLockscreen.classList.remove("active");
                pageDashboard.classList.add("active");
                STATE.activePage = "page-dashboard";
            }, 600);
        } else {
            // Failed code
            playTapSound(150, 'sawtooth', 0.3); // Buzz sound

            // Add error visuals and shake
            lockscreenCard.classList.add("shake");
            passcodeDots.forEach(dot => dot.classList.add("error"));

            setTimeout(() => {
                lockscreenCard.classList.remove("shake");
                passcodeDots.forEach(dot => dot.classList.remove("error"));
                STATE.passcode = "";
                updatePasscodeDots();
            }, 600);
        }
    }

    // Delegated keypad handling
    const keypad = document.querySelector('.keypad');
    if (keypad) {
        keypad.addEventListener('click', (e) => {
            if (STATE.unlocked) return;
            const btn = e.target.closest('.key-btn');
            if (!btn) return;
            const value = btn.dataset.value;
            const action = btn.dataset.action;
            if (value) {
                if (STATE.passcode.length < 4) {
                    STATE.passcode += value;
                    playTapSound(329.63, 'sine', 0.08); // standard tap tone
                    updatePasscodeDots();
                    if (STATE.passcode.length === 4) {
                        setTimeout(verifyPasscode, 250);
                    }
                }
            } else if (action) {
                playTapSound(220, 'sine', 0.08);
                if (action === "clear") {
                    STATE.passcode = "";
                } else if (action === "back") {
                    STATE.passcode = STATE.passcode.slice(0, -1);
                }
                updatePasscodeDots();
            }
        });
    }


    /* ==========================================================================
       PAGE 2: INTERACTIVE GIFT COMPONENT TRIGGERS
       ========================================================================== */

    function openModal(modal) {
        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("active"), 10);
    }

    function closeModal(modal) {
        modal.classList.remove("active");
        setTimeout(() => modal.style.display = "none", 500);
    }

    // Modal close button event listeners
    document.querySelectorAll(".modal-close, .modal-overlay").forEach(closeBtn => {
        closeBtn.addEventListener("click", (e) => {
            if (e.target === closeBtn || closeBtn.classList.contains("modal-close")) {
                const openModalEl = document.querySelector(".modal-overlay.active");
                if (openModalEl) {
                    playTapSound(293.66, 'sine', 0.08);
                    closeModal(openModalEl);
                }
            }
        });
    });

    // Prevent background overlay click inside the dialog card from closing it
    document.querySelectorAll(".modal-card").forEach(card => {
        card.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    });

    // Gift 1: Unboxing & Modal Letter trigger
    btnGift1.addEventListener("click", () => {
        if (!STATE.letterOpened) {
            giftCard1.classList.add("opened");
            btnGift1.textContent = "View Letter";
            STATE.letterOpened = true;
            playTapSound(523.25, 'triangle', 0.15);
            triggerConfetti(false, 1500);
        } else {
            playTapSound(392.00, 'sine', 0.08);
        }
        openModal(modalLetter);
    });

    // Gift 2: Holographic Sticker Presentation trigger
    btnGift2.addEventListener("click", () => {
        if (!STATE.stickerOpened) {
            giftCard2.classList.add("opened");
            btnGift2.textContent = "View Sticker Box";
            STATE.stickerOpened = true;
            playTapSound(587.33, 'triangle', 0.15);
            triggerConfetti(false, 1500);
        } else {
            playTapSound(392.00, 'sine', 0.08);
        }
        openModal(modalSticker);
    });

    // Gift 3: Interactive Blowing Birthday Cake trigger
    btnGift3.addEventListener("click", () => {
        if (!STATE.cakeOpened) {
            giftCard3.classList.add("opened");
            btnGift3.textContent = "Blow Candles";
            STATE.cakeOpened = true;
            playTapSound(659.25, 'triangle', 0.15);
            triggerConfetti(false, 1500);
        } else {
            playTapSound(392.00, 'sine', 0.08);
        }
        openModal(modalCake);
    });


    /* ==========================================================================
       GIFT 2: DRAGGABLE HOLOGRAPHIC STICKER ENGINE (Pointer events)
       ========================================================================== */

    sourceSticker.addEventListener("mousedown", peelSticker);
    sourceSticker.addEventListener("touchstart", peelSticker, { passive: true });

    function peelSticker(e) {
        closeModal(modalSticker);

        // Spawn active floating placed sticker at mouse position
        const sticker = document.createElement("div");
        sticker.classList.add("placed-sticker");
        sticker.id = `placed-sticker-${STATE.placedStickers++}`;

        // Add Holographic Shimmer image
        sticker.innerHTML = `
            <img src="sticker_holo.png" alt="Holo Sticker" class="sticker-img">
            <div class="shimmer" style="animation-duration: ${Math.random() * 4 + 3}s"></div>
            <div class="sticker-glow"></div>
        `;

        // Scale Factor Tracker
        sticker.setAttribute("data-scale", "1.0");

        activeStickerContainer.appendChild(sticker);
        playTapSound(783.99, 'triangle', 0.2); // Peeling pop

        // Position exactly under pointer coordinates
        const pageX = e.pageX || (e.touches && e.touches[0].pageX);
        const pageY = e.pageY || (e.touches && e.touches[0].pageY);

        sticker.style.left = `${pageX - 60}px`;
        sticker.style.top = `${pageY - 60}px`;

        // Attach dragging listener to this spawned sticker
        initDragSticker(sticker, e);
    }

    // Interactive Drag and Drop + double click to scale
    function initDragSticker(sticker, event) {
        let isDragging = true;
        let shiftX = 60;
        let shiftY = 60;

        function moveAt(pageX, pageY) {
            sticker.style.left = `${pageX - shiftX}px`;
            sticker.style.top = `${pageY - shiftY}px`;
        }

        // Handle direct movement
        function onPointerMove(e) {
            if (!isDragging) return;
            const x = e.pageX || (e.touches && e.touches[0].pageX);
            const y = e.pageY || (e.touches && e.touches[0].pageY);
            moveAt(x, y);
        }

        function onPointerUp() {
            isDragging = false;
            document.removeEventListener("mousemove", onPointerMove);
            document.removeEventListener("mouseup", onPointerUp);
            document.removeEventListener("touchmove", onPointerMove);
            document.removeEventListener("touchend", onPointerUp);
            playTapSound(440.00, 'sine', 0.05); // soft stick drop sound
        }

        // Set listeners on document to track drag anywhere
        document.addEventListener("mousemove", onPointerMove);
        document.addEventListener("mouseup", onPointerUp);
        document.addEventListener("touchmove", onPointerMove, { passive: false });
        document.addEventListener("touchend", onPointerUp);

        // Re-dragging setup when clicking an already placed sticker
        sticker.addEventListener("mousedown", (e) => {
            isDragging = true;
            shiftX = e.clientX - sticker.getBoundingClientRect().left;
            shiftY = e.clientY - sticker.getBoundingClientRect().top;

            const x = e.pageX;
            const y = e.pageY;
            moveAt(x, y);

            document.addEventListener("mousemove", onPointerMove);
            document.addEventListener("mouseup", onPointerUp);
        });

        sticker.addEventListener("touchstart", (e) => {
            isDragging = true;
            shiftX = e.touches[0].clientX - sticker.getBoundingClientRect().left;
            shiftY = e.touches[0].clientY - sticker.getBoundingClientRect().top;

            const x = e.touches[0].pageX;
            const y = e.touches[0].pageY;
            moveAt(x, y);

            document.addEventListener("touchmove", onPointerMove, { passive: false });
            document.addEventListener("touchend", onPointerUp);
        }, { passive: true });

        // Double click/tap sticker to scale it! (Rotate/Grow)
        sticker.addEventListener("dblclick", () => {
            let scale = parseFloat(sticker.getAttribute("data-scale"));
            scale = scale === 1.0 ? 1.5 : (scale === 1.5 ? 0.7 : 1.0);
            sticker.setAttribute("data-scale", scale.toString());
            sticker.style.width = `${120 * scale}px`;
            sticker.style.height = `${120 * scale}px`;
            playTapSound(600, 'sine', 0.1);
        });
    }


    /* ==========================================================================
       GIFT 3: INTERACTIVE CANDLE-BLOWING ENGINE
       ========================================================================== */

    candles.forEach((candle) => {
        candle.addEventListener("click", () => {
            const isBlown = candle.getAttribute("data-blown") === "true";
            if (isBlown) return;

            // Extinguish candle
            candle.setAttribute("data-blown", "true");
            candle.classList.add("blown");
            playPuffSound(); // Blowing puff sound effect

            STATE.candlesBlown++;

            if (STATE.candlesBlown === STATE.totalCandles) {
                // Success: All candles blown!
                setTimeout(() => {
                    playTapSound(523.25, 'triangle', 0.2); // Victory burst synth sound
                    triggerConfetti(true, 5000); // Big explosion confetti

                    wishSuccessMessage.classList.remove("hidden");
                    cakeInstruction.textContent = "🎂 Yay! Sweet Birthday Wishes! 🎂";
                }, 400);
            }
        });
    });


    /* ==========================================================================
       PAGES NAVIGATION (LOCKSCREEN -> DASHBOARD -> POLAROID WALL)
       ========================================================================== */

    btnGoToGallery.addEventListener("click", () => {
        playTapSound(493.88, 'sine', 0.1);

        pageDashboard.classList.remove("active");
        pageGallery.classList.add("active");
        STATE.activePage = "page-gallery";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnBackToDashboard.addEventListener("click", () => {
        playTapSound(392.00, 'sine', 0.1);

        pageGallery.classList.remove("active");
        pageDashboard.classList.add("active");
        STATE.activePage = "page-dashboard";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    /* ==========================================================================
       PAGE 3: RETRO POLAROID LIGHTBOX VIEW
       ========================================================================== */

    function registerPolaroidClick(card) {
        card.addEventListener("click", () => {
            // Ignore click if it's the uploader card
            if (card.classList.contains("uploader-card")) return;

            const img = card.querySelector(".polaroid-img");
            const caption = card.querySelector(".polaroid-caption");

            const lightboxImg = document.getElementById("lightbox-img");
            const lightboxCaption = document.getElementById("lightbox-caption");

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxCaption.textContent = caption.textContent;

            playTapSound(440.00, 'sine', 0.08); // Click sound
            openModal(modalLightbox);
        });
    }

    document.querySelectorAll(".polaroid-card").forEach(registerPolaroidClick);


    /* ==========================================================================
       POLAROID LOCAL PHOTO UPLOADER (Loads custom local memory files)
       ========================================================================== */

    let pendingImageSrc = null;

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            pendingImageSrc = event.target.result;
            // Reveal custom uploader caption overlay dialog
            customPrompt.classList.add("active");
            promptInput.value = "";
            promptInput.focus();
            playTapSound(587.33, 'sine', 0.1);
        };
        reader.readAsDataURL(file);
    });

    btnPromptSubmit.addEventListener("click", () => {
        if (!pendingImageSrc) return;

        const captionText = promptInput.value.trim() || "A beautiful memory... 💖";

        // Generate new random tilted Polaroid Card
        const rotation = (Math.random() * 6 - 3).toFixed(1); // tilt between -3deg and 3deg
        const newCard = document.createElement("div");
        newCard.classList.add("polaroid-card");
        newCard.style.setProperty("--rotation", `${rotation}deg`);

        newCard.innerHTML = `
            <div class="polaroid-img-frame">
                <img src="${pendingImageSrc}" alt="${captionText}" class="polaroid-img">
            </div>
            <div class="polaroid-caption">${captionText}</div>
        `;

        // Inject new card directly before the uploader placeholder card
        const uploaderCard = document.querySelector(".uploader-card");
        polaroidWall.insertBefore(newCard, uploaderCard);

        // Setup clicking for this new dynamic memory polaroid card
        registerPolaroidClick(newCard);

        // Reset and close dialog prompt
        customPrompt.classList.remove("active");
        pendingImageSrc = null;
        fileInput.value = ""; // clear file field so same can be added again

        playTapSound(523.25, 'triangle', 0.15); // Success chime
        triggerConfetti(false, 1500);
    });

    btnPromptCancel.addEventListener("click", () => {
        customPrompt.classList.remove("active");
        pendingImageSrc = null;
        fileInput.value = "";
        playTapSound(293.66, 'sine', 0.08);
    });
});
