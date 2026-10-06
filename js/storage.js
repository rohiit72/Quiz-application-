/**
 * QuizFlow Storage & Leaderboard Manager
 * Handles local persistence, game analytics, custom quiz saving, and import/export.
 */
const STORAGE_KEYS = {
  LEADERBOARD: 'quizflow_leaderboard_v1',
  STATS: 'quizflow_stats_v1',
  CUSTOM_QUIZZES: 'quizflow_custom_quizzes_v1',
  ROOMS: 'quizflow_rooms_v1',
  SETTINGS: 'quizflow_settings_v1'
};

class StorageManager {
  constructor() {
    this.initDefaults();
  }

  initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) {
      // Seed initial sample leaderboard for immediate realistic visual
      const sampleLeaderboard = [
        { name: 'Alex Rivera', score: 1420, category: 'Web Dev', difficulty: 'Hard', date: '2026-09-28', accuracy: 95 },
        { name: 'Sophia Chen', score: 1250, category: 'Science & Tech', difficulty: 'Medium', date: '2026-10-01', accuracy: 90 },
        { name: 'Marcus Vance', score: 1100, category: 'General Knowledge', difficulty: 'Medium', date: '2026-10-02', accuracy: 85 },
        { name: 'Elena Rostova', score: 980, category: 'Geography & History', difficulty: 'Easy', date: '2026-10-03', accuracy: 80 }
      ];
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(sampleLeaderboard));
    }

    if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
      const initialStats = {
        gamesPlayed: 0,
        totalScore: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        categoryStats: {}
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initialStats));
    }

    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_QUIZZES)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
      const sampleRooms = [
        {
          code: 'QZ-DEMO',
          title: 'Mixed Knowledge Gauntlet',
          category: 'all',
          difficulty: 'all',
          count: 10,
          hostName: 'QuizMaster Pro',
          createdAt: Date.now() - 3600000
        },
        {
          code: 'WEB-101',
          title: 'Web Dev & JavaScript Sprint',
          category: 'web_dev',
          difficulty: 'medium',
          count: 10,
          hostName: 'Alex Dev',
          createdAt: Date.now() - 7200000
        },
        {
          code: 'TECH-202',
          title: 'Science & Innovation Quest',
          category: 'science_tech',
          difficulty: 'medium',
          count: 10,
          hostName: 'Sophia Sci',
          createdAt: Date.now() - 10800000
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(sampleRooms));
    }
  }

  getLeaderboard() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD)) || [];
    } catch {
      return [];
    }
  }

  saveScore(entry) {
    const leaderboard = this.getLeaderboard();
    leaderboard.push({
      id: Date.now().toString(),
      name: entry.name || 'Anonymous Player',
      score: entry.score || 0,
      category: entry.category || 'Mixed',
      difficulty: entry.difficulty || 'Medium',
      mode: entry.mode || 'Standard',
      accuracy: entry.accuracy || 0,
      date: new Date().toISOString().split('T')[0]
    });

    // Sort descending by score and keep top 50
    leaderboard.sort((a, b) => b.score - a.score);
    const trimmed = leaderboard.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(trimmed));

    this.updateStats(entry);
    return trimmed;
  }

  clearLeaderboard() {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify([]));
  }

  getStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || {};
    } catch {
      return {};
    }
  }

  updateStats(gameSummary) {
    const stats = this.getStats();
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    stats.totalScore = (stats.totalScore || 0) + (gameSummary.score || 0);
    stats.correctAnswers = (stats.correctAnswers || 0) + (gameSummary.correctCount || 0);
    stats.totalQuestions = (stats.totalQuestions || 0) + (gameSummary.totalQuestions || 0);

    const cat = gameSummary.category || 'General';
    if (!stats.categoryStats) stats.categoryStats = {};
    if (!stats.categoryStats[cat]) {
      stats.categoryStats[cat] = { played: 0, correct: 0, total: 0 };
    }
    stats.categoryStats[cat].played += 1;
    stats.categoryStats[cat].correct += gameSummary.correctCount || 0;
    stats.categoryStats[cat].total += gameSummary.totalQuestions || 0;

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  // Custom Quizzes
  getCustomQuizzes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_QUIZZES)) || [];
    } catch {
      return [];
    }
  }

  saveCustomQuiz(quiz) {
    const quizzes = this.getCustomQuizzes();
    const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
    if (existingIndex >= 0) {
      quizzes[existingIndex] = quiz;
    } else {
      quizzes.unshift(quiz);
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify(quizzes));
    return quizzes;
  }

  deleteCustomQuiz(quizId) {
    let quizzes = this.getCustomQuizzes();
    quizzes = quizzes.filter(q => q.id !== quizId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_QUIZZES, JSON.stringify(quizzes));
    return quizzes;
  }

  // Quiz Rooms (QR Code & Join Code sessions)
  getRooms() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS)) || [];
    } catch {
      return [];
    }
  }

  getRoom(code) {
    if (!code) return null;
    const cleanCode = code.trim().toUpperCase();
    const rooms = this.getRooms();
    return rooms.find(r => r.code.toUpperCase() === cleanCode) || null;
  }

  saveRoom(room) {
    const rooms = this.getRooms();
    const cleanCode = room.code.trim().toUpperCase();
    const existingIndex = rooms.findIndex(r => r.code.toUpperCase() === cleanCode);
    const roomRecord = {
      ...room,
      code: cleanCode,
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      rooms[existingIndex] = roomRecord;
    } else {
      rooms.unshift(roomRecord);
    }

    // Keep up to 30 active rooms
    const trimmed = rooms.slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(trimmed));
    return roomRecord;
  }

  deleteRoom(code) {
    const cleanCode = code.trim().toUpperCase();
    let rooms = this.getRooms().filter(r => r.code.toUpperCase() !== cleanCode);
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    return rooms;
  }

  // Settings
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || { sound: true, playerName: 'Challenger' };
    } catch {
      return { sound: true, playerName: 'Challenger' };
    }
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }
}

window.storageManager = new StorageManager();
