const STORAGE_KEY = 'weatherDaysStudents';

const STUDENT_NAMES = [
  'Daniel Wei', 'Echo', 'Alice', 'Jax', 'Ethan',
  'Fruit', 'Lucy', 'Tao', 'Anna', 'Nora', 'Stella', 'Vera'
];

const WEATHER_ITEMS = [
  { id: 'sunny', label: 'Sunny', icon: '☀️' },
  { id: 'cloudy', label: 'Cloudy', icon: '☁️' },
  { id: 'windy', label: 'Windy', icon: '🌬️' },
  { id: 'snowy', label: 'Snowy', icon: '❄️' },
  { id: 'stormy', label: 'Stormy', icon: '⛈️' }
];

const DAY_ITEMS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' }
];

const app = document.getElementById('app');
let students = {};
let currentStudent = null;
let sessionStars = 0;
let sessionQuestions = [];
let currentQuestionIndex = 0;
let currentLevel = 1;
let pendingAutoAdvance = null;
let selectedDay = null;
let selectedWeather = null;

function loadStudents() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (error) { return {}; }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function speak(text, onEnd) {
  if (!window.speechSynthesis) {
    console.log('Speech not supported:', text);
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 1.1;
  utter.volume = 1;
  utter.onend = () => {
    if (onEnd) onEnd();
  };
  window.speechSynthesis.speak(utter);
}

function clearAutoAdvance() {
  if (pendingAutoAdvance) {
    clearTimeout(pendingAutoAdvance);
    pendingAutoAdvance = null;
  }
}

function resetSession() {
  sessionStars = 0;
  currentQuestionIndex = 0;
  currentLevel = 1;
  selectedDay = null;
  selectedWeather = null;
  clearAutoAdvance();
}

function getTopStudents() {
  return Object.entries(students)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.stars - a.stars || b.sessions - a.sessions)
    .slice(0, 10);
}

function renderLoginScreen() {
  app.innerHTML = '';
  const screen = document.createElement('section');
  screen.className = 'screen fade-enter fade-enter-active';

  const title = document.createElement('div');
  title.className = 'header-row';
  title.innerHTML = `
    <div>
      <h1>Choose Your Name</h1>
      <p class="speech-box">Tap your bright button to begin a fun weather game.</p>
    </div>
    <div class="status-pill">Kids only &nbsp;🎉</div>
  `;

  const grid = document.createElement('div');
  grid.className = 'students-grid';
  STUDENT_NAMES.forEach(name => {
    const button = document.createElement('button');
    button.className = 'student-button';
    button.textContent = name;
    button.addEventListener('click', () => {
      currentStudent = name;
      students[currentStudent] = students[currentStudent] || { stars: 0, sessions: 0 };
      saveStudents();
      resetSession();
      renderGameScreen();
      startLevel();
    });
    grid.appendChild(button);
  });

  screen.appendChild(title);
  screen.appendChild(grid);
  app.appendChild(screen);
  speak('Pick your name to start the game.');
}

function updateHeader(screen) {
  const header = document.createElement('div');
  header.className = 'header-row';
  header.innerHTML = `
    <div>
      <h1>Hi ${currentStudent}!</h1>
      <p class="speech-box">Level ${currentLevel} of 5</p>
    </div>
    <div style="display:grid; gap:12px;">
      <div class="status-pill">Stars ${sessionStars}</div>
      <div class="status-pill">Total ${students[currentStudent].stars}</div>
    </div>
  `;
  screen.appendChild(header);
}

function renderGameScreen() {
  app.innerHTML = '';
  const screen = document.createElement('section');
  screen.className = 'screen fade-enter fade-enter-active';
  updateHeader(screen);
  const content = document.createElement('div');
  content.id = 'game-content';
  content.className = 'grid-large';
  screen.appendChild(content);
  app.appendChild(screen);
}

function renderLevelContent(titleText, bodyContent, footerContent) {
  const content = document.getElementById('game-content');
  content.innerHTML = '';
  const titleCard = document.createElement('div');
  titleCard.className = 'card animation-layer';
  titleCard.innerHTML = `<h2>${titleText}</h2>`;
  content.appendChild(titleCard);
  content.appendChild(bodyContent);
  if (footerContent) content.appendChild(footerContent);
}

function createPromptCard(text) {
  const card = document.createElement('div');
  card.className = 'card speech-box';
  card.textContent = text;
  return card;
}

function animateCorrect(target) {
  const sparkle = document.createElement('div');
  sparkle.className = 'sparkle';
  target.classList.add('correct');
  target.appendChild(sparkle);
  setTimeout(() => {
    target.classList.remove('correct');
    if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
  }, 1000);
}

function animateWrong(target) {
  target.classList.add('wrong');
  setTimeout(() => target.classList.remove('wrong'), 500);
}

function getRandomQuestions(items, count) {
  const pool = [...items];
  const questions = [];
  while (questions.length < count && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    questions.push(pool.splice(index, 1)[0]);
  }
  return questions;
}

function startLevel() {
  if (currentLevel === 1) return renderWeatherExploration();
  if (currentLevel === 2) return renderWeatherRecognition();
  if (currentLevel === 3) return renderDaysLevel();
  if (currentLevel === 4) return renderMixedPractice();
  if (currentLevel === 5) return renderSentenceBuilder();
  return renderLeaderboard();
}

function renderWeatherExploration() {
  const body = document.createElement('div');
  body.className = 'weather-grid';

  WEATHER_ITEMS.forEach(item => {
    const button = document.createElement('button');
    button.className = 'weather-button';
    button.innerHTML = `<div style="font-size:3rem">${item.icon}</div><div style="margin-top:12px">${item.label}</div>`;
    button.addEventListener('click', () => speak(item.label));
    body.appendChild(button);
  });

  renderLevelContent('Explore Weather', body);
  speak('Tap the weather icons to hear the words.');
  clearAutoAdvance();
  pendingAutoAdvance = setTimeout(() => {
    currentLevel = 2;
    renderGameScreen();
    startLevel();
  }, 20000);
}

function renderWeatherRecognition() {
  currentLevel = 2;
  const prompt = createPromptCard('Find SUNNY');
  const questionData = getRandomQuestions(WEATHER_ITEMS, 4);
  sessionQuestions = questionData;
  currentQuestionIndex = 0;
  const quizArea = document.createElement('div');
  quizArea.className = 'grid-large';
  renderLevelQuestion('Find SUNNY', WEATHER_ITEMS, quizArea, 'weather');
}

function renderLevelQuestion(titleText, answerPool, container, kind) {
  container.innerHTML = '';
  const target = sessionQuestions[currentQuestionIndex];
  const promptCard = createPromptCard(`Find ${target.label.toUpperCase()}`);
  container.appendChild(promptCard);

  const options = getRandomQuestions(answerPool, 3);
  if (!options.some(option => option.id === target.id)) {
    options[Math.floor(Math.random() * options.length)] = target;
  }

  const grid = document.createElement('div');
  grid.className = kind === 'day' ? 'day-grid' : 'weather-grid';

  options.forEach(option => {
    const button = document.createElement('button');
    button.className = kind === 'day' ? 'day-button' : 'weather-button';
    const label = kind === 'day' ? option.label : `${option.icon}
      <div style="margin-top:12px; font-size:0.95rem">${option.label}</div>`;
    button.innerHTML = label;
    button.addEventListener('click', () => {
      if (option.id === target.id) {
        sessionStars += 1;
        animateCorrect(button);
        speak('Great job!', () => {
          currentQuestionIndex += 1;
          if (currentQuestionIndex >= sessionQuestions.length) {
            if (currentLevel === 2) {
              currentLevel = 3;
              setTimeout(() => { renderGameScreen(); startLevel(); }, 600);
            } else if (currentLevel === 3) {
              currentLevel = 4;
              setTimeout(() => { renderGameScreen(); startLevel(); }, 600);
            } else if (currentLevel === 4) {
              currentLevel = 5;
              setTimeout(() => { renderGameScreen(); startLevel(); }, 600);
            }
          } else {
            renderLevelQuestion(titleText, answerPool, container, kind);
          }
        });
      } else {
        animateWrong(button);
        speak('Try again');
      }
    });
    grid.appendChild(button);
  });

  container.appendChild(grid);
  renderLevelContent(titleText, container);
  speak(`Find ${target.label}`);
}

function renderDaysLevel() {
  currentLevel = 3;
  const body = document.createElement('div');
  body.className = 'grid-large';

  const exploreCard = document.createElement('div');
  exploreCard.className = 'card';
  exploreCard.innerHTML = '<h2>Tap a day</h2>';
  const dayGrid = document.createElement('div');
  dayGrid.className = 'day-grid';
  DAY_ITEMS.forEach(day => {
    const button = document.createElement('button');
    button.className = 'day-button';
    button.textContent = day.label;
    button.addEventListener('click', () => speak(day.label));
    dayGrid.appendChild(button);
  });
  exploreCard.appendChild(dayGrid);

  body.appendChild(exploreCard);
  renderLevelContent('Days of the Week', body);
  speak('Tap a day to hear its name.');
  clearAutoAdvance();
  pendingAutoAdvance = setTimeout(() => {
    renderDaysQuiz();
  }, 7000);
}

function renderDaysQuiz() {
  sessionQuestions = getRandomQuestions(DAY_ITEMS, 4);
  currentQuestionIndex = 0;
  const body = document.createElement('div');
  body.className = 'grid-large';
  renderLevelQuestion('Days Quiz', DAY_ITEMS, body, 'day');
}

function renderMixedPractice() {
  currentLevel = 4;
  sessionQuestions = [];
  const mixedItems = [...WEATHER_ITEMS, ...DAY_ITEMS];
  const choices = [];
  for (let i = 0; i < 5; i += 1) {
    const item = mixedItems[Math.floor(Math.random() * mixedItems.length)];
    if (!choices.some(choice => choice.id === item.id)) choices.push(item);
  }
  sessionQuestions = choices;
  currentQuestionIndex = 0;
  const body = document.createElement('div');
  body.className = 'grid-large';
  renderMixedQuestion(body);
}

function renderMixedQuestion(container) {
  container.innerHTML = '';
  const target = sessionQuestions[currentQuestionIndex];
  const promptCard = createPromptCard(`Find ${target.label.toUpperCase()}`);
  container.appendChild(promptCard);
  const isDay = DAY_ITEMS.some(item => item.id === target.id);
  const answerPool = isDay ? DAY_ITEMS : WEATHER_ITEMS;
  const options = getRandomQuestions(answerPool, 3);
  if (!options.some(option => option.id === target.id)) {
    options[Math.floor(Math.random() * options.length)] = target;
  }
  const grid = document.createElement('div');
  grid.className = isDay ? 'day-grid' : 'weather-grid';
  options.forEach(option => {
    const button = document.createElement('button');
    button.className = isDay ? 'day-button' : 'weather-button';
    const label = isDay ? option.label : `${option.icon}
      <div style="margin-top:12px; font-size:0.95rem">${option.label}</div>`;
    button.innerHTML = label;
    button.addEventListener('click', () => {
      if (option.id === target.id) {
        sessionStars += 1;
        animateCorrect(button);
        speak('Yes! Nice work!', () => {
          currentQuestionIndex += 1;
          if (currentQuestionIndex >= sessionQuestions.length) {
            currentLevel = 5;
            setTimeout(() => { renderGameScreen(); startLevel(); }, 600);
          } else {
            renderMixedQuestion(container);
          }
        });
      } else {
        animateWrong(button);
        speak('Try again');
      }
    });
    grid.appendChild(button);
  });
  container.appendChild(grid);
  renderLevelContent('Mixed Practice', container);
  speak(`Find ${target.label}`);
}

function renderSentenceBuilder() {
  currentLevel = 5;
  const card = document.createElement('div');
  card.className = 'card animation-layer';
  const targetDay = DAY_ITEMS[Math.floor(Math.random() * DAY_ITEMS.length)];
  const targetWeather = WEATHER_ITEMS[Math.floor(Math.random() * WEATHER_ITEMS.length)];
  const prompt = document.createElement('div');
  prompt.className = 'speech-box';
  prompt.textContent = `Make the sentence: ${targetDay.label} + ${targetWeather.label}`;

  const dayGroup = document.createElement('div');
  dayGroup.className = 'day-grid';
  DAY_ITEMS.forEach(day => {
    const button = document.createElement('button');
    button.className = 'day-button';
    button.textContent = day.label;
    button.addEventListener('click', () => {
      selectedDay = day;
      updateSentenceSelection(dayGroup, weatherGroup);
    });
    dayGroup.appendChild(button);
  });

  const weatherGroup = document.createElement('div');
  weatherGroup.className = 'weather-grid';
  WEATHER_ITEMS.forEach(item => {
    const button = document.createElement('button');
    button.className = 'weather-button';
    button.innerHTML = `<div style="font-size:3rem">${item.icon}</div><div style="margin-top:12px; font-size:0.95rem">${item.label}</div>`;
    button.addEventListener('click', () => {
      selectedWeather = item;
      updateSentenceSelection(dayGroup, weatherGroup);
    });
    weatherGroup.appendChild(button);
  });

  const actionRow = document.createElement('div');
  actionRow.className = 'footer-row';
  const chooseMessage = document.createElement('div');
  chooseMessage.className = 'speech-box';
  chooseMessage.id = 'sentence-instruction';
  chooseMessage.textContent = 'Tap a day, then tap a weather to finish the sentence.';
  const submitButton = document.createElement('button');
  submitButton.className = 'action-button';
  submitButton.textContent = 'Check sentence';
  submitButton.disabled = true;
  submitButton.style.opacity = '0.7';
  submitButton.addEventListener('click', () => {
    if (!selectedDay || !selectedWeather) return;
    const isCorrect = selectedDay.id === targetDay.id && selectedWeather.id === targetWeather.id;
    const sentence = `On ${selectedDay.label}, it’s ${selectedWeather.label.toLowerCase()}!`;
    if (isCorrect) {
      sessionStars += 2;
      animateCorrect(submitButton);
      speak(sentence, () => {
        speak('Wonderful! You made the sentence.', () => {
          currentLevel = 6;
          renderLeaderboard();
        });
      });
    } else {
      animateWrong(submitButton);
      speak('Try again. Pick the right day and weather.');
    }
  });

  actionRow.appendChild(chooseMessage);
  actionRow.appendChild(submitButton);
  card.appendChild(prompt);
  card.appendChild(dayGroup);
  card.appendChild(weatherGroup);
  card.appendChild(actionRow);

  renderLevelContent('Sentence Builder', card);
  speak('Make the sentence. Tap a day, then tap a weather symbol.');

  function updateSentenceSelection(dayGrid, weatherGrid) {
    submitButton.disabled = !(selectedDay && selectedWeather);
    submitButton.style.opacity = selectedDay && selectedWeather ? '1' : '0.7';
    Array.from(dayGrid.children).forEach(button => {
      button.classList.toggle('active', button.textContent === selectedDay?.label);
    });
    Array.from(weatherGrid.children).forEach(button => {
      const label = button.innerText.trim().split('\n').pop();
      button.classList.toggle('active', label === selectedWeather?.label);
    });
  }
}

function renderLeaderboard() {
  clearAutoAdvance();
  students[currentStudent].stars += sessionStars;
  students[currentStudent].sessions += 1;
  saveStudents();

  const top = getTopStudents();
  const body = document.createElement('div');
  body.className = 'leaderboard-card';
  const header = document.createElement('div');
  header.className = 'card';
  header.innerHTML = `
    <h2>Well done!</h2>
    <p class="speech-box">You earned ${sessionStars} new stars. Great job!</p>
  `;
  body.appendChild(header);

  top.forEach((student, index) => {
    const row = document.createElement('div');
    row.className = `leaderboard-row ${index < 3 ? 'top' : ''}`;
    row.innerHTML = `<span class="leaderboard-name">${index + 1}. ${student.name}</span><span class="leaderboard-score">${student.stars} stars</span>`;
    body.appendChild(row);
  });

  const footer = document.createElement('div');
  footer.className = 'footer-row';
  const playAgain = document.createElement('button');
  playAgain.className = 'action-button';
  playAgain.textContent = 'Play Again';
  playAgain.addEventListener('click', () => {
    resetSession();
    renderGameScreen();
    startLevel();
  });
  const switchPlayer = document.createElement('button');
  switchPlayer.className = 'action-button';
  switchPlayer.textContent = 'Choose Another Friend';
  switchPlayer.addEventListener('click', () => renderLoginScreen());
  footer.appendChild(playAgain);
  footer.appendChild(switchPlayer);

  app.innerHTML = '';
  const screen = document.createElement('section');
  screen.className = 'screen fade-enter fade-enter-active';
  updateHeader(screen);
  screen.appendChild(body);
  screen.appendChild(footer);
  app.appendChild(screen);
  speak('Great job! Here is the leaderboard. Tap play again to keep learning.');
}

window.addEventListener('DOMContentLoaded', () => {
  students = loadStudents();
  renderLoginScreen();
});
