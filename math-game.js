// math-game.js

// Function to generate random math questions with multiple terms and parentheses for added complexity
function generateQuestion(difficulty) {
    let num1, num2, num3, num4, num5, operator;
    let question, answer;

    // Generate random numbers based on difficulty level
    if (difficulty === 'easy') {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        num3 = Math.floor(Math.random() * 10) + 1;
        num4 = Math.floor(Math.random() * 10) + 1;
        num5 = Math.floor(Math.random() * 10) + 1;
    } else if (difficulty === 'medium') {
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        num3 = Math.floor(Math.random() * 50) + 1;
        num4 = Math.floor(Math.random() * 50) + 1;
        num5 = Math.floor(Math.random() * 50) + 1;
    } else if (difficulty === 'hard') {
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        num3 = Math.floor(Math.random() * 100) + 1;
        num4 = Math.floor(Math.random() * 100) + 1;
        num5 = Math.floor(Math.random() * 100) + 1;
    }

    // Randomly pick operators
    const operators = ['+', '-', '*', '/'];
    const operator1 = operators[Math.floor(Math.random() * operators.length)];
    const operator2 = operators[Math.floor(Math.random() * operators.length)];
    const operator3 = operators[Math.floor(Math.random() * operators.length)];

    // Create a question with parentheses to make it more challenging
    question = `(${num1} ${operator1} ${num2} ${operator2} ${num3}) ${operator3} (${num4} ${operator1} ${num5})`;

    // Evaluate the answer using eval() for simplicity (can be modified for security)
    answer = eval(question);

    return { question, answer };
}

// Function to display the question and check the user's answer
function askQuestion(difficulty) {
    const { question, answer } = generateQuestion(difficulty);
    const userAnswer = prompt(`Solve: ${question}`);

    if (parseFloat(userAnswer) === answer) {
        alert("🎉 Nice job! You totally nailed that! Keep pushing your limits – you’re doing awesome! – Kao");
    } else {
        alert("❌ Almost there! Don’t sweat it, you're getting closer every time. Let’s keep going, you got this! – Kao");
    }

    }

// Function to start the game
function startGame() {
    const difficulty = prompt('Hey, it’s me again, Kao! Ready to play? Choose your difficulty: easy, medium, or hard.').toLowerCase();

    if (['easy', 'medium', 'hard'].includes(difficulty)) {
        askQuestion(difficulty);
    } else {
        alert('Invalid difficulty level. Please choose easy, medium, or hard.');
    }
}