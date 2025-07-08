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
  if (difficulty === 'easy') {
    range = [1, 10];
    minTerms = 2;
    maxTerms = 3;
  } else if (difficulty === 'medium') {
    range = [5, 50];
    minTerms = 3;
    maxTerms = 4;
  } else {
    range = [10, 100];
    minTerms = 3;
    maxTerms = 4;
  }

  const operators = ['+', '-', '*', '/'];
  let op = operators[Math.floor(Math.random() * operators.length)];
  let termCount = getRandomInt(minTerms, maxTerms);
  let nums = [];

  if (op === '/') {
    // To keep integer positive result for division:
    // generate the last term first, then multiply by random divisors
    let lastTerm = getRandomInt(range[0], range[1]);
    nums.push(lastTerm);
    for (let i = 1; i < termCount; i++) {
      let divisor = getRandomInt(1, range[1]);
      nums[0] *= divisor;
      nums.push(divisor);
    }
  } else if (op === '-') {
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
    let groupCount = difficulty === 'hard' ? 3 : 2;
    let groups = [];

    for (let i = 0; i < groupCount; i++) {
      let group = null;
      let attempts = 0;
      while (!group) {
        group = generateGroup(difficulty);
        attempts++;
        if (attempts > 100) break;  // avoid infinite loop
      }
      if (!group) break;  // fail safe
      groups.push(group);
    }
    if (groups.length !== groupCount) continue;

    const possibleOps = ['+', '-', '*'];
    let betweenOps = [];
    for (let i = 0; i < groupCount - 1; i++) {
      // Avoid same operator as group to mix it up
      let ops = possibleOps.filter(o => o !== groups[i].op);
      let op = ops[Math.floor(Math.random() * ops.length)];
      betweenOps.push(op);
    }

    let question = groups[0].expr.length > 1 ? `(${groups[0].expr})` : groups[0].expr;
    let currentValue = groups[0].answer;

    for (let i = 1; i < groupCount; i++) {
      let op = betweenOps[i - 1];
      let g = groups[i];
      let exprPart = g.expr.length > 1 ? `(${g.expr})` : g.expr;
      let val = g.answer;

      if (op === '+') currentValue += val;
      else if (op === '-') currentValue -= val;
      else if (op === '*') currentValue *= val;

      question += ` ${op} ${exprPart}`;
    }

    // Ensure final answer integer and between 1 and 10,000
    if (Number.isInteger(currentValue) && currentValue >= 1 && currentValue <= 10000) {
      return { question, answer: currentValue };
    }
  }
}

function askQuestion(difficulty) {
  const { question, answer } = generateQuestion(difficulty);
  const startTime = Date.now();

  // Create overlay and modal just like showTypingPopup
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

  // Question text
  const questionEl = document.createElement("div");
  questionEl.textContent = `🧠 Ready? Solve:\n${question}`;
  questionEl.style.marginBottom = "20px";
  modal.appendChild(questionEl);

  // Input section
  const input = document.createElement("input");
  input.type = "number";
  input.placeholder = "Your answer";
  input.style.padding = "8px";
  input.style.width = "70%";
  input.style.marginRight = "10px";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "4px";

  const button = document.createElement("button");
  button.textContent = "Submit";
  button.style.padding = "8px 12px";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "#fff";
  button.style.cursor = "pointer";

  const feedback = document.createElement("div");
  feedback.style.marginTop = "20px";
  feedback.style.fontWeight = "bold";

  button.onclick = () => {
    const userAnswer = input.value.trim();
    const endTime = Date.now();
    const timeUsed = ((endTime - startTime) / 1000).toFixed(2);

    if (parseInt(userAnswer) === answer) {
      feedback.textContent = `🎉 Correct!\n⏱️ Time: ${timeUsed}s\nYou're amazing! – Kao`;
      feedback.style.color = "green";
    } else {
      feedback.textContent = `❌ Nope!\nAnswer was: ${answer}\n⏱️ Time: ${timeUsed}s\nKeep it up! – Kao`;
      feedback.style.color = "red";
    }
    input.disabled = true;
    button.disabled = true;

    // Add a 'Close' button after showing feedback
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.marginTop = "15px";
    closeBtn.style.padding = "8px 12px";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.backgroundColor = "#2196F3";
    closeBtn.style.color = "#fff";
    closeBtn.style.cursor = "pointer";

    closeBtn.onclick = () => {
      document.body.removeChild(overlay);
    };

    modal.appendChild(closeBtn);
  };

  // Layout input and submit button horizontally
  const inputSection = document.createElement("div");
  inputSection.style.display = "flex";
  inputSection.style.alignItems = "center";
  inputSection.appendChild(input);
  inputSection.appendChild(button);

  modal.appendChild(inputSection);
  modal.appendChild(feedback);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  input.focus();
}


function startGame() {
//   const greetings = [
//     date => `Today is ${date}. I hope you're feeling inspired and ready to shine.`,
//     date => `${date} — a fresh new day to do your best and feel proud.`,
//     date => `It’s ${date}. Remember, every step forward counts.`,
//     date => `Happy ${date}! You've got what it takes to succeed.`,
//     date => `On this beautiful ${date}, take a breath and believe in yourself.`,
//     date => `${date} brings new energy. Keep pushing and keep smiling.`,
//     date => `Hey there! ${date} is full of opportunities and good vibes.`,
//     date => `Wishing you strength and clarity this ${date}. You've got this.`,
//     date => `Take on ${date} with courage and joy. You're doing amazing.`,
//     date => `Step into ${date} with confidence. Great things are ahead.`,
//     date => `${date} is a perfect day to grow stronger and brighter.`,
//     date => `Hope you're feeling grounded and focused this ${date}. Keep going.`,
//     date => `Breathe in calm and confidence this ${date}. You're doing great.`,
//     date => `Let the energy of ${date} lift you up. You've got this.`,
//     date => `This ${date}, remember how far you’ve come. Keep rising.`,
//     date => `May ${date} bring peace to your heart and clarity to your mind.`,
//     date => `${date} is yours to shape. Stay strong and stay kind.`,
//     date => `Embrace the pace of progress this ${date}. One step at a time.`,
//     date => `Sending you good vibes and steady focus this ${date}.`,
//     date => `Let ${date} be a gentle reminder that you're capable of amazing things.`
//   ];

  const greetings = [
  date => `🌞 Today is ${date}. I hope you're feeling inspired and ready to shine ✨.`,
  date => `${date} — a fresh new day to do your best and feel proud 💪😊.`,
  date => `It’s ${date}. Remember, every step forward counts 👣🔥.`,
  date => `🎉 Happy ${date}! You've got what it takes to succeed 🚀💯.`,
  date => `On this beautiful ${date}, take a breath and believe in yourself 🌸💖.`,
  date => `${date} brings new energy ⚡. Keep pushing and keep smiling 😄👍.`,
  date => `Hey there! ${date} is full of opportunities and good vibes 🌈✨.`,
  date => `Wishing you strength and clarity this ${date} 💡💪. You've got this!`,
  date => `Take on ${date} with courage and joy 🦸‍♂️😄. You're doing amazing!`,
  date => `Step into ${date} with confidence 🚶‍♀️🌟. Great things are ahead!`,
  date => `${date} is a perfect day to grow stronger and brighter 🌱🌞.`,
  date => `Hope you're feeling grounded and focused this ${date} 🧘‍♀️🎯. Keep going!`,
  date => `Breathe in calm and confidence this ${date} 🌬️😌. You're doing great!`,
  date => `Let the energy of ${date} lift you up 🚀💫. You've got this!`,
  date => `This ${date}, remember how far you’ve come 🏆🙌. Keep rising!`,
  date => `May ${date} bring peace to your heart and clarity to your mind 🕊️💭.`,
  date => `${date} is yours to shape 🛠️✨. Stay strong and stay kind ❤️🤝.`,
  date => `Embrace the pace of progress this ${date} 🐢➡️🐇. One step at a time!`,
  date => `Sending you good vibes and steady focus this ${date} ✨🎯.`,
  date => `Let ${date} be a gentle reminder that you're capable of amazing things 🌟💖.`
];



//   const greetings = [
//     date => `Today is ${date}, a brand new chapter filled with endless possibilities and opportunities waiting just for you. I hope you’re feeling inspired, energized, and ready to shine brighter than ever before, knowing that every moment you put in today brings you one step closer to your dreams.`,

//     date => `${date} — a fresh canvas for you to paint with your talents, passion, and courage. Take a deep breath, stand tall, and do your absolute best today, because every effort, no matter how small, is something to be proud of and will build the foundation of your success.`,

//     date => `It’s ${date}, a beautiful reminder that progress is made one step at a time. Celebrate every forward move, no matter how tiny, because each step shapes your journey, strengthens your resolve, and brings you closer to becoming the best version of yourself.`,

//     date => `Happy ${date}! Today, remember that you possess an incredible inner strength and the unique ability to overcome any obstacle. Believe in yourself fiercely, embrace challenges as opportunities, and know that success is not only possible, it’s inevitable with your determination.`,

//     date => `On this beautiful ${date}, pause for a moment to breathe deeply and appreciate how far you’ve come. Let self-belief fill your heart, and face the day with confidence and kindness to yourself — you are worthy of all the good things life has to offer.`,

//     date => `${date} brings with it fresh energy, renewed hope, and a chance to rewrite your story. Keep pushing forward with a smile on your face, because your resilience and positive attitude light the way not just for you, but for those around you as well.`,

//     date => `Hey there! ${date} is bursting with opportunity and good vibes just waiting for you to seize. Embrace the challenges and joys of today with an open heart and an unstoppable spirit, knowing that your potential is limitless and your efforts truly matter.`,

//     date => `Wishing you strength, clarity, and unwavering focus this ${date}. You have all the tools inside you to navigate through any uncertainty, and your perseverance will lead you to triumph. Keep going—you’re doing amazing and the best is yet to come.`,

//     date => `Take on ${date} with courage, joy, and the knowledge that every single moment is a precious chance to grow. Trust your journey, celebrate your progress, and remember that you are making a positive difference simply by showing up and trying.`,

//     date => `Step into ${date} with confidence and an open mind, knowing that greatness awaits you around every corner. Let today be the day you push beyond your limits, embrace new challenges, and continue building the future you’ve always dreamed of.`,

//     date => `${date} is a perfect day to nurture your growth, illuminate your path with positivity, and shine even brighter than before. You are capable of amazing things, and with each passing day, you become stronger, wiser, and more resilient.`,

//     date => `Hope you’re feeling grounded, focused, and full of purpose this ${date}. No matter what comes your way, trust that you have the strength to overcome, the wisdom to learn, and the courage to keep moving forward toward your goals.`,

//     date => `Breathe in calm, confidence, and clarity this ${date}. You are making meaningful progress, even if it’s invisible right now. Trust the process, believe in yourself, and know that your hard work will bear beautiful fruit.`,

//     date => `Let the vibrant energy of ${date} lift your spirits and fuel your ambition. You are a force of nature—capable, strong, and ready to conquer whatever challenges this day may bring. Keep believing, keep striving, and keep shining.`,

//     date => `This ${date}, take a moment to honor how far you’ve come and the courage it took to get here. Keep rising above doubts and fears, knowing that your resilience is your superpower and your future is as bright as your dreams.`,

//     date => `May ${date} bring peace to your heart, clarity to your mind, and joy to your soul. As you navigate through this day, remember that kindness—both to yourself and others—is the greatest strength, and your journey is unique and valuable.`,

//     date => `${date} is a blank slate, a chance for you to write your story with courage, kindness, and determination. Stay strong in the face of challenges, stay gentle with yourself, and keep nurturing the incredible person you are becoming.`,

//     date => `Embrace the pace of progress this ${date}—whether it’s fast or slow, every step forward counts. Trust that each effort you make is meaningful, and celebrate the journey as much as the destination, knowing that growth takes time and patience.`,

//     date => `Sending you waves of positive energy, steady focus, and boundless motivation this ${date}. You are capable of extraordinary things, and with each breath and each action, you’re moving closer to the life you envision.`,

//     date => `Let ${date} be a gentle yet powerful reminder that you are capable of amazing things. Your potential is limitless, your spirit is indomitable, and your journey—though sometimes tough—is filled with endless moments of beauty and triumph. Keep shining, always.`,

//     date => `As the sun rises on this beautiful ${date}, let it remind you that each new day carries the promise of fresh opportunities, new lessons, and moments of joy. Step forward with courage and a heart full of hope, knowing that you have the power to create something truly remarkable.`,

//     date => `On this extraordinary ${date}, may you find strength in your challenges, wisdom in your experiences, and joy in your victories. Remember, greatness is built one step at a time, and today is the perfect day to take that next step with confidence.`,

//     date => `This ${date} is a wonderful invitation to dream boldly and act purposefully. Believe in your talents, trust the journey, and know that every effort you make, no matter how small, is a building block toward a future full of success and happiness.`,

//     date => `Good ${date}! Let today be a reminder that you are more powerful than any obstacle and more determined than any setback. Embrace the day with an open mind and a resilient spirit, ready to transform challenges into triumphs.`,

//     date => `May this ${date} fill your heart with inspiration and your mind with clarity. Remember that the path to success is paved with perseverance, self-belief, and the willingness to keep moving forward no matter what.`,

//     date => `Welcome to ${date}, a day bursting with potential and endless possibilities. Let your passion be your guide and your determination be your fuel as you pursue your goals and make a positive impact on the world around you.`,

//     date => `As you greet this ${date}, take a moment to appreciate the journey so far and envision the incredible heights you are yet to reach. Your dedication and courage are lighting the way—keep pushing, keep striving, and keep believing.`,

//     date => `This ${date} offers a fresh start and a chance to reinvent yourself. Embrace every opportunity with enthusiasm, tackle challenges with grit, and remember that your unique journey is something to be proud of every single day.`,

//     date => `On this inspiring ${date}, may you find clarity amidst chaos, strength in adversity, and joy in your progress. The world needs your unique light, so shine brightly and never underestimate the impact you can have.`,

//     date => `Today, on ${date}, be proud of your resilience and the courage that has brought you this far. Every challenge you face is a stepping stone to greatness, and your spirit is capable of turning dreams into reality.`,

//     date => `May the energy of ${date} inspire you to embrace change, welcome growth, and pursue your passions relentlessly. You are the author of your story—write it with confidence, kindness, and unwavering determination.`,

//     date => `As the world awakens on this ${date}, take a deep breath and center yourself. Let gratitude fill your heart, positivity guide your actions, and perseverance be your constant companion on the road ahead.`,

//     date => `On this glorious ${date}, remember that your journey is unique and your potential limitless. No matter the obstacles, your spirit is unbreakable, and your dreams are worth every ounce of effort you put forth.`,

//     date => `This ${date} is a blank page ready for you to write your story of courage, kindness, and success. Embrace the unknown with curiosity and the challenges with determination—you are capable of extraordinary achievements.`,

//     date => `Step into ${date} with a heart full of hope and a mind clear of doubt. Every moment is a new chance to grow, learn, and move closer to the incredible life you’re building one day at a time.`,

//     date => `May the promise of ${date} remind you to pause, reflect, and appreciate the journey you are on. You are stronger than you realize, and each step forward is a testament to your resilience and dedication.`,

//     date => `Today, on ${date}, give yourself permission to shine, to take risks, and to embrace every opportunity with open arms. Your potential knows no bounds, and the future you dream of is within reach.`,

//     date => `As ${date} unfolds, let it be a gentle nudge to believe in yourself, to nurture your dreams, and to celebrate the small wins that lead to big successes. Your persistence and passion make all the difference.`,

//     date => `On this inspiring ${date}, remember that every effort you make, no matter how small, plants a seed for future growth and achievement. Keep watering your dreams with faith and hard work—they will blossom beautifully.`,

//     date => `Welcome this ${date} with optimism and determination. You are the architect of your own destiny, capable of shaping a future filled with joy, purpose, and endless possibilities. Keep going—the best is yet to come.`

//     ];

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const greetingMessage = greetings[Math.floor(Math.random() * greetings.length)](today);
  const fullMessage = `Hey! It's Kao 😄\n\n${greetingMessage}\n\nReady for a brain workout? 💡\nChoose difficulty: easy, medium, or hard`;

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

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type: easy, medium, or hard";
  input.style.padding = "8px";
  input.style.width = "70%";
  input.style.marginRight = "10px";
  input.style.border = "1px solid #ccc";
  input.style.borderRadius = "4px";

  const button = document.createElement("button");
  button.textContent = "Start";
  button.style.padding = "8px 12px";
  button.style.border = "none";
  button.style.borderRadius = "4px";
  button.style.backgroundColor = "#4CAF50";
  button.style.color = "#fff";
  button.style.cursor = "pointer";

  // Error message div — initially empty and hidden
  const errorMessage = document.createElement("div");
  errorMessage.style.color = "red";
  errorMessage.style.marginTop = "10px";
  errorMessage.style.fontWeight = "bold";
  errorMessage.style.display = "none";
  modal.appendChild(errorMessage);

  button.onclick = () => {
    const difficulty = input.value.trim().toLowerCase();

    if (['easy', 'medium', 'hard'].includes(difficulty)) {
      document.body.removeChild(overlay);
      askQuestion(difficulty);
    } else {
      // Show inline error message
      errorMessage.textContent = "⚠️ Please type easy, medium, or hard.";
      errorMessage.style.display = "block";
      input.focus();
    }
  };

  inputSection.appendChild(input);
  inputSection.appendChild(button);
  modal.appendChild(inputSection);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Typing effect for the greeting message
  let i = 0;
  function type() {
    if (i < message.length) {
      messageEl.textContent += message.charAt(i);
      i++;
      setTimeout(type, 25);
    } else {
      inputSection.style.display = "block";
      input.focus();
    }
  }

  type();
}
