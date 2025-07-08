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

// Generate a group of terms using the same operator (e.g., + + +)
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
  // Choose a single operator for this group (division is special)
  let op = operators[Math.floor(Math.random() * operators.length)];

  // Decide the number of terms in the group
  let termCount = getRandomInt(minTerms, maxTerms);

  // Generate numbers for the group
  let nums = [];
  for (let i = 0; i < termCount; i++) {
    nums.push(getRandomInt(range[0], range[1]));
  }

  // If the operator is '/', ensure division is exact
  if (op === '/') {
    // Start with an initial positive result
    let result = nums[0];
    for (let i = 1; i < nums.length; i++) {
      // Adjust divisors to ensure exact division
      let divisor = getRandomInt(1, range[1]);
      result = result * divisor;
      nums[i] = divisor;
    }
  } else if (op === '-') {
    // Sort numbers descending to avoid negative results (e.g., 20 - 5 - 2)
    nums.sort((a, b) => b - a);
  }

  // Build the group expression, e.g., "3+4+5" or "20-5-2"
  let expr = nums[0].toString();
  for (let i = 1; i < nums.length; i++) {
    expr += ` ${op} ${nums[i]}`;
  }

  // Calculate the group's answer
  let answer = eval(expr);

  // Return null if the answer is negative or not an integer to regenerate
  if (!Number.isInteger(answer) || answer < 0) return null;

  return { expr, answer, op };
}

// Combine groups without deep nested parentheses
function generateQuestion(difficulty) {
  while (true) {
    // Create 2 or 3 groups (medium=2, hard=3)
    let groupCount = difficulty === 'hard' ? 3 : 2;

    let groups = [];
    for (let i = 0; i < groupCount; i++) {
      let group = null;
      // Regenerate if null (due to negative result)
      while (!group) {
        group = generateGroup(difficulty);
      }
      groups.push(group);
    }

    // Operators between groups must differ from group's internal operator for variety
    const possibleOps = ['+', '-', '*'];
    let betweenOps = [];
    for (let i = 0; i < groupCount - 1; i++) {
      // Avoid repeating the same operator as the group
      let ops = possibleOps.filter(o => o !== groups[i].op);
      let op = ops[Math.floor(Math.random() * ops.length)];
      betweenOps.push(op);
    }

    // Build the full expression, e.g., (3+4+5) - (20-5-2) * (6+6+6)
    let question = groups[0].expr.length > 1 ? `(${groups[0].expr})` : groups[0].expr;
    let currentValue = groups[0].answer;

    for (let i = 1; i < groupCount; i++) {
      let op = betweenOps[i - 1];
      let g = groups[i];
      // Avoid parentheses if group is a single term
      let exprPart = g.expr.length > 1 ? `(${g.expr})` : g.expr;

      // Calculate combined result
      let val = g.answer;
      if (op === '+') currentValue += val;
      else if (op === '-') currentValue -= val;
      else if (op === '*') currentValue *= val;

      question += ` ${op} ${exprPart}`;
    }

    if (Number.isInteger(currentValue) && currentValue >= 0) {
      return { question, answer: currentValue };
    }
  }
}

function askQuestion(difficulty) {
  const { question, answer } = generateQuestion(difficulty);
  const startTime = Date.now();

  const userAnswer = prompt(`🧠 Ready? Solve:\n${question}`);

  const endTime = Date.now();
  const timeUsed = ((endTime - startTime) / 1000).toFixed(2);

  if (parseInt(userAnswer) === answer) {
    alert(`🎉 Correct!\n⏱️ Time: ${timeUsed}s\nYou're amazing! – Kao`);
  } else {
    alert(`❌ Nope!\nAnswer was: ${answer}\n⏱️ Time: ${timeUsed}s\nKeep it up! – Kao`);
  }
}

function startGame() {
  const difficulty = prompt("Hey! It's Kao 😄\nReady for a brain workout? 💡\nChoose difficulty: easy, medium, or hard").toLowerCase();

  if (['easy', 'medium', 'hard'].includes(difficulty)) {
    askQuestion(difficulty);
  } else {
    alert("Please type easy, medium, or hard.");
  }
}