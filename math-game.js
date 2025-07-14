/**
 * Project: Math Brain Workout Game
 * Based on: https://kaopanboonyuen.github.io/
 * Developed by: Kao Panboonyuen
 * Date: July 2025
 *
 * This script generates math expressions of varying difficulty levels,
 * ensuring integer and positive results. It challenges users to solve
 * the expressions within a timed prompt interface.
 */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a group of terms with same operator (e.g., + + +)
function generateGroup(difficulty) {
  let range, minTerms, maxTerms;
  if (difficulty === "easy") {
    range = [1, 10];
    minTerms = 2;
    maxTerms = 3;
  } else if (difficulty === "medium") {
    range = [5, 50];
    minTerms = 3;
    maxTerms = 4;
  } else {
    range = [10, 100];
    minTerms = 3;
    maxTerms = 4;
  }

  const operators = ["+", "-", "*", "/"];
  let op = operators[Math.floor(Math.random() * operators.length)];
  let termCount = getRandomInt(minTerms, maxTerms);
  let nums = [];

  if (op === "/") {
    // To keep integer positive result for division:
    // generate the last term first, then multiply by random divisors
    let lastTerm = getRandomInt(range[0], range[1]);
    nums.push(lastTerm);
    for (let i = 1; i < termCount; i++) {
      let divisor = getRandomInt(1, range[1]);
      nums[0] *= divisor;
      nums.push(divisor);
    }
  } else if (op === "-") {
    // For subtraction, generate terms in descending order to keep result positive
    for (let i = 0; i < termCount; i++) {
      nums.push(getRandomInt(range[0], range[1]));
    }
    nums.sort((a, b) => b - a);
  } else {
    // For + and * just generate random terms normally
    for (let i = 0; i < termCount; i++) {
      nums.push(getRandomInt(range[0], range[1]));
    }
  }

  let expr = nums[0].toString();
  for (let i = 1; i < nums.length; i++) {
    expr += ` ${op} ${nums[i]}`;
  }

  let answer = eval(expr);

  // Reject if not integer or negative or zero or greater than 10,000
  if (!Number.isInteger(answer) || answer < 1 || answer > 10000) return null;

  return { expr, answer, op };
}

function generateQuestion(difficulty) {
  while (true) {
    let groupCount = difficulty === "hard" ? 3 : 2;
    let groups = [];

    for (let i = 0; i < groupCount; i++) {
      let group = null;
      let attempts = 0;
      while (!group) {
        group = generateGroup(difficulty);
        attempts++;
        if (attempts > 100) break; // avoid infinite loop
      }
      if (!group) break; // fail safe
      groups.push(group);
    }
    if (groups.length !== groupCount) continue;

    const possibleOps = ["+", "-", "*"];
    let betweenOps = [];
    for (let i = 0; i < groupCount - 1; i++) {
      // Avoid same operator as group to mix it up
      let ops = possibleOps.filter((o) => o !== groups[i].op);
      let op = ops[Math.floor(Math.random() * ops.length)];
      betweenOps.push(op);
    }

    let question =
      groups[0].expr.length > 1 ? `(${groups[0].expr})` : groups[0].expr;
    let currentValue = groups[0].answer;

    for (let i = 1; i < groupCount; i++) {
      let op = betweenOps[i - 1];
      let g = groups[i];
      let exprPart = g.expr.length > 1 ? `(${g.expr})` : g.expr;
      let val = g.answer;

      if (op === "+") currentValue += val;
      else if (op === "-") currentValue -= val;
      else if (op === "*") currentValue *= val;

      question += ` ${op} ${exprPart}`;
    }

    // Ensure final answer integer and between 1 and 10,000
    if (
      Number.isInteger(currentValue) &&
      currentValue >= 1 &&
      currentValue <= 10000
    ) {
      return { question, answer: currentValue };
    }
  }
}

function askQuestion(difficulty) {
  const { question, answer } = generateQuestion(difficulty);
  const startTime = Date.now();

  // Create overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";

  // Create modal
  const modal = document.createElement("div");
  modal.style.backgroundColor = "#fff";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.width = "90%";
  modal.style.maxWidth = "500px";
  modal.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
  modal.style.fontFamily = "sans-serif";
  modal.style.whiteSpace = "pre-line";
  modal.style.fontSize = "16px";
  modal.style.lineHeight = "1.5";
  modal.style.position = "relative";

  // Question text with typing effect
  const questionEl = document.createElement("div");
  questionEl.style.marginBottom = "20px";
  modal.appendChild(questionEl);

  const questionText = `🧠 Ready? Solve:\n${question}`;
  let i = 0;

  function typeQuestion(callback) {
    if (i < questionText.length) {
      questionEl.textContent += questionText.charAt(i);
      i++;
      setTimeout(() => typeQuestion(callback), 25); // adjust typing speed here
    } else {
      callback();
    }
  }

  // Multiple choice container (hidden until typing is done)
  const choicesContainer = document.createElement("div");
  choicesContainer.style.display = "grid";
  choicesContainer.style.gridTemplateColumns = "1fr 1fr";
  choicesContainer.style.gap = "10px";
  choicesContainer.style.marginTop = "20px";
  modal.appendChild(choicesContainer);

  // Feedback display
  const feedback = document.createElement("div");
  feedback.style.marginTop = "20px";
  feedback.style.fontWeight = "bold";
  modal.appendChild(feedback);

  // Generate 3 fake answers close to the real one
  let choices = new Set();
  choices.add(answer);

  while (choices.size < 4) {
    let offset = getRandomInt(-10, 10);
    let fake = answer + offset;
    if (fake !== answer && fake > 0 && fake <= 10000) {
      choices.add(fake);
    }
  }

  const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);

  function showChoices() {
    shuffled.forEach((choiceVal, index) => {
      const btn = document.createElement("button");
      btn.textContent = choiceVal;
      btn.style.padding = "10px";
      btn.style.fontSize = "16px";
      btn.style.border = "2px solid #ccc";
      btn.style.borderRadius = "6px";
      btn.style.cursor = "pointer";
      btn.style.opacity = "0";
      btn.style.transform = "translateY(10px)";
      btn.style.transition = "all 0.4s ease";

      btn.onclick = () => {
        const endTime = Date.now();
        const timeUsed = ((endTime - startTime) / 1000).toFixed(2);

        function typeFeedback(feedbackText, color) {
          let i = 0;
          feedback.textContent = "";
          feedback.style.color = color;

          function type() {
            if (i < feedbackText.length) {
              feedback.textContent += feedbackText.charAt(i);
              i++;
              setTimeout(type, 40);
            }
          }

          type();
        }

        if (parseInt(choiceVal) === answer) {
          typeFeedback(
            `✅ Fantastic! You got it right! 🎉\n⏱️ Time taken: ${timeUsed}s\nKeep up the great work — you’re doing amazing! 💪\n\nWith encouragement,\nKao Panboonyuen 💚`,
            "green"
          );
        } else {
          typeFeedback(
            `❌ Almost there! Don’t worry, mistakes help us learn. 🌟\nThe correct answer was: ${answer}\n⏱️ Time taken: ${timeUsed}s\nGive it another try — you’ve got this! 🚀\n\nCheering you on,\nKao Panboonyuen 💚`,
            "red"
          );
        }

        // Disable all buttons after answer
        Array.from(choicesContainer.children).forEach(
          (b) => (b.disabled = true)
        );

        // Add close button
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        closeBtn.style.marginTop = "15px";
        closeBtn.style.padding = "8px 12px";
        closeBtn.style.border = "none";
        closeBtn.style.borderRadius = "4px";
        closeBtn.style.backgroundColor = "#2196F3";
        closeBtn.style.color = "#fff";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => document.body.removeChild(overlay);
        modal.appendChild(closeBtn);
      };

      choicesContainer.appendChild(btn);

      // Animate after appending (staggered delay)
      setTimeout(() => {
        btn.style.opacity = "1";
        btn.style.transform = "translateY(0)";
      }, 150 * index);
    });
  }

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Start typing and reveal choices after
  typeQuestion(showChoices);
}

function startGame() {
  const greetings = [
    (date) =>
      `🌞 Today is ${date}. I hope you're feeling inspired and ready to shine ✨.`,
    (date) => `${date} — a fresh new day to do your best and feel proud 💪😊.`,
    (date) => `It’s ${date}. Remember, every step forward counts 👣🔥.`,
    (date) => `🎉 Happy ${date}! You've got what it takes to succeed 🚀💯.`,
    (date) =>
      `On this beautiful ${date}, take a breath and believe in yourself 🌸💖.`,
    (date) =>
      `${date} brings new energy ⚡. Keep pushing and keep smiling 😄👍.`,
    (date) =>
      `Hey there! ${date} is full of opportunities and good vibes 🌈✨.`,
    (date) =>
      `Wishing you strength and clarity this ${date} 💡💪. You've got this!`,
    (date) =>
      `Take on ${date} with courage and joy 🦸‍♂️😄. You're doing amazing!`,
    (date) => `Step into ${date} with confidence 🚶‍♀️🌟. Great things are ahead!`,
    (date) => `${date} is a perfect day to grow stronger and brighter 🌱🌞.`,
    (date) =>
      `Hope you're feeling grounded and focused this ${date} 🧘‍♀️🎯. Keep going!`,
    (date) =>
      `Breathe in calm and confidence this ${date} 🌬️😌. You're doing great!`,
    (date) => `Let the energy of ${date} lift you up 🚀💫. You've got this!`,
    (date) => `This ${date}, remember how far you’ve come 🏆🙌. Keep rising!`,
    // date => `May ${date} bring peace to your heart and clarity to your mind 🕊️💭.`,
    (date) => `${date} is yours to shape 🛠️✨. Stay strong and stay kind ❤️🤝.`,
    (date) =>
      `Embrace the pace of progress this ${date} 🐢➡️🐇. One step at a time!`,
    (date) => `Sending you good vibes and steady focus this ${date} ✨🎯.`,
    (date) =>
      `Let ${date} be a gentle reminder that you're capable of amazing things 🌟💖.`,
    (date) =>
      `🌟 Rise and shine! ${date} is here to bring you endless possibilities and joyful moments 🌈✨.`,
    (date) =>
      `Good vibes only this ${date}! Let your passion light up the day like fireworks 🎆🔥.`,
    (date) =>
      `Cheers to ${date}! Hope your energy is as unstoppable as a comet streaking across the sky ☄️🚀.`,
    (date) =>
      `Hello ${date}! Step boldly into today with a heart full of courage and a smile that lights up the room 😄💫.`,
    (date) =>
      `🌺 On this lovely ${date}, nurture your dreams and watch them bloom into reality 🌸🌻.`,
    (date) =>
      `Keep your head high and spirits higher this ${date} — you’re making magic happen ✨🪄.`,
    (date) =>
      `It’s ${date}, the perfect day to sparkle and show the world your unique brilliance ✨🌟.`,
    (date) =>
      `Sending you a sunshine-filled ${date} ☀️ and a breeze of calm to carry you through with ease 🍃💨.`,
    (date) =>
      `Every moment of ${date} is a gift wrapped in hope, courage, and smiles 🎁😊. Unwrap it fully!`,
    (date) =>
      `💪 Power through this ${date} with unstoppable confidence and a heart full of gratitude 🙌❤️.`,
    (date) =>
      `Today’s ${date} mission: embrace challenges like a hero and celebrate every victory 🦸‍♀️🏅.`,
    (date) =>
      `🌈 Let the colors of ${date} brighten your soul and inspire your every step 🎨👣.`,
    (date) =>
      `Wishing you a sparkling ${date} filled with laughter, learning, and limitless potential 😄📚🚀.`,
    (date) =>
      `Open your arms wide for ${date} — a day ready to fill you with joy, growth, and endless possibility 🤗🌱.`,
    (date) =>
      `Smile big this ${date}! Your enthusiasm is contagious and your energy unstoppable 😁⚡.`,
    (date) =>
      `🌟 Shine bright like a diamond today, ${date}. Your unique light makes the world better 💎✨.`,
    // date => `May ${date} be sprinkled with kindness, courage, and countless moments that make your heart sing 🎶💖.`,
    (date) =>
      `💫 Today’s ${date} vibes: dream big, work hard, and enjoy every step of your incredible journey 🚀🌍.`,
    (date) =>
      `Feel the power of possibility on this ${date}. You have everything it takes to turn dreams into reality 🌟🛤️.`,
    (date) =>
      `Happy ${date}! Keep your spirit fierce, your smile wide, and your heart open to wonder 🦋😊✨.`,
  ];

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const greetingMessage =
    greetings[Math.floor(Math.random() * greetings.length)](today);
  const fullMessage = `Hi! Kao here 😄 Glad to see you!\n\n${greetingMessage}\n\nReady for a brain workout? 💡\nChoose difficulty: easy, medium, or hard`;

  showTypingPopup(fullMessage);
}
function showTypingPopup(message) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "9999";

  const modal = document.createElement("div");
  modal.style.backgroundColor = "#fff";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.width = "90%";
  modal.style.maxWidth = "500px";
  modal.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
  modal.style.fontFamily = "sans-serif";
  modal.style.whiteSpace = "pre-line";
  modal.style.fontSize = "16px";
  modal.style.lineHeight = "1.5";
  modal.style.position = "relative";

  const messageEl = document.createElement("div");
  modal.appendChild(messageEl);

  const inputSection = document.createElement("div");
  inputSection.style.marginTop = "20px";
  inputSection.style.display = "none";
  inputSection.style.textAlign = "center";

  // Difficulty buttons
  const difficulties = ["easy", "medium", "hard"];
  let selectedDifficulty = null;

  const buttonsWrapper = document.createElement("div");
  buttonsWrapper.style.marginBottom = "15px";

  difficulties.forEach((level) => {
    const btn = document.createElement("button");
    btn.textContent = level.charAt(0).toUpperCase() + level.slice(1);
    btn.dataset.difficulty = level;

    btn.style.margin = "0 10px";
    btn.style.padding = "10px 20px";
    btn.style.border = "none";
    btn.style.borderRadius = "5px";
    btn.style.backgroundColor = "#eee";
    btn.style.cursor = "pointer";
    btn.style.transition = "all 0.3s";
    btn.style.fontWeight = "bold";
    btn.style.textTransform = "capitalize";

    btn.onclick = () => {
      // Reset all buttons
      Array.from(buttonsWrapper.children).forEach((b) => {
        b.style.backgroundColor = "#eee";
        b.style.color = "#000";
        b.style.boxShadow = "none";
      });

      // Highlight selected button
      btn.style.backgroundColor = "#4CAF50";
      btn.style.color = "#fff";
      btn.style.boxShadow = "0 0 8px rgba(0, 0, 0, 0.2)";

      selectedDifficulty = level;
      errorMessage.style.display = "none"; // hide error if previously shown
    };

    buttonsWrapper.appendChild(btn);
  });

  // Start button
  const startButton = document.createElement("button");
  startButton.textContent = "Start Game";
  startButton.style.padding = "10px 25px";
  startButton.style.border = "none";
  startButton.style.borderRadius = "5px";
  startButton.style.backgroundColor = "#2196F3";
  startButton.style.color = "#fff";
  startButton.style.cursor = "pointer";
  startButton.style.fontSize = "16px";
  startButton.style.fontWeight = "bold";

  // Error message
  const errorMessage = document.createElement("div");
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "10px";
  errorMessage.style.fontWeight = "bold";
  errorMessage.style.display = "none";

  startButton.onclick = () => {
    if (selectedDifficulty) {
      document.body.removeChild(overlay);
      askQuestion(selectedDifficulty);
    } else {
      errorMessage.textContent = "⚠️ Please select a difficulty.";
      errorMessage.style.display = "block";
    }
  };

  inputSection.appendChild(buttonsWrapper);
  inputSection.appendChild(startButton);
  inputSection.appendChild(errorMessage);
  modal.appendChild(inputSection);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Typing animation
  let i = 0;
  function type() {
    if (i < message.length) {
      messageEl.textContent += message.charAt(i);
      i++;
      setTimeout(type, 25);
    } else {
      inputSection.style.display = "block";
    }
  }

  type();
}
