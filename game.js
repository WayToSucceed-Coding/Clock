document.addEventListener("DOMContentLoaded", function () {
    // Game variables
    const totalChallenges = 5;
    let currentChallenge = 0;
    let correctAnswers = 0;
    let challenges = [];
    let currentTargetHour = 0;
    let currentTargetMinute = 0;

    // DOM elements
    const startScreen = document.querySelector(".start-screen");
    const gameScreen = document.querySelector(".game-screen");
    const resultsScreen = document.getElementById("results");
    const targetTimeDisplay = document.getElementById("target-time");
    const hourHand = document.getElementById("hour-hand");
    const minuteHand = document.getElementById("minute-hand");
    const checkAnswerBtn = document.getElementById("check-answer");
    const nextChallengeBtn = document.getElementById("next-challenge");
    const startGameBtn = document.getElementById("start-game");
    const playAgainBtn = document.getElementById("play-again");
    const feedbackElement = document.getElementById("feedback");
    const progressContainer = document.getElementById("progress");
    const finalScoreElement = document.getElementById("final-score");
    const completionMessage = document.getElementById("completion-message");
    const confettiContainer = document.getElementById("confetti-container");
    const celebration = document.querySelector(".animation");
    const clock = document.querySelector('.clock');

    // Fix the animation containers
    const happyAnimationContainer = document.getElementById("lottie-happy-animation");
    const sadAnimationContainer = document.getElementById("lottie-sad-animation");
    const celebrationAnimationContainer = document.getElementById("lottie-celebration-animation");

    // Make sure these containers are properly styled
    happyAnimationContainer.classList.add('lottie-animation-container');
    sadAnimationContainer.classList.add('lottie-animation-container');
    feedbackElement.classList.add('feedback');

    // Loading Animation
    var happyAnimation = lottie.loadAnimation({
        container: document.getElementById("lottie-happy-animation"),
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "assets/correct.json",
    });

    var sadAnimation = lottie.loadAnimation({
        container: document.getElementById("lottie-sad-animation"),
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "assets/sad.json",
    });

    // Create numbers
    const hourMarks = document.getElementById("hour-marks");

    for (let i = 0; i < 12; i++) {
        // Create hour number
        const hourNumber = document.createElement("div");
        hourNumber.className = "hour-number";
        const angle = i * 30;
        const radians = (angle - 90) * (Math.PI / 180);
        const radius = 120;
        const x = Math.cos(radians) * radius + 150;
        const y = Math.sin(radians) * radius + 150;

        hourNumber.style.left = `${x - 30}px`;
        hourNumber.style.top = `${y - 30}px`;
        hourNumber.textContent = i === 0 ? "12" : i.toString();
        hourMarks.appendChild(hourNumber);
    }

    // Create progress dots
    for (let i = 0; i < totalChallenges; i++) {
        const dot = document.createElement("div");
        dot.className = "progress-dot";
        progressContainer.appendChild(dot);
    }

    // Generate challenges
    function generateChallenges() {
        challenges = [];

        // Create an array of hours (1-12) and minutes (0, 15, 30, 45)
        const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const minutes = [0, 15, 30, 45];

        // Shuffle arrays
        shuffleArray(hours);

        // Create unique challenges
        for (let i = 0; i < totalChallenges; i++) {
            const hour = hours[i % hours.length];
            const minute = minutes[Math.floor(Math.random() * minutes.length)];
            challenges.push({ hour, minute });
        }

        console.log(challenges);
    }

    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Format time for display
    function formatTime(hour, minute) {
        return `${hour}:${minute.toString().padStart(2, "0")}`;
    }


    // Set up challenge
    function setupChallenge() {
        // Reset feedback
        feedbackElement.className = "feedback";
        feedbackElement.textContent = "";
        feedbackElement.style.opacity = "0";

        // Get current challenge
        const challenge = challenges[currentChallenge];
        console.log(challenge);
        currentTargetHour = challenge.hour;
        currentTargetMinute = challenge.minute;

        // Set target time display
        targetTimeDisplay.textContent = `Set the clock to: ${formatTime(
            currentTargetHour,
            currentTargetMinute
        )}`;

        // Reset hands to random positions
        const randomHourAngle = Math.floor(Math.random() * 360);
        const randomMinuteAngle = Math.floor(Math.random() * 360);

        hourHand.style.transform = `rotate(${randomHourAngle}deg)`;
        minuteHand.style.transform = `rotate(${randomMinuteAngle}deg)`;

        // Update progress dots
        const progressDots = document.querySelectorAll(".progress-dot");
        progressDots.forEach((dot, index) => {
            dot.className = "progress-dot";
            if (index < currentChallenge) {
                dot.classList.add(
                    index < correctAnswers ? "correct" : "incorrect"
                );
            } else if (index === currentChallenge) {
                dot.classList.add("active");
            }
        });

        // Update buttons
        checkAnswerBtn.style.display = "inline-block";
        nextChallengeBtn.style.display = "none";
    }

    // ENHANCED DRAGGING SYSTEM
    let isDragging = false;
    let currentHand = null;
    let dragStartAngle = 0;
    let handStartAngle = 0;
    let lastAngle = 0;
    let animationFrame = null;

    // Improved coordinate extraction
    function getEventCoords(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        } else {
            return { x: e.clientX, y: e.clientY };
        }
    }

    // Enhanced angle calculation with better precision
    function calculateAngle(hand, e) {
        const { x, y } = getEventCoords(e);
        const clockContainer = hand.closest('.clock') || hand.parentElement;
        const rect = clockContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
        return (angle + 360) % 360; // Normalize to 0-360
    }

    // Get current hand rotation
    function getCurrentRotation(hand) {
        const style = window.getComputedStyle(hand);
        const transform = style.getPropertyValue("transform");
        const matrix = new DOMMatrix(transform);
        const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        return (angle + 360) % 360; // Normalize to 0-360
    }

    // Smooth angle difference calculation
    function getAngleDifference(from, to) {
        let diff = to - from;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        return diff;
    }

    // Enhanced drag start
    function startDragging(e, hand) {
        e.preventDefault();
        e.stopPropagation();

        isDragging = true;
        currentHand = hand;

        // Remove any existing transitions
        hand.classList.remove('smooth-transition');
        hand.classList.add('no-transition');

        // Get initial angles
        dragStartAngle = calculateAngle(hand, e);
        handStartAngle = getCurrentRotation(hand);
        lastAngle = handStartAngle;

        // During dragging
        document.body.classList.add('body-dragging');
        currentHand.classList.add('hand-dragging')
    }

    // Enhanced drag handling with smooth animation
    function handleDragging(e) {
        if (!isDragging || !currentHand) return;

        e.preventDefault();
        e.stopPropagation();

        // Cancel any existing animation frame
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        // Calculate new angle
        const currentPointerAngle = calculateAngle(currentHand, e);
        const angleDiff = getAngleDifference(dragStartAngle, currentPointerAngle);
        let newAngle = handStartAngle + angleDiff;

        // Normalize angle
        newAngle = (newAngle + 360) % 360;

        // Smooth interpolation for ultra-smooth movement
        const smoothingFactor = 0.8;
        const interpolatedAngle = lastAngle + (newAngle - lastAngle) * smoothingFactor;

        // Use requestAnimationFrame for smooth updates
        animationFrame = requestAnimationFrame(() => {
            currentHand.style.transform = `rotate(${interpolatedAngle}deg)`;
            lastAngle = interpolatedAngle;
        });
    }

    // Enhanced drag stop with snapping
    function stopDragging(e) {
        if (!isDragging || !currentHand) return;

        e.preventDefault();
        e.stopPropagation();

        // Cancel animation frame
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }

        // Get final angle and apply smart snapping
        const finalAngle = getCurrentRotation(currentHand);
        let snappedAngle;

        if (currentHand === minuteHand) {
            // Snap minute hand to nearest 5-minute mark (30-degree intervals)
            snappedAngle = Math.round(finalAngle / 30) * 30;
        } else {
            // Snap hour hand to nearest hour mark with finer precision
            snappedAngle = Math.round(finalAngle / 30) * 30;
        }

        // Smooth transition to snapped position
        currentHand.classList.add('smooth-transition');
        currentHand.style.transform = `rotate(${snappedAngle}deg)`;

        // Remove visual feedback
        currentHand.style.cursor = 'grab';
        currentHand.style.filter = 'none';

        // Clean up
        setTimeout(() => {
            currentHand.classList.remove('smooth-transition');
            isDragging = false;
            currentHand = null;

            // Re-enable scrolling and selection
            document.body.style.userSelect = '';
            document.body.style.touchAction = '';
            document.body.style.overflow = '';
        }, 200);


    }

    // Enhanced hand styling and event listeners
    [hourHand, minuteHand].forEach((hand) => {
        // Add class for CSS targeting
        hand.classList.add('clock-hand');

        // Improve hand styling
        hand.style.cursor = 'grab';
        hand.style.transformOrigin = 'center bottom';
        hand.style.willChange = 'transform';

        // Mouse events
        hand.addEventListener("mousedown", function (e) {
            startDragging(e, hand);
        });

        // Touch events
        hand.addEventListener("touchstart", function (e) {
            startDragging(e, hand);
        }, { passive: false });

        // Prevent context menu
        hand.addEventListener("contextmenu", function (e) {
            e.preventDefault();
        });
    });

    // Global event listeners
    document.addEventListener("mousemove", handleDragging, { passive: false });
    document.addEventListener("mouseup", stopDragging, { passive: false });
    document.addEventListener("touchmove", handleDragging, { passive: false });
    document.addEventListener("touchend", stopDragging, { passive: false });
    document.addEventListener("touchcancel", stopDragging, { passive: false });

    // Prevent gesture events
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(eventType => {
        document.addEventListener(eventType, function (e) {
            e.preventDefault();
        });
    });

    // ENHANCED ANSWER CHECKING WITH BETTER TOLERANCE
    function snapHandsToValidPositions() {
        const hourRotation = getCurrentRotation(hourHand);
        const minuteRotation = getCurrentRotation(minuteHand);

        // Convert rotations to time with better precision
        const hour = Math.round(hourRotation / 30) % 12 || 12;
        const minute = Math.round(minuteRotation / 6) % 60;

        return { hour, minute, hourRotation, minuteRotation };
    }

    // Enhanced answer checking with flexible tolerance
    function checkAnswer() {
        const userTime = snapHandsToValidPositions();

        // Calculate target positions
        const targetHourAngle = (currentTargetHour % 12) * 30 + currentTargetMinute * 0.5;
        const targetMinuteAngle = currentTargetMinute * 6;

        // Calculate hour position tolerance (more flexible)
        const hourAngleDiff = Math.abs(getAngleDifference(targetHourAngle, userTime.hourRotation));
        const minuteAngleDiff = Math.abs(getAngleDifference(targetMinuteAngle, userTime.minuteRotation));

        // Enhanced tolerance system
        const HOUR_TOLERANCE = 20; // degrees (about 40 minutes worth)
        const MINUTE_TOLERANCE = 15; // degrees (2.5 minutes worth)

        const isHourCorrect = hourAngleDiff <= HOUR_TOLERANCE;
        const isMinuteCorrect = minuteAngleDiff <= MINUTE_TOLERANCE;

        // Alternative check: exact time matching with minute tolerance
        const hourMatch = Math.abs(currentTargetHour - userTime.hour) <= 0 ||
            Math.abs(currentTargetHour - userTime.hour) >= 11;
        const minuteDiff = Math.abs(currentTargetMinute - userTime.minute);
        const minuteMatch = minuteDiff <= 5 || minuteDiff >= 55; // 5-minute tolerance

        const isCorrect = (isHourCorrect && isMinuteCorrect) || (hourMatch && minuteMatch);

        console.log('Answer check:', {
            target: { hour: currentTargetHour, minute: currentTargetMinute },
            user: userTime,
            angles: {
                targetHour: targetHourAngle,
                targetMinute: targetMinuteAngle,
                userHour: userTime.hourRotation,
                userMinute: userTime.minuteRotation
            },
            differences: { hour: hourAngleDiff, minute: minuteAngleDiff },
            correct: isCorrect
        });

        // Disable buttons during animations
        nextChallengeBtn.style.display = "none";
        checkAnswerBtn.style.display = "none";

        // Show feedback as overlay
        if (isCorrect) {
            showFeedback(`Correct! That's ${formatTime(
                currentTargetHour,
                currentTargetMinute
            )}.`, true);

            clock.style.display = 'none';
            correctAnswers++;
            happyAnimationContainer.style.display = "block";
            happyAnimation.stop();
            happyAnimation.goToAndPlay(0, true);

            happyAnimation.addEventListener(
                "complete",
                function () {
                    happyAnimationContainer.style.display = "none";
                    clock.style.display = 'block';

                    if (currentChallenge < totalChallenges - 1) {
                        nextChallengeBtn.style.display = "inline-block";
                    } else {
                        showResults()
                    }
                },
                { once: true }
            );
        } else {
            showFeedback("Oops! You got it wrong.", false);
            clock.style.display = 'none';
            sadAnimationContainer.style.display = "block";
            sadAnimation.stop();
            sadAnimation.goToAndPlay(0, true);

            sadAnimation.addEventListener("complete", function () {
                sadAnimationContainer.style.display = "none";
                clock.style.display = 'block';

                shakeClock();

                setTimeout(() => {
                    const hourAngle = (currentTargetHour % 12) * 30 + currentTargetMinute * 0.5;
                    const minuteAngle = currentTargetMinute * 6;

                    animateHandToPosition(hourHand, hourAngle);
                    animateHandToPosition(minuteHand, minuteAngle);

                    setTimeout(() => {
                        showFeedback(`This is the correct answer`, false, true);

                        setTimeout(() => {
                            feedbackElement.style.opacity = "0";
                            if (currentChallenge < totalChallenges - 1) {
                                nextChallengeBtn.style.display = "inline-block";
                            } else {
                                setTimeout(() => showResults(), 1000);
                            }
                        }, 3000);
                    }, 800);
                }, 700);
            }, { once: true });
        }

        // Update progress dots
        const progressDots = document.querySelectorAll(".progress-dot");
        progressDots[currentChallenge].classList.remove("active");
        progressDots[currentChallenge].classList.add(
            isCorrect ? "correct" : "incorrect"
        );
    }

    // Create shake animation on the clock
    function shakeClock() {
        clock.classList.add("shake");
        setTimeout(() => {
            clock.classList.remove("shake");
        }, 600);
    }

    // Show feedback overlay
    function showFeedback(message, isCorrect, showCorrectAns = false) {
        feedbackElement.textContent = message;

        if (isCorrect) {
            feedbackElement.style.backgroundColor = "rgba(34, 197, 94, 0.9)";
            feedbackElement.style.color = "white";
        } else if (showCorrectAns) {
            feedbackElement.style.backgroundColor = "rgba(58, 110, 208, 0.9)";
            feedbackElement.style.color = "white";
        } else {
            feedbackElement.style.backgroundColor = "rgba(239, 68, 68, 0.9)";
            feedbackElement.style.color = "white";
        }

        feedbackElement.style.opacity = "1";

        if (isCorrect) {
            setTimeout(() => {
                feedbackElement.style.opacity = "0";
            }, 2000);
        }
    }

    // Enhanced hand animation
    function animateHandToPosition(hand, targetAngle) {
        const currentAngle = getCurrentRotation(hand);

        // Calculate shortest path (account for circular nature)
        let angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
        angleDiff = angleDiff < -180 ? angleDiff + 360 : angleDiff;

        const startTime = performance.now();
        const duration = 800; // Reduced duration for snappier animation

        function updateHandPosition(time) {
            const elapsed = time - startTime;
            if (elapsed < duration) {
                const progress = elapsed / duration;
                // Smoother easing function
                const easeOut = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const newAngle = currentAngle + angleDiff * easeOut;
                hand.style.transform = `rotate(${newAngle}deg)`;
                requestAnimationFrame(updateHandPosition);
            } else {
                hand.style.transform = `rotate(${targetAngle}deg)`;
            }
        }

        requestAnimationFrame(updateHandPosition);
    }
    // Show results
    function showResults() {
        gameScreen.style.display = "none";
        resultsScreen.style.display = "block";

        finalScoreElement.textContent = `Your score: ${correctAnswers} / ${totalChallenges}`;

        let message = "";
        const percentage = (correctAnswers / totalChallenges) * 100;

        if (percentage === 100) {
            message = "Perfect! You're a time-telling master!";
        } else if (percentage >= 80) {
            message = "Great job! You're really good at telling time!";
        } else if (percentage >= 60) {
            message = "Good effort! Keep practicing to improve your time-telling skills.";
        } else {
            message = "Keep practicing! Time-telling takes practice, and you'll get better.";
        }

        completionMessage.textContent = message;
    }

    // Loading animation
    function simulateLoading() {
        const loadingScreen = document.getElementById("loading-screen");
        const loadingBar = document.getElementById("loading-bar");

        let width = 0;
        const interval = setInterval(function () {
            if (width >= 100) {
                clearInterval(interval);
                loadingScreen.classList.add("fade-out");
                setTimeout(function () {
                    loadingScreen.style.display = "none";
                }, 500);
            } else {
                width += 2;
                loadingBar.style.width = width + "%";
            }
        }, 40);
    }

    // Hide loading screen initially
    document.getElementById("loading-screen").style.display = "none";

    // Event listeners
    startGameBtn.addEventListener("click", function () {
        startScreen.style.display = "none";
        document.getElementById("loading-screen").style.display = "flex";
        simulateLoading();

        setTimeout(function () {
            generateChallenges();
            setupChallenge();
            gameScreen.style.display = "flex";
        }, 2500);
    });

    checkAnswerBtn.addEventListener("click", checkAnswer);

    nextChallengeBtn.addEventListener("click", function () {
        currentChallenge++;
        setupChallenge();
    });

    playAgainBtn.addEventListener("click", function () {
        resultsScreen.style.display = "none";
        gameScreen.style.display = "block";

        currentChallenge = 0;
        correctAnswers = 0;

        generateChallenges();
        setupChallenge();
    });
});