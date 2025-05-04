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

    // Fix the animation containers
    const happyAnimationContainer = document.getElementById("lottie-happy-animation");
    const sadAnimationContainer = document.getElementById("lottie-sad-animation");
    const celebrationAnimationContainer = document.getElementById("lottie-celebration-animation");

    // Make sure these containers are properly styled
    [happyAnimationContainer, sadAnimationContainer, celebrationAnimationContainer].forEach(container => {
        if (container) {
            container.style.position = "fixed";
            container.style.top = "50%";
            container.style.left = "50%";
            container.style.transform = "translate(-50%, -50%)";
            container.style.width = "300px";
            container.style.height = "300px";
            container.style.zIndex = "1000";
            container.style.pointerEvents = "none";
            container.style.display = "none";
        }
    });

    // Style feedback as overlay - THIS IS THE KEY CHANGE
    if (feedbackElement) {
        feedbackElement.style.position = "absolute";
        feedbackElement.style.top = "90%"; // Position below the clock
        feedbackElement.style.left = "50%";
        feedbackElement.style.transform = "translate(-50%, -50%)";
        feedbackElement.style.zIndex = "999";
        feedbackElement.style.padding = "15px 25px";
        feedbackElement.style.borderRadius = "8px";
        feedbackElement.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        feedbackElement.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        feedbackElement.style.fontWeight = "bold";
        feedbackElement.style.fontSize = "1.2rem";
        feedbackElement.style.textAlign = "center";
        feedbackElement.style.pointerEvents = "none";
        feedbackElement.style.opacity = "0";
        feedbackElement.style.transition = "opacity 0.3s ease";
        feedbackElement.style.maxWidth = "80%"; // Ensure it's not too wide
        feedbackElement.style.display = "flex";
        feedbackElement.style.alignItems = "center";
        feedbackElement.style.justifyContent = "center";
    }

    // Create custom emoji style for the feedback
    const style = document.createElement('style');
    style.textContent = `
        .feedback-emoji {
            font-size: 1.5em;
            margin-right: 10px;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);

    //Loading Animation
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

    // Create confetti
    function createConfetti() {
        confettiContainer.innerHTML = "";
        const colors = [
            "#6366f1",
            "#f59e0b",
            "#10b981",
            "#ef4444",
            "#8b5cf6",
            "#ec4899",
        ];
        const shapes = ["square", "circle"];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement("div");
            confetti.className = "confetti";

            // Random position, color, rotation, shape
            const left = Math.random() * 100;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const size = Math.random() * 10 + 5;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 0.5;

            confetti.style.left = `${left}%`;
            confetti.style.top = "-10px";
            confetti.style.backgroundColor = color;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            confetti.style.borderRadius = shape === "circle" ? "50%" : "0";
            confetti.style.opacity = "0";

            // Animation
            confetti.style.animation = `
                    fadeIn 0.3s ease-out ${delay}s forwards,
                    fall ${duration}s ease-in ${delay}s forwards,
                    spin ${duration * 0.5}s linear ${delay}s infinite
                `;

            // Add keyframes for each confetti piece
            const styleSheet = document.styleSheets[0];
            const fallDistance = Math.random() * 100 + 100;
            const swayAmount = Math.random() * 40 - 20;

            const fallKeyframes = `
                    @keyframes fall {
                        to {
                            transform: translateY(${fallDistance}vh) translateX(${swayAmount}px);
                            opacity: 0;
                        }
                    }
                `;

            const spinKeyframes = `
                    @keyframes spin {
                        to {
                            transform: rotate(${Math.random() < 0.5 ? 360 : -360
                }deg);
                        }
                    }
                `;

            try {
                styleSheet.insertRule(fallKeyframes, styleSheet.cssRules.length);
                styleSheet.insertRule(spinKeyframes, styleSheet.cssRules.length);
            } catch (e) {
                // In case of error with inserting rules
            }

            confettiContainer.appendChild(confetti);
        }

        // Clean up confetti after animation
        setTimeout(() => {
            confettiContainer.innerHTML = "";
        }, 5000);
    }

    // Set up challenge
    function setupChallenge() {
        // Reset feedback
        feedbackElement.className = "feedback";
        feedbackElement.textContent = "";
        feedbackElement.style.opacity = "0"; // Hide feedback

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

    // Make the hands draggable
    let isDragging = false;
    let currentHand = null;
    let startAngle = 0;
    let currentAngle = 0;

    // Helper function to calculate angle from mouse position
    function calculateAngle(element, event) {
        const rect = element.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        return (
            Math.atan2(event.clientY - centerY, event.clientX - centerX) *
            (180 / Math.PI) +
            90
        );
    }

    // Add event listeners to hands
    [hourHand, minuteHand].forEach((hand) => {
        hand.addEventListener("mousedown", function (e) {
            isDragging = true;
            currentHand = hand;
            startAngle = calculateAngle(hand, e);

            // Get current rotation
            const style = window.getComputedStyle(hand);
            const transform = style.getPropertyValue("transform");
            const matrix = new DOMMatrix(transform);
            const currentRotation =
                Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);

            currentAngle = currentRotation;

            e.preventDefault();
        });
    });

    document.addEventListener("mousemove", function (e) {
        if (isDragging && currentHand) {
            const newAngle = calculateAngle(currentHand, e);
            let angleDiff = newAngle - startAngle;

            // Apply the rotation
            currentAngle += angleDiff;
            currentHand.style.transform = `rotate(${currentAngle}deg)`;

            startAngle = newAngle;
        }
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
        currentHand = null;
    });

    // Snap hands to nearest valid position
    function snapHandsToValidPositions() {
        // Get current rotations
        const hourStyle = window.getComputedStyle(hourHand);
        const minuteStyle = window.getComputedStyle(minuteHand);

        const hourTransform = hourStyle.getPropertyValue("transform");
        const minuteTransform = minuteStyle.getPropertyValue("transform");

        const hourMatrix = new DOMMatrix(hourTransform);
        const minuteMatrix = new DOMMatrix(minuteTransform);

        let hourRotation =
            Math.atan2(hourMatrix.b, hourMatrix.a) * (180 / Math.PI);
        let minuteRotation =
            Math.atan2(minuteMatrix.b, minuteMatrix.a) * (180 / Math.PI);

        // Normalize angles to 0-360 range
        hourRotation = ((hourRotation % 360) + 360) % 360;
        minuteRotation = ((minuteRotation % 360) + 360) % 360;

        // Get hour and minute from rotations
        const hour = Math.round(hourRotation / 30) % 12 || 12;
        const minute = Math.round(minuteRotation / 6) % 60;

        return { hour, minute };
    }

    // Create shake animation on the clock
    function shakeClock() {
        const clock = document.querySelector(".clock");
        clock.classList.add("shake");

        // Remove the class after animation completes
        setTimeout(() => {
            clock.classList.remove("shake");
        }, 600);
    }

    // Show feedback overlay
    function showFeedback(message, isCorrect,showCorrectAns=false) {
        feedbackElement.textContent = message;

        // Set color based on correctness
        if (isCorrect) {
            feedbackElement.style.backgroundColor = "rgba(34, 197, 94, 0.9)"; // Green background for correct
            feedbackElement.style.color = "white";
        }
        else if(showCorrectAns){
            feedbackElement.style.backgroundColor = "rgba(58, 110, 208, 0.9)"; // Green background for correct
            feedbackElement.style.color = "white";
        } 
        else {
            feedbackElement.style.backgroundColor = "rgba(239, 68, 68, 0.9)"; // Red background for incorrect
            feedbackElement.style.color = "white";
        }

        // Show feedback
        feedbackElement.style.opacity = "1";

        // For correct answers, hide after 2 seconds
        if (isCorrect) {
            setTimeout(() => {
                feedbackElement.style.opacity = "0";
            }, 2000);
        }
        // For incorrect answers, message will be updated after showing correct time
    }

    // Check answer
    function checkAnswer() {
        const userTime = snapHandsToValidPositions();

        // Calculate hour position considering minutes
        let targetHourPosition = currentTargetHour;
        if (targetHourPosition === 12) targetHourPosition = 0;
        targetHourPosition = targetHourPosition + currentTargetMinute / 60;

        let userHourPosition = userTime.hour;
        if (userHourPosition === 12) userHourPosition = 0;
        userHourPosition = userHourPosition + userTime.minute / 60;

        // Allow for some tolerance in the hour hand position
        const hourTolerance = 0.25; // 15 minutes tolerance

        // Check if the answer is correct
        const isHourCorrect =
            Math.abs(targetHourPosition - userHourPosition) < hourTolerance ||
            Math.abs(targetHourPosition - userHourPosition) > 11.75;
        const isMinuteCorrect = currentTargetMinute === userTime.minute;

        const isCorrect = isHourCorrect && isMinuteCorrect;

        // Disable next challenge button during animations
        nextChallengeBtn.style.display = "none";
        checkAnswerBtn.style.display = "none";

        // Show feedback as overlay
        if (isCorrect) {
            showFeedback(`Correct! That's ${formatTime(
                currentTargetHour,
                currentTargetMinute
            )}.`, true);

            correctAnswers++;
            happyAnimationContainer.style.display = "block";
            happyAnimation.stop();
            happyAnimation.goToAndPlay(0, true);

            happyAnimation.addEventListener(
                "complete",
                function () {
                    happyAnimationContainer.style.display = "none";

                    // Only enable next challenge button after animation completes
                    if (currentChallenge < totalChallenges - 1) {
                        nextChallengeBtn.style.display = "inline-block";
                    } else {
                        // Show results
                        setTimeout(() => showResults(), 1000);
                    }
                },
                { once: true }
            );
        } else {
            showFeedback("Oops! You got it wrong.", false);

            sadAnimationContainer.style.display = "block";
            sadAnimation.stop();
            sadAnimation.goToAndPlay(0, true);

            sadAnimation.addEventListener("complete", function () {
                sadAnimationContainer.style.display = "none";

                // Begin shake animation
                shakeClock();

                // After the shake animation, show the correct time on the clock
                setTimeout(() => {
                    // Calculate the correct angles for hour and minute hands
                    const hourAngle =
                        (currentTargetHour % 12) * 30 + currentTargetMinute * 0.5; // Each hour is 30 degrees, and minute adds small adjustment
                    const minuteAngle = currentTargetMinute * 6; // Each minute is 6 degrees

                    // Animate the hands to the correct positions
                    animateHandToPosition(hourHand, hourAngle);
                    animateHandToPosition(minuteHand, minuteAngle);

                    // Update feedback to show correct answer message
                    setTimeout(() => {
                        showFeedback(`This is the correct answer`, false,true);

                        // Wait for the user to see the correct answer before allowing to continue
                        setTimeout(() => {
                            feedbackElement.style.opacity = "0";
                            // Only show next challenge button after everything is complete
                            if (currentChallenge < totalChallenges - 1) {
                                nextChallengeBtn.style.display = "inline-block";
                            } else {
                                // Show results
                                setTimeout(() => showResults(), 1000);
                            }
                        }, 3000);
                    }, 800); // Show message after the hands have animated to correct position
                }, 700); // Start after shake animation completes

            })


        }

        // Function to animate a hand to the correct position
        function animateHandToPosition(hand, targetAngle) {
            // Get current rotation
            const style = window.getComputedStyle(hand);
            const transform = style.getPropertyValue("transform");
            const matrix = new DOMMatrix(transform);
            let currentAngle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);

            // Normalize angles
            currentAngle = ((currentAngle % 360) + 360) % 360;
            targetAngle = ((targetAngle % 360) + 360) % 360;

            // Determine the shortest direction to rotate
            let angleDiff = targetAngle - currentAngle;
            if (Math.abs(angleDiff) > 180) {
                if (angleDiff > 0) {
                    angleDiff -= 360;
                } else {
                    angleDiff += 360;
                }
            }

            // Smooth animation to target angle
            const startTime = performance.now();
            const duration = 800; // 800ms animation

            function updateHandPosition(time) {
                const elapsed = time - startTime;
                if (elapsed < duration) {
                    const progress = elapsed / duration;
                    // Ease-out function for smoother ending
                    const easeOut = 1 - Math.pow(1 - progress, 2);
                    const newAngle = currentAngle + angleDiff * easeOut;
                    hand.style.transform = `rotate(${newAngle}deg)`;
                    requestAnimationFrame(updateHandPosition);
                } else {
                    // Ensure we land exactly on target
                    hand.style.transform = `rotate(${targetAngle}deg)`;
                }
            }

            requestAnimationFrame(updateHandPosition);
        }

        // Update progress dots
        const progressDots = document.querySelectorAll(".progress-dot");
        progressDots[currentChallenge].classList.remove("active");
        progressDots[currentChallenge].classList.add(
            isCorrect ? "correct" : "incorrect"
        );

        // Note: Button display and next challenge logic is now handled in the animation complete handlers above
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
            message =
                "Good effort! Keep practicing to improve your time-telling skills.";
        } else {
            message =
                "Keep practicing! Time-telling takes practice, and you'll get better.";
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

        // Start game after loading animation
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

        // Reset game state
        currentChallenge = 0;
        correctAnswers = 0;

        // Generate new challenges and start
        generateChallenges();
        setupChallenge();
    });
});