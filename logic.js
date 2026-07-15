//timing
const LANDING_DURATION_MS = 10000;
const CALCULATING_DURATION_MS = 10000;
const TRANSITION_MS = 600;

//quiz data
const quizData = [
    {
        question: "What do you want to achieve for your investment?",
        answers: [
            { text: "I want to keep my funds whole.", points: 1 },
            { text: "I want a higher return than traditional deposits.", points: 2 },
            { text: "I want to grow my funds through traditional deposits and income from fixed income instruments such as bonds and some equities.", points: 3 },
            { text: "I want to enhance my wealth through capital growth.", points: 4 }
        ]
    },
    {
        question: "Which statement best describes your attitude towards investment risks?",
        answers: [
            { text: "I cannot tolerate any amount of risk as I want to keep my funds intact.", points: 1 },
            { text: "I can tolerate minimal amount of risk in order to earn better returns than traditional deposits.", points: 2 },
            { text: "I can tolerate moderate amount of risk in exchange for higher income from fixed income instruments and some equities.", points: 3 },
            { text: "I can tolerate higher volatility and the possibility of substantial loss on my principal in the interim.", points: 4 }
        ]
    },
    {
        question: "Which of the following instruments do you have knowledge of?",
        answers: [
            { text: "Traditional bank deposits only.", points: 1 },
            { text: "Traditional bank deposits, government securities, ROPs, money market pooled funds.", points: 2 },
            { text: "Traditional bank deposits; government securities; ROPs; money market, fixed income funds; corporate bonds; notes; perpetual capital securities; preferred shares; common equities.", points: 3 },
            { text: "Traditional bank deposits; government securities; ROPs; money market, fixed income funds; corporate bonds; notes; perpetual capital securities; preferred shares; common equities; multi-asset & equity funds; global pooled.", points: 4 }
        ]
    },
    {
        question: "In which of the following instruments have you tried investing?",
        answers: [
            { text: "Traditional bank deposits only.", points: 1 },
            { text: "Traditional bank deposits, government securities, ROPs, money market pooled funds.", points: 2 },
            { text: "Traditional bank deposits; government securities; ROPs; money market, fixed income funds; corporate bonds; notes; perpetual capital securities; preferred shares; common equities.", points: 3 },
            { text: "Traditional bank deposits; government securities; ROPs; money market, fixed income funds; corporate bonds; notes; perpetual capital securities; preferred shares; common equities; multi-asset & equity funds; global pooled.", points: 4 }
        ]
    },
    {
        question: "For how long can you stay invested?",
        answers: [
            { text: "Less than 1 year.", points: 1 },
            { text: "1 to 5 years.", points: 2 },
            { text: "5 to 10 years.", points: 3 },
            { text: "More than 10 years.", points: 4 }
        ]
    },
    {
        question: "When will you need to withdraw/redeem from your account/fund?",
        answers: [
            { text: "Might require anytime.", points: 1 },
            { text: "Within one year.", points: 2 },
            { text: "Within 1-5 years.", points: 3 },
            { text: "After five years.", points: 4 }
        ]
    }
];

const resultRanges = [
    {
        min: 6,
        max: 8,
        title: "Conservative",
        message: "Client wants an investment strategy where the primary goal is to prevent the loss of principal while taking on minimal risks and prefers investment grade & highly liquid assets such as deposits & sovereign bonds (i.e. Philippine government securities/ROPs)."
    },
    {
        min: 9,
        max: 15,
        title: "Moderate",
        message: "Client wants a portfolio that provides higher return than bank deposits. Client is willing to be exposed to moderate degree of risk in exchange for higher return. Prefers fixed income instruments such as sovereign & corporate bonds (i.e. Philippine and foreign government securities)."
    },
    {
        min: 16,
        max: 19,
        title: "Moderately Aggressive",
        message: "Client wants to grow his/her investments from a combination of interest income and capital appreciation and is willing to take on additional risks. Prefers a mix portfolio of fixed income securities."
    },
    {
        min: 20,
        max: 24,
        title: "Aggressive",
        message: "Client wants a portfolio that provides capital appreciation over time & is willing to accept higher risks and even possible loss of principal in the interim in exchange for potential higher long-term returns. Client prefers to invest majority of his portfolio in equities and may also invest in structured products and/or derivatives."
    }
];

//app state
let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
const userAnswers = [];

//dom refs

// Pages
const landingSection = document.getElementById("landing-section");
const quizSection = document.getElementById("quiz-section");
const calculatingSection = document.getElementById("calculating-section");
const resultsSection = document.getElementById("results-section");

// Quiz page
const questionLabel = document.getElementById("question-label");
const progressCounter = document.getElementById("progress-counter");
const questionText = document.getElementById("question-text");
const choiceLabels = document.querySelectorAll("#quiz-form .choice");
const quizForm = document.getElementById("quiz-form");
const submitBtn = document.getElementById("submit-btn");

// Results page
const resultsTitle = document.getElementById("results-title");
const resultsScore = document.getElementById("results-score");
const resultsMessage = document.getElementById("results-message");
const retakeBtn = document.getElementById("retake-btn");

//page transitions
function showPage(section) {
    section.hidden = false;
    // Force a reflow so the browser registers the "hidden -> visible"
    // state before we add .active, otherwise the transition won't fire.
    void section.offsetWidth;
    section.classList.add("active");
}

function hidePage(section) {
    section.classList.remove("active");
    return new Promise((resolve) => {
        setTimeout(() => {
            section.hidden = true;
            resolve();
        }, TRANSITION_MS);
    });
}

async function transitionTo(hideEl, showEl) {
    await hidePage(hideEl);
    showPage(showEl);
}

//rendering
function renderQuestion() {
    const q = quizData[currentQuestionIndex];

    questionLabel.textContent = `Question ${currentQuestionIndex + 1}`;
    progressCounter.textContent = `${currentQuestionIndex + 1}/${quizData.length}`;
    questionText.textContent = q.question;

    choiceLabels.forEach((label, i) => {
        const textEl = label.querySelector(".choice-text");
        const inputEl = label.querySelector('input[type="radio"]');
        textEl.textContent = q.answers[i].text;
        inputEl.checked = false;
    });

    selectedAnswerIndex = null;
    submitBtn.disabled = true;
    submitBtn.textContent =
        currentQuestionIndex === quizData.length - 1 ? "See Results" : "Submit Answer";
}

//interaction
choiceLabels.forEach((label, i) => {
    const inputEl = label.querySelector('input[type="radio"]');
    inputEl.addEventListener("change", () => {
        selectedAnswerIndex = i;
        submitBtn.disabled = false;
    });
});

function handleSubmit(event) {
    event.preventDefault();
    if (selectedAnswerIndex === null) return;

    userAnswers[currentQuestionIndex] = selectedAnswerIndex;
    const isLastQuestion = currentQuestionIndex === quizData.length - 1;

    if (isLastQuestion) {
        transitionTo(quizSection, calculatingSection);
        setTimeout(showResults, CALCULATING_DURATION_MS);
    } else {
        currentQuestionIndex++;
        renderQuestion();
    }
}

//scoring
function calculateScore() {
    return userAnswers.reduce((total, answerIndex, qIndex) => {
        return total + quizData[qIndex].answers[answerIndex].points;
    }, 0);
}

function getResultForScore(score) {
    return resultRanges.find((range) => score >= range.min && score <= range.max);
}

function getMaxPossibleScore() {
    return quizData.reduce((sum, q) => {
        const highest = Math.max(...q.answers.map((a) => a.points));
        return sum + highest;
    }, 0);
}

//results
function showResults() {
    const score = calculateScore();
    const result = getResultForScore(score);

    resultsTitle.textContent = result ? result.title : "Result";
    resultsScore.textContent = `Score: ${score} / ${getMaxPossibleScore()}`;
    resultsMessage.textContent = result ? result.message : "Thanks for taking the quiz!";

    transitionTo(calculatingSection, resultsSection);
}

function handleRetake() {
    currentQuestionIndex = 0;
    userAnswers.length = 0;

    renderQuestion();
    transitionTo(resultsSection, quizSection);
}

//initializer
function init() {
    renderQuestion();

    quizForm.addEventListener("submit", handleSubmit);
    retakeBtn.addEventListener("click", handleRetake);

    setTimeout(() => {
        transitionTo(landingSection, quizSection);
    }, LANDING_DURATION_MS);
}

init();