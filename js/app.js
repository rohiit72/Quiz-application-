/**
 * QuizFlow Pro - Application Controller
 * Orchestrates game flow, state machine, timers, lifelines, scoring, and UI views.
 */

class QuizApp {
  constructor() {
    this.categories = window.QUIZ_CATEGORIES || [];
    this.allQuestions = window.DEFAULT_QUESTIONS || [];
    this.storage = window.storageManager;
    this.sound = window.soundManager;
    this.confetti = window.confetti;

    // Game Session State
    this.selectedCategory = 'all';
    this.selectedDifficulty = 'all';
    this.selectedCount = 10;
    this.playerName = 'Challenger';

    this.activeQuestions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.questionStartTime = 0;
    this.userAnswers = []; // History for review: { question, chosenIndex, isCorrect, timeTaken }

    // Timer & Lifelines State
    this.timerSeconds = 20;
    this.totalQuestionSeconds = 20;
    this.timerInterval = null;
    this.isTimerPaused = false;
    this.isAnswered = false;

    this.lifelines = {
      fiftyFifty: true,
      freeze: true,
      hint: true,
      skip: true
    };

    // DOM Elements Cache
    this.dom = {};
    this.initDOM();
    this.initSettings();
    this.bindEvents();
    this.renderCategoryGrid();
  }

  /* -------------------------------------------------------------
     DOM Initializer
     ------------------------------------------------------------- */
  initDOM() {
    this.dom = {
      // Screens
      screenHome: document.getElementById('screen-home'),
      screenQuiz: document.getElementById('screen-quiz'),
      screenResults: document.getElementById('screen-results'),

      // Navigation & Header
      navLogo: document.getElementById('nav-logo'),
      btnToggleSound: document.getElementById('btn-toggle-sound'),
      soundIcon: document.getElementById('sound-icon'),
      btnToggleTheme: document.getElementById('btn-toggle-theme'),
      themeIcon: document.getElementById('theme-icon'),
      btnOpenLeaderboard: document.getElementById('btn-open-leaderboard'),
      btnOpenStats: document.getElementById('btn-open-stats'),
      btnOpenCreator: document.getElementById('btn-open-creator'),

      // Home Screen
      playerNameInput: document.getElementById('player-name-input'),
      categoryGrid: document.getElementById('category-grid'),
      difficultyControl: document.getElementById('difficulty-control'),
      countControl: document.getElementById('count-control'),
      btnStartQuiz: document.getElementById('btn-start-quiz'),
      btnStartLabel: document.getElementById('btn-start-label'),

      // Quiz Screen
      quizCategoryTag: document.getElementById('quiz-category-tag'),
      quizQuestionCounter: document.getElementById('quiz-question-counter'),
      streakBadge: document.getElementById('streak-badge'),
      streakCount: document.getElementById('streak-count'),
      timerWrap: document.getElementById('timer-wrap'),
      timerCircleBar: document.getElementById('timer-circle-bar'),
      timerText: document.getElementById('timer-text'),
      currentScore: document.getElementById('current-score'),
      quizProgressFill: document.getElementById('quiz-progress-fill'),

      // Lifelines
      lifeline5050: document.getElementById('lifeline-5050'),
      lifelineFreeze: document.getElementById('lifeline-freeze'),
      lifelineHint: document.getElementById('lifeline-hint'),
      lifelineSkip: document.getElementById('lifeline-skip'),

      // Question Stage
      qCategoryName: document.getElementById('q-category-name'),
      qDifficultyBadge: document.getElementById('q-difficulty-badge'),
      questionText: document.getElementById('question-text'),
      codeSnippetBox: document.getElementById('code-snippet-box'),
      codeSnippetText: document.getElementById('code-snippet-text'),
      optionsGrid: document.getElementById('options-grid'),
      explanationBox: document.getElementById('explanation-box'),
      explanationHeading: document.getElementById('explanation-heading'),
      explanationText: document.getElementById('explanation-text'),
      explanationIcon: document.getElementById('explanation-icon'),
      btnNextQuestion: document.getElementById('btn-next-question'),
      btnQuitQuiz: document.getElementById('btn-quit-quiz'),

      // Results Screen
      resultsBadge: document.getElementById('results-badge'),
      resultsTitle: document.getElementById('results-title'),
      resultsSubtext: document.getElementById('results-subtext'),
      resScore: document.getElementById('res-score'),
      resAccuracy: document.getElementById('res-accuracy'),
      resCorrect: document.getElementById('res-correct'),
      resMaxStreak: document.getElementById('res-max-streak'),
      btnPlayAgain: document.getElementById('btn-play-again'),
      btnToggleReview: document.getElementById('btn-toggle-review'),
      btnShareScore: document.getElementById('btn-share-score'),
      reviewSection: document.getElementById('review-section'),
      reviewList: document.getElementById('review-list'),

      // Modals
      modalLeaderboard: document.getElementById('modal-leaderboard'),
      leaderboardList: document.getElementById('leaderboard-list'),
      btnClearLeaderboard: document.getElementById('btn-clear-leaderboard'),

      modalStats: document.getElementById('modal-stats'),
      statTotalGames: document.getElementById('stat-total-games'),
      statTotalPoints: document.getElementById('stat-total-points'),
      statOverallAcc: document.getElementById('stat-overall-acc'),
      categoryStatsContainer: document.getElementById('category-stats-container'),

      modalCreator: document.getElementById('modal-creator'),
      customQuizTitle: document.getElementById('custom-quiz-title'),
      customQuizDesc: document.getElementById('custom-quiz-desc'),
      customQCount: document.getElementById('custom-q-count'),
      customQuestionsList: document.getElementById('custom-questions-list'),
      btnAddCustomQ: document.getElementById('btn-add-custom-q'),
      btnImportQuizJson: document.getElementById('btn-import-quiz-json'),
      btnExportQuizJson: document.getElementById('btn-export-quiz-json'),
      btnSaveCustomQuiz: document.getElementById('btn-save-custom-quiz'),
      quizFileInput: document.getElementById('quiz-file-input'),

      // Toasts
      toastContainer: document.getElementById('toast-container')
    };
  }

  /* -------------------------------------------------------------
     Settings & Persistence Init
     ------------------------------------------------------------- */
  initSettings() {
    const settings = this.storage.getSettings();
    if (settings.playerName) {
      this.playerName = settings.playerName;
      if (this.dom.playerNameInput) {
        this.dom.playerNameInput.value = settings.playerName;
      }
    }

    if (typeof settings.sound === 'boolean') {
      this.sound.toggleSound(settings.sound);
      this.updateSoundButtonUI();
    }

    const savedTheme = localStorage.getItem('quizflow_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButtonUI(savedTheme);
  }

  updateSoundButtonUI() {
    if (this.dom.soundIcon) {
      this.dom.soundIcon.textContent = this.sound.enabled ? '🔊' : '🔇';
    }
  }

  updateThemeButtonUI(theme) {
    if (this.dom.themeIcon) {
      this.dom.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  /* -------------------------------------------------------------
     Event Binding
     ------------------------------------------------------------- */
  bindEvents() {
    // Logo returns to home
    this.dom.navLogo.addEventListener('click', () => {
      this.sound.playClick();
      this.showScreen('home');
    });

    // Sound toggle
    this.dom.btnToggleSound.addEventListener('click', () => {
      const enabled = this.sound.toggleSound();
      this.updateSoundButtonUI();
      this.storage.saveSettings({ ...this.storage.getSettings(), sound: enabled });
      this.showToast(enabled ? 'Sound Enabled' : 'Sound Muted', 'info');
    });

    // Theme toggle
    this.dom.btnToggleTheme.addEventListener('click', () => {
      this.sound.playClick();
      const current = document.documentElement.getAttribute('data-theme');
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('quizflow_theme', target);
      this.updateThemeButtonUI(target);
    });

    // Modals
    this.dom.btnOpenLeaderboard.addEventListener('click', () => this.openLeaderboardModal());
    this.dom.btnOpenStats.addEventListener('click', () => this.openStatsModal());
    this.dom.btnOpenCreator.addEventListener('click', () => this.openCreatorModal());

    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.dataset.close;
        if (modalId) {
          document.getElementById(modalId).classList.remove('open');
        }
      });
    });

    // Close modal when clicking overlay background
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    // Player Name Change
    this.dom.playerNameInput.addEventListener('change', (e) => {
      this.playerName = e.target.value.trim() || 'Challenger';
      this.storage.saveSettings({ ...this.storage.getSettings(), playerName: this.playerName });
    });

    // Difficulty buttons
    this.dom.difficultyControl.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.sound.playClick();
        this.dom.difficultyControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedDifficulty = e.currentTarget.dataset.difficulty;
        this.updateStartButtonLabel();
      });
    });

    // Count buttons
    this.dom.countControl.querySelectorAll('.segment-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.sound.playClick();
        this.dom.countControl.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedCount = parseInt(e.currentTarget.dataset.count, 10);
        this.updateStartButtonLabel();
      });
    });

    // Start Quiz
    this.dom.btnStartQuiz.addEventListener('click', () => {
      this.sound.playClick();
      this.startQuiz();
    });

    // Next Question
    this.dom.btnNextQuestion.addEventListener('click', () => {
      this.sound.playClick();
      this.nextQuestion();
    });

    // Quit Quiz
    this.dom.btnQuitQuiz.addEventListener('click', () => {
      if (confirm('Are you sure you want to quit this challenge? Current progress will be lost.')) {
        this.stopTimer();
        this.sound.playClick();
        this.showScreen('home');
      }
    });

    // Lifelines
    this.dom.lifeline5050.addEventListener('click', () => this.useLifeline5050());
    this.dom.lifelineFreeze.addEventListener('click', () => this.useLifelineFreeze());
    this.dom.lifelineHint.addEventListener('click', () => this.useLifelineHint());
    this.dom.lifelineSkip.addEventListener('click', () => this.useLifelineSkip());

    // Results Actions
    this.dom.btnPlayAgain.addEventListener('click', () => {
      this.sound.playClick();
      this.startQuiz();
    });

    this.dom.btnToggleReview.addEventListener('click', () => {
      this.sound.playClick();
      const isHidden = this.dom.reviewSection.style.display === 'none';
      this.dom.reviewSection.style.display = isHidden ? 'block' : 'none';
      this.dom.btnToggleReview.innerHTML = isHidden ? '<span>▲</span> Hide Review' : '<span>📋</span> Review Answers';
      if (isHidden) {
        this.dom.reviewSection.scrollIntoView({ behavior: 'smooth' });
      }
    });

    this.dom.btnShareScore.addEventListener('click', () => this.shareScore());

    // Leaderboard Clear
    this.dom.btnClearLeaderboard.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all high scores?')) {
        this.storage.clearLeaderboard();
        this.openLeaderboardModal();
        this.showToast('Leaderboard has been reset', 'info');
      }
    });

    // Creator Modal Events
    this.dom.btnAddCustomQ.addEventListener('click', () => this.addCustomQuestionFormItem());
    this.dom.btnSaveCustomQuiz.addEventListener('click', () => this.saveAndPlayCustomQuiz());
    this.dom.btnExportQuizJson.addEventListener('click', () => this.exportCustomQuizJSON());
    this.dom.btnImportQuizJson.addEventListener('click', () => this.dom.quizFileInput.click());
    this.dom.quizFileInput.addEventListener('change', (e) => this.handleImportJSON(e));

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /* -------------------------------------------------------------
     Keyboard Controls (1-4, Enter, M)
     ------------------------------------------------------------- */
  handleKeyboard(e) {
    // Do not capture keyboard if typing inside an input/textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    if (e.key === 'm' || e.key === 'M') {
      const enabled = this.sound.toggleSound();
      this.updateSoundButtonUI();
      this.showToast(enabled ? 'Sound Enabled' : 'Sound Muted', 'info');
      return;
    }

    if (this.dom.screenQuiz.classList.contains('active')) {
      if (!this.isAnswered) {
        let index = -1;
        if (['1', 'a', 'A'].includes(e.key)) index = 0;
        if (['2', 'b', 'B'].includes(e.key)) index = 1;
        if (['3', 'c', 'C'].includes(e.key)) index = 2;
        if (['4', 'd', 'D'].includes(e.key)) index = 3;

        if (index >= 0) {
          const btn = this.dom.optionsGrid.querySelector(`[data-index="${index}"]`);
          if (btn && !btn.disabled && !btn.classList.contains('disabled-50')) {
            btn.click();
          }
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.dom.btnNextQuestion.click();
        }
      }
    }
  }

  /* -------------------------------------------------------------
     Category Grid Rendering
     ------------------------------------------------------------- */
  renderCategoryGrid() {
    this.dom.categoryGrid.innerHTML = '';

    // "All Categories" option card
    const totalAllCount = this.allQuestions.length;
    const allCard = document.createElement('div');
    allCard.className = 'category-card selected';
    allCard.dataset.categoryId = 'all';
    allCard.style.setProperty('--cat-accent', 'var(--primary)');
    allCard.innerHTML = `
      <div class="cat-top">
        <div class="cat-icon-wrap">🌟</div>
        <span class="cat-count">${totalAllCount} Qs</span>
      </div>
      <h3 class="cat-title">All Categories Mixed</h3>
      <p class="cat-desc">Comprehensive gauntlet across programming, science, history, pop culture and general trivia.</p>
      <div class="cat-footer">
        <span class="cat-action-text">Click to start</span>
        <button class="cat-play-btn" type="button">Start Quiz ➔</button>
      </div>
    `;
    allCard.addEventListener('click', () => this.selectAndLaunchCategory('all', allCard));
    this.dom.categoryGrid.appendChild(allCard);

    // Individual category cards
    this.categories.forEach(cat => {
      const qCount = this.allQuestions.filter(q => q.category === cat.id).length;
      const card = document.createElement('div');
      card.className = 'category-card';
      card.dataset.categoryId = cat.id;
      card.style.setProperty('--cat-accent', cat.color);

      card.innerHTML = `
        <div class="cat-top">
          <div class="cat-icon-wrap">${cat.icon}</div>
          <span class="cat-count">${qCount} Qs</span>
        </div>
        <h3 class="cat-title">${cat.name}</h3>
        <p class="cat-desc">${cat.description}</p>
        <div class="cat-footer">
          <span class="cat-action-text">Click to start</span>
          <button class="cat-play-btn" type="button">Start Quiz ➔</button>
        </div>
      `;
      card.addEventListener('click', () => this.selectAndLaunchCategory(cat.id, card));
      this.dom.categoryGrid.appendChild(card);
    });

    // Custom quizzes if any
    const customQuizzes = this.storage.getCustomQuizzes();
    customQuizzes.forEach(cq => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.dataset.categoryId = `custom_${cq.id}`;
      card.style.setProperty('--cat-accent', '#10b981');

      card.innerHTML = `
        <div class="cat-top">
          <div class="cat-icon-wrap">📦</div>
          <span class="cat-count">${cq.questions.length} Qs</span>
        </div>
        <h3 class="cat-title">${cq.title}</h3>
        <p class="cat-desc">${cq.description || 'Custom player-created quiz pack.'}</p>
        <div class="cat-footer">
          <span class="cat-action-text">Click to start</span>
          <button class="cat-play-btn" type="button">Start Quiz ➔</button>
        </div>
      `;
      card.addEventListener('click', () => this.selectAndLaunchCategory(`custom_${cq.id}`, card));
      this.dom.categoryGrid.appendChild(card);
    });

    this.updateStartButtonLabel();
  }

  selectCategory(categoryId, targetCard) {
    this.selectedCategory = categoryId;
    this.dom.categoryGrid.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
    if (targetCard) targetCard.classList.add('selected');
    this.updateStartButtonLabel();
  }

  selectAndLaunchCategory(categoryId, targetCard) {
    this.sound.playClick();
    this.selectCategory(categoryId, targetCard);

    const catObj = this.categories.find(c => c.id === categoryId);
    const catName = categoryId === 'all' 
      ? 'All Categories Mixed' 
      : (catObj ? catObj.name : 'Custom Quiz');

    this.showToast(`Starting ${catName} challenge...`, 'info');

    // Immediate launch with smooth transition
    setTimeout(() => {
      this.startQuiz();
    }, 150);
  }

  updateStartButtonLabel() {
    if (!this.dom.btnStartLabel) return;
    const catObj = this.categories.find(c => c.id === this.selectedCategory);
    const catName = this.selectedCategory === 'all'
      ? 'Mixed Gauntlet'
      : (catObj ? catObj.name : 'Custom Quiz');

    this.dom.btnStartLabel.textContent = `Launch ${catName} (${this.selectedCount} Qs)`;
  }

  /* -------------------------------------------------------------
     Screen Navigation
     ------------------------------------------------------------- */
  showScreen(screenName) {
    this.dom.screenHome.classList.remove('active');
    this.dom.screenQuiz.classList.remove('active');
    this.dom.screenResults.classList.remove('active');

    if (screenName === 'home') this.dom.screenHome.classList.add('active');
    if (screenName === 'quiz') this.dom.screenQuiz.classList.add('active');
    if (screenName === 'results') this.dom.screenResults.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* -------------------------------------------------------------
     Game Setup & Launch
     ------------------------------------------------------------- */
  startQuiz() {
    this.playerName = this.dom.playerNameInput.value.trim() || 'Challenger';

    // 1. Gather pool of questions
    let pool = [];
    if (this.selectedCategory.startsWith('custom_')) {
      const customId = this.selectedCategory.replace('custom_', '');
      const customQuiz = this.storage.getCustomQuizzes().find(q => q.id === customId);
      pool = customQuiz ? [...customQuiz.questions] : [...this.allQuestions];
    } else if (this.selectedCategory === 'all') {
      pool = [...this.allQuestions];
    } else {
      pool = this.allQuestions.filter(q => q.category === this.selectedCategory);
    }

    // 2. Filter by difficulty if specified
    if (this.selectedDifficulty !== 'all') {
      const diffFiltered = pool.filter(q => q.difficulty === this.selectedDifficulty);
      if (diffFiltered.length > 0) {
        pool = diffFiltered;
      }
    }

    // 3. Shuffle question order
    pool = this.shuffleArray(pool);

    // 4. Slice count
    const count = Math.min(this.selectedCount, pool.length);
    this.activeQuestions = pool.slice(0, count);

    if (this.activeQuestions.length === 0) {
      this.showToast('No questions found for this selection. Try different settings.', 'warning');
      return;
    }

    // Reset Game Session Metrics
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.userAnswers = [];

    // Reset Lifelines
    this.lifelines = {
      fiftyFifty: true,
      freeze: true,
      hint: true,
      skip: true
    };
    this.updateLifelinesUI();

    this.dom.currentScore.textContent = '0';
    this.updateStreakUI();

    this.showScreen('quiz');
    this.renderCurrentQuestion();
  }

  /* -------------------------------------------------------------
     Render Current Question
     ------------------------------------------------------------- */
  renderCurrentQuestion() {
    const q = this.activeQuestions[this.currentIndex];
    this.isAnswered = false;
    this.questionStartTime = Date.now();

    // Top Bar Status
    this.dom.quizQuestionCounter.textContent = `Question ${this.currentIndex + 1} / ${this.activeQuestions.length}`;
    
    // Category Tag
    const catObj = this.categories.find(c => c.id === q.category) || { name: 'Trivia', icon: '⚡' };
    this.dom.quizCategoryTag.innerHTML = `<span>${catObj.icon}</span> ${catObj.name}`;
    this.dom.qCategoryName.textContent = catObj.name;

    // Difficulty Badge
    const diff = q.difficulty || 'medium';
    this.dom.qDifficultyBadge.className = `difficulty-badge diff-${diff}`;
    this.dom.qDifficultyBadge.textContent = diff.toUpperCase();

    // Progress Bar
    const progressPercent = ((this.currentIndex) / this.activeQuestions.length) * 100;
    this.dom.quizProgressFill.style.width = `${progressPercent}%`;

    // Question Text & Snippet
    this.dom.questionText.textContent = q.question;
    if (q.codeSnippet) {
      this.dom.codeSnippetBox.style.display = 'block';
      this.dom.codeSnippetText.textContent = q.codeSnippet;
    } else {
      this.dom.codeSnippetBox.style.display = 'none';
    }

    // Render Options
    this.dom.optionsGrid.innerHTML = '';
    const keyLabels = ['A', 'B', 'C', 'D'];

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.dataset.index = index;
      btn.innerHTML = `
        <span class="option-key">${keyLabels[index] || index + 1}</span>
        <span class="option-text">${this.escapeHTML(optText)}</span>
      `;
      btn.addEventListener('click', () => this.handleOptionClick(index, btn));
      this.dom.optionsGrid.appendChild(btn);
    });

    // Reset Explanation & Next Button
    this.dom.explanationBox.className = 'explanation-box';
    this.dom.explanationBox.classList.remove('show');
    this.dom.btnNextQuestion.style.display = 'none';

    // Start Timer
    this.startTimer(20);
  }

  /* -------------------------------------------------------------
     Timer Logic
     ------------------------------------------------------------- */
  startTimer(seconds = 20) {
    this.stopTimer();
    this.timerSeconds = seconds;
    this.totalQuestionSeconds = seconds;
    this.isTimerPaused = false;
    this.updateTimerUI();

    this.timerInterval = setInterval(() => {
      if (this.isTimerPaused) return;

      this.timerSeconds--;
      this.updateTimerUI();

      if (this.timerSeconds <= 5 && this.timerSeconds > 0) {
        this.sound.playTick();
      }

      if (this.timerSeconds <= 0) {
        this.stopTimer();
        this.handleTimeOut();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerUI() {
    this.dom.timerText.textContent = this.timerSeconds;
    const maxOffset = 126; // 2 * PI * r (r=20)
    const ratio = Math.max(0, this.timerSeconds) / this.totalQuestionSeconds;
    const offset = maxOffset * (1 - ratio);
    this.dom.timerCircleBar.style.strokeDashoffset = offset;

    if (this.timerSeconds <= 5) {
      this.dom.timerWrap.classList.add('timer-urgent');
    } else {
      this.dom.timerWrap.classList.remove('timer-urgent');
    }
  }

  handleTimeOut() {
    if (this.isAnswered) return;
    this.isAnswered = true;
    this.sound.playTimeOut();

    const q = this.activeQuestions[this.currentIndex];

    // Reset streak on timeout
    this.currentStreak = 0;
    this.updateStreakUI();

    // Record review answer
    this.userAnswers.push({
      question: q,
      chosenIndex: -1, // timed out
      isCorrect: false,
      timeTaken: this.totalQuestionSeconds
    });

    // Highlight true correct option
    const optionButtons = this.dom.optionsGrid.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      btn.disabled = true;
      if (parseInt(btn.dataset.index, 10) === q.correctIndex) {
        btn.classList.add('correct');
      }
    });

    // Show Explanation
    this.revealExplanation(false, '⏰ Time Expired! The correct answer is highlighted above.');
    this.showNextButton();
  }

  /* -------------------------------------------------------------
     Option Selection & Scoring Engine
     ------------------------------------------------------------- */
  handleOptionClick(selectedIndex, chosenButton) {
    if (this.isAnswered) return;
    this.isAnswered = true;
    this.stopTimer();

    const q = this.activeQuestions[this.currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    const timeTaken = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));

    // Disable all options
    const optionButtons = this.dom.optionsGrid.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      btn.disabled = true;
      if (parseInt(btn.dataset.index, 10) === q.correctIndex) {
        btn.classList.add('correct');
      }
    });

    if (isCorrect) {
      chosenButton.classList.add('correct');
      this.sound.playCorrect();
      this.correctCount++;
      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
      }

      // Dynamic Points Formula
      const basePoints = 100;
      const speedBonus = Math.max(0, this.timerSeconds) * 10;
      const streakMultiplier = Math.min(3, 1 + (this.currentStreak - 1) * 0.25);
      const difficultyFactor = q.difficulty === 'hard' ? 1.5 : (q.difficulty === 'medium' ? 1.25 : 1.0);

      const pointsEarned = Math.round((basePoints + speedBonus) * streakMultiplier * difficultyFactor);
      this.score += pointsEarned;
      this.animateScoreCounter(this.score);

      this.revealExplanation(true, `Superb! +${pointsEarned} pts earned (Speed Bonus: +${speedBonus}, Streak: ${this.currentStreak}x)`);
    } else {
      chosenButton.classList.add('incorrect');
      this.sound.playIncorrect();
      this.currentStreak = 0;
      this.revealExplanation(false, 'Incorrect! Check the breakdown below to understand why.');
    }

    this.updateStreakUI();

    // Save for Review Accordion
    this.userAnswers.push({
      question: q,
      chosenIndex: selectedIndex,
      isCorrect,
      timeTaken
    });

    this.showNextButton();
  }

  animateScoreCounter(targetVal) {
    this.dom.currentScore.textContent = targetVal;
    this.dom.currentScore.classList.add('pop');
    setTimeout(() => this.dom.currentScore.classList.remove('pop'), 200);
  }

  updateStreakUI() {
    if (this.currentStreak >= 2) {
      this.dom.streakBadge.style.display = 'inline-flex';
      this.dom.streakCount.textContent = this.currentStreak;
    } else {
      this.dom.streakBadge.style.display = 'none';
    }
  }

  revealExplanation(isCorrect, heading) {
    const q = this.activeQuestions[this.currentIndex];
    this.dom.explanationIcon.textContent = isCorrect ? '🎉' : '💡';
    this.dom.explanationHeading.textContent = heading;
    this.dom.explanationText.textContent = q.explanation || 'Review the core concepts for this category to master similar questions.';
    this.dom.explanationBox.classList.add('show');
  }

  showNextButton() {
    this.dom.btnNextQuestion.style.display = 'inline-flex';
    const isLast = this.currentIndex === this.activeQuestions.length - 1;
    this.dom.btnNextQuestion.innerHTML = isLast ? 'Finish Challenge <span>🏁</span>' : 'Next Question <span>➔</span>';
  }

  nextQuestion() {
    if (this.currentIndex < this.activeQuestions.length - 1) {
      this.currentIndex++;
      this.renderCurrentQuestion();
    } else {
      this.finishQuiz();
    }
  }

  /* -------------------------------------------------------------
     Lifelines Mechanics
     ------------------------------------------------------------- */
  updateLifelinesUI() {
    this.dom.lifeline5050.disabled = !this.lifelines.fiftyFifty;
    this.dom.lifelineFreeze.disabled = !this.lifelines.freeze;
    this.dom.lifelineHint.disabled = !this.lifelines.hint;
    this.dom.lifelineSkip.disabled = !this.lifelines.skip;
  }

  useLifeline5050() {
    if (!this.lifelines.fiftyFifty || this.isAnswered) return;
    this.lifelines.fiftyFifty = false;
    this.updateLifelinesUI();
    this.sound.playLifeline();

    const q = this.activeQuestions[this.currentIndex];
    const wrongIndices = [0, 1, 2, 3].filter(idx => idx !== q.correctIndex);
    const shuffledWrong = this.shuffleArray(wrongIndices);
    const toRemove = shuffledWrong.slice(0, 2);

    toRemove.forEach(idx => {
      const btn = this.dom.optionsGrid.querySelector(`[data-index="${idx}"]`);
      if (btn) btn.classList.add('disabled-50');
    });

    this.showToast('50:50 Activated: Two wrong answers eliminated!', 'info');
  }

  useLifelineFreeze() {
    if (!this.lifelines.freeze || this.isAnswered) return;
    this.lifelines.freeze = false;
    this.updateLifelinesUI();
    this.sound.playLifeline();

    this.timerSeconds += 10;
    this.totalQuestionSeconds += 10;
    this.isTimerPaused = true;
    this.updateTimerUI();

    this.showToast('⏱️ Timer Frozen for 5s & +10s added!', 'info');
    setTimeout(() => {
      this.isTimerPaused = false;
    }, 5000);
  }

  useLifelineHint() {
    if (!this.lifelines.hint || this.isAnswered) return;
    this.lifelines.hint = false;
    this.updateLifelinesUI();
    this.sound.playLifeline();

    const q = this.activeQuestions[this.currentIndex];
    const words = (q.explanation || '').split('. ')[0];
    this.showToast(`💡 Hint: ${words || 'Read the question context carefully!'}`, 'info');
  }

  useLifelineSkip() {
    if (!this.lifelines.skip || this.isAnswered) return;
    this.lifelines.skip = false;
    this.updateLifelinesUI();
    this.sound.playLifeline();

    this.stopTimer();
    this.showToast('Question Skipped without penalty', 'info');
    this.nextQuestion();
  }

  /* -------------------------------------------------------------
     Quiz Completion & Results Stage
     ------------------------------------------------------------- */
  finishQuiz() {
    this.stopTimer();
    this.dom.quizProgressFill.style.width = '100%';

    const total = this.activeQuestions.length;
    const accuracy = total > 0 ? Math.round((this.correctCount / total) * 100) : 0;

    // Display Results
    this.dom.resScore.textContent = this.score;
    this.dom.resAccuracy.textContent = `${accuracy}%`;
    this.dom.resCorrect.textContent = `${this.correctCount} / ${total}`;
    this.dom.resMaxStreak.textContent = this.maxStreak;

    // Dynamic Title & Badge
    if (accuracy >= 90) {
      this.dom.resultsBadge.textContent = '👑';
      this.dom.resultsTitle.textContent = 'Grandmaster Genius!';
      this.dom.resultsSubtext.textContent = 'Flawless precision! You completely conquered this gauntlet.';
      this.sound.playVictory();
      this.confetti.launch(4000, 160);
    } else if (accuracy >= 70) {
      this.dom.resultsBadge.textContent = '🌟';
      this.dom.resultsTitle.textContent = 'Magnificent Effort!';
      this.dom.resultsSubtext.textContent = 'Solid understanding and great instincts on difficult questions.';
      this.sound.playVictory();
      this.confetti.launch(2500, 90);
    } else if (accuracy >= 50) {
      this.dom.resultsBadge.textContent = '⚔️';
      this.dom.resultsTitle.textContent = 'Valiant Challenger!';
      this.dom.resultsSubtext.textContent = 'A respectable attempt. Review the concepts and run it back!';
    } else {
      this.dom.resultsBadge.textContent = '🌱';
      this.dom.resultsTitle.textContent = 'Knowledge in Training';
      this.dom.resultsSubtext.textContent = 'Every mistake is a lesson. Check the review below and try again!';
    }

    // Persist score in Leaderboard & Stats
    const categoryName = this.categories.find(c => c.id === this.selectedCategory)?.name || 'Mixed Categories';
    this.storage.saveScore({
      name: this.playerName,
      score: this.score,
      category: categoryName,
      difficulty: this.selectedDifficulty,
      accuracy,
      correctCount: this.correctCount,
      totalQuestions: total
    });

    // Populate Detailed Review
    this.renderReviewList();

    this.showScreen('results');
  }

  renderReviewList() {
    this.dom.reviewList.innerHTML = '';
    const keyLabels = ['A', 'B', 'C', 'D'];

    this.userAnswers.forEach((item, index) => {
      const q = item.question;
      const reviewEl = document.createElement('div');
      reviewEl.className = `review-item ${item.isCorrect ? 'was-correct' : 'was-wrong'}`;

      let userChoiceHtml = '';
      if (item.chosenIndex === -1) {
        userChoiceHtml = `<div class="review-choice user-pick">⏱️ Your answer: Timed out</div>`;
      } else {
        const userChoiceText = q.options[item.chosenIndex] || 'None';
        userChoiceHtml = `<div class="review-choice ${item.isCorrect ? 'correct-pick' : 'user-pick'}">
          ${item.isCorrect ? '✅' : '❌'} Your answer: <strong>${keyLabels[item.chosenIndex]}: ${this.escapeHTML(userChoiceText)}</strong>
        </div>`;
      }

      const correctChoiceText = q.options[q.correctIndex];
      const correctChoiceHtml = !item.isCorrect ? `
        <div class="review-choice correct-pick">
          🎯 Correct answer: <strong>${keyLabels[q.correctIndex]}: ${this.escapeHTML(correctChoiceText)}</strong>
        </div>
      ` : '';

      reviewEl.innerHTML = `
        <div class="review-q-title">Q${index + 1}: ${this.escapeHTML(q.question)}</div>
        <div class="review-choices">
          ${userChoiceHtml}
          ${correctChoiceHtml}
        </div>
        <p style="font-size: 0.85rem; color: var(--text-dim); margin-top: 0.6rem;">
          💡 <em>${this.escapeHTML(q.explanation || '')}</em>
        </p>
      `;

      this.dom.reviewList.appendChild(reviewEl);
    });
  }

  shareScore() {
    const text = `⚡ I scored ${this.score} pts with ${this.dom.resAccuracy.textContent} accuracy on QuizFlow Pro! Can you beat my high score?`;
    if (navigator.share) {
      navigator.share({
        title: 'QuizFlow Pro Result',
        text,
        url: window.location.href
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.showToast('Result copied to clipboard! Paste it to challenge friends.', 'info');
    }
  }

  /* -------------------------------------------------------------
     Modals: Leaderboard & Stats
     ------------------------------------------------------------- */
  openLeaderboardModal() {
    this.sound.playClick();
    const list = this.storage.getLeaderboard();
    this.dom.leaderboardList.innerHTML = '';

    if (list.length === 0) {
      this.dom.leaderboardList.innerHTML = `<p style="text-align: center; color: var(--text-dim); padding: 2rem;">No scores recorded yet. Be the first!</p>`;
    } else {
      list.forEach((entry, idx) => {
        const item = document.createElement('div');
        item.className = 'lb-entry';

        let rankBadge = `${idx + 1}`;
        let rankClass = '';
        if (idx === 0) { rankBadge = '🥇'; rankClass = 'rank-1'; }
        if (idx === 1) { rankBadge = '🥈'; rankClass = 'rank-2'; }
        if (idx === 2) { rankBadge = '🥉'; rankClass = 'rank-3'; }

        item.innerHTML = `
          <div class="lb-left">
            <div class="lb-rank ${rankClass}">${rankBadge}</div>
            <div class="lb-user-details">
              <h4>${this.escapeHTML(entry.name)}</h4>
              <p>${entry.category} • ${entry.difficulty || 'Medium'} • Acc: ${entry.accuracy}% • ${entry.date || 'Recent'}</p>
            </div>
          </div>
          <div class="lb-score">${entry.score.toLocaleString()} pts</div>
        `;
        this.dom.leaderboardList.appendChild(item);
      });
    }

    this.dom.modalLeaderboard.classList.add('open');
  }

  openStatsModal() {
    this.sound.playClick();
    const stats = this.storage.getStats();

    this.dom.statTotalGames.textContent = stats.gamesPlayed || 0;
    this.dom.statTotalPoints.textContent = (stats.totalScore || 0).toLocaleString();

    const overallAcc = stats.totalQuestions > 0
      ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
      : 0;
    this.dom.statOverallAcc.textContent = `${overallAcc}%`;

    // Category breakdown
    this.dom.categoryStatsContainer.innerHTML = '';
    const catStats = stats.categoryStats || {};
    const catKeys = Object.keys(catStats);

    if (catKeys.length === 0) {
      this.dom.categoryStatsContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-dim);">Play games to generate performance stats per category!</p>`;
    } else {
      catKeys.forEach(catName => {
        const data = catStats[catName];
        const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        const row = document.createElement('div');
        row.style.marginBottom = '1rem';
        row.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">
            <span>${this.escapeHTML(catName)}</span>
            <span>${acc}% (${data.correct}/${data.total})</span>
          </div>
          <div class="progress-rail" style="margin-bottom: 0;">
            <div class="progress-fill" style="width: ${acc}%;"></div>
          </div>
        `;
        this.dom.categoryStatsContainer.appendChild(row);
      });
    }

    this.dom.modalStats.classList.add('open');
  }

  /* -------------------------------------------------------------
     Modal: Custom Quiz Creator & JSON Importer
     ------------------------------------------------------------- */
  openCreatorModal() {
    this.sound.playClick();
    this.dom.customQuizTitle.value = '';
    this.dom.customQuizDesc.value = '';
    this.dom.customQuestionsList.innerHTML = '';
    // Seed with 2 blank questions
    this.addCustomQuestionFormItem();
    this.addCustomQuestionFormItem();
    this.dom.modalCreator.classList.add('open');
  }

  addCustomQuestionFormItem(qData = null) {
    const qIndex = this.dom.customQuestionsList.children.length;
    const item = document.createElement('div');
    item.className = 'custom-q-item';

    const qText = qData?.question || '';
    const opt0 = qData?.options?.[0] || '';
    const opt1 = qData?.options?.[1] || '';
    const opt2 = qData?.options?.[2] || '';
    const opt3 = qData?.options?.[3] || '';
    const correctIdx = qData?.correctIndex ?? 0;
    const expl = qData?.explanation || '';

    item.innerHTML = `
      <button type="button" class="btn-remove-q" title="Remove question">✕</button>
      <div class="form-group">
        <label class="form-label">Question #${qIndex + 1}</label>
        <input type="text" class="form-control custom-q-input" placeholder="Type your question..." value="${this.escapeHTML(qText)}" required>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
        <div>
          <label class="form-label">Option A</label>
          <input type="text" class="form-control custom-opt-0" placeholder="Option A" value="${this.escapeHTML(opt0)}" required>
        </div>
        <div>
          <label class="form-label">Option B</label>
          <input type="text" class="form-control custom-opt-1" placeholder="Option B" value="${this.escapeHTML(opt1)}" required>
        </div>
        <div>
          <label class="form-label">Option C</label>
          <input type="text" class="form-control custom-opt-2" placeholder="Option C" value="${this.escapeHTML(opt2)}" required>
        </div>
        <div>
          <label class="form-label">Option D</label>
          <input type="text" class="form-control custom-opt-3" placeholder="Option D" value="${this.escapeHTML(opt3)}" required>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem;">
        <div>
          <label class="form-label">Correct Option</label>
          <select class="form-control custom-correct-select">
            <option value="0" ${correctIdx === 0 ? 'selected' : ''}>Option A</option>
            <option value="1" ${correctIdx === 1 ? 'selected' : ''}>Option B</option>
            <option value="2" ${correctIdx === 2 ? 'selected' : ''}>Option C</option>
            <option value="3" ${correctIdx === 3 ? 'selected' : ''}>Option D</option>
          </select>
        </div>
        <div>
          <label class="form-label">Explanation / Hint</label>
          <input type="text" class="form-control custom-expl-input" placeholder="Why is this answer correct?" value="${this.escapeHTML(expl)}">
        </div>
      </div>
    `;

    item.querySelector('.btn-remove-q').addEventListener('click', () => {
      item.remove();
      this.updateCustomQuestionsCount();
    });

    this.dom.customQuestionsList.appendChild(item);
    this.updateCustomQuestionsCount();
  }

  updateCustomQuestionsCount() {
    this.dom.customQCount.textContent = this.dom.customQuestionsList.children.length;
  }

  collectCustomQuizData() {
    const title = this.dom.customQuizTitle.value.trim();
    if (!title) {
      this.showToast('Please specify a title for your custom quiz', 'warning');
      return null;
    }

    const questionItems = this.dom.customQuestionsList.querySelectorAll('.custom-q-item');
    if (questionItems.length === 0) {
      this.showToast('Please add at least 1 question', 'warning');
      return null;
    }

    const questions = [];
    for (let i = 0; i < questionItems.length; i++) {
      const el = questionItems[i];
      const qText = el.querySelector('.custom-q-input').value.trim();
      const o0 = el.querySelector('.custom-opt-0').value.trim();
      const o1 = el.querySelector('.custom-opt-1').value.trim();
      const o2 = el.querySelector('.custom-opt-2').value.trim();
      const o3 = el.querySelector('.custom-opt-3').value.trim();
      const correctIndex = parseInt(el.querySelector('.custom-correct-select').value, 10);
      const explanation = el.querySelector('.custom-expl-input').value.trim();

      if (!qText || !o0 || !o1 || !o2 || !o3) {
        this.showToast(`Please fill all text and options for Question #${i + 1}`, 'warning');
        return null;
      }

      questions.push({
        id: `custom_${Date.now()}_${i}`,
        category: 'custom',
        difficulty: 'medium',
        question: qText,
        options: [o0, o1, o2, o3],
        correctIndex,
        explanation
      });
    }

    return {
      id: Date.now().toString(),
      title,
      description: this.dom.customQuizDesc.value.trim() || 'Custom user quiz',
      questions
    };
  }

  saveAndPlayCustomQuiz() {
    const quizData = this.collectCustomQuizData();
    if (!quizData) return;

    this.storage.saveCustomQuiz(quizData);
    this.renderCategoryGrid();
    this.dom.modalCreator.classList.remove('open');
    this.showToast(`Quiz "${quizData.title}" saved! Launching challenge...`, 'info');

    // Auto select this custom quiz and launch
    this.selectedCategory = `custom_${quizData.id}`;
    this.startQuiz();
  }

  exportCustomQuizJSON() {
    const quizData = this.collectCustomQuizData();
    if (!quizData) return;

    const jsonStr = JSON.stringify(quizData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizData.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_quiz.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Quiz JSON exported successfully!', 'info');
  }

  handleImportJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.title || !Array.isArray(parsed.questions)) {
          throw new Error('Invalid quiz JSON structure. Must have "title" and "questions" array.');
        }

        this.dom.customQuizTitle.value = parsed.title;
        this.dom.customQuizDesc.value = parsed.description || '';
        this.dom.customQuestionsList.innerHTML = '';

        parsed.questions.forEach(q => this.addCustomQuestionFormItem(q));
        this.showToast(`Imported ${parsed.questions.length} questions from JSON!`, 'info');
      } catch (err) {
        this.showToast(`Import Failed: ${err.message}`, 'warning');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  }

  /* -------------------------------------------------------------
     Utility Functions
     ------------------------------------------------------------- */
  shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'warning' ? '⚠️' : '⚡';
    toast.innerHTML = `<span>${icon}</span> <span>${this.escapeHTML(message)}</span>`;
    this.dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Instantiate application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new QuizApp();
});
