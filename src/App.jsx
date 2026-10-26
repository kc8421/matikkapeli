import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ConfigScreen from './components/ConfigScreen';
import TestScreen from './components/TestScreen';
import ResultsScreen from './components/ResultsScreen';
import ReportsScreen from './components/ReportsScreen';
import { generateTestQuestions } from './utils/mathGenerator';
import { 
  getSavedSessions, 
  saveSessionResult, 
  deleteSessionById, 
  clearAllSessions, 
  getHistoryStats,
  saveLastConfig,
  getLastConfig
} from './utils/storage';
import { soundManager } from './utils/sound';

const DEFAULT_CONFIG = {
  operations: ['addition'],
  maxNumber: 20,
  minNumber: 0,
  tableStart: 2,
  tableEnd: 5,
  selectedTables: [2, 3, 4, 5],
  multiplicationSelectionMode: 'range',
  questionCount: 10,
  feedbackMode: 'immediate',
  enableAssistance: true,
  maxFailedAttempts: 2,
};

export default function App() {
  const [view, setView] = useState('config'); // 'config' | 'test' | 'results' | 'reports'
  const [config, setConfig] = useState(() => getLastConfig() || DEFAULT_CONFIG);
  const [questions, setQuestions] = useState([]);
  const [lastSessionResult, setLastSessionResult] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalTests: 0, totalQuestions: 0, averagePercentage: 0, totalTimeSeconds: 0 });
  const [soundEnabled, setSoundEnabled] = useState(soundManager.enabled);

  // Load history on mount
  useEffect(() => {
    refreshHistoryData();
  }, []);

  const refreshHistoryData = () => {
    setSessions(getSavedSessions());
    setStats(getHistoryStats());
  };

  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  const handleStartTest = (newConfig) => {
    setConfig(newConfig);
    saveLastConfig(newConfig);
    const generated = generateTestQuestions(newConfig, newConfig.questionCount);
    setQuestions(generated);
    setView('test');
  };

  const handleCompleteTest = (testData) => {
    // Save to localStorage
    const saved = saveSessionResult({
      operations: testData.config.operations,
      questionCount: testData.questionCount,
      score: testData.score,
      timeTakenSeconds: testData.timeTakenSeconds,
      feedbackMode: testData.feedbackMode,
      config: testData.config,
      items: testData.recordedResults,
    });

    setLastSessionResult(saved);
    refreshHistoryData();
    setView('results');
  };

  const handleCancelTest = () => {
    setView('config');
  };

  const handleRetrySame = () => {
    const generated = generateTestQuestions(config, config.questionCount);
    setQuestions(generated);
    setView('test');
  };

  const handleNewConfig = () => {
    setView('config');
  };

  const handleViewReports = () => {
    refreshHistoryData();
    setView('reports');
  };

  const handleClearHistory = () => {
    clearAllSessions();
    refreshHistoryData();
  };

  const handleDeleteSession = (id) => {
    deleteSessionById(id);
    refreshHistoryData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-200">
      <Header
        currentView={view}
        onNavigate={(newView) => setView(newView)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      <main className="flex-1 flex flex-col">
        {view === 'config' && (
          <ConfigScreen
            initialConfig={config}
            onStartTest={handleStartTest}
          />
        )}

        {view === 'test' && (
          <TestScreen
            questions={questions}
            config={config}
            onCompleteTest={handleCompleteTest}
            onCancelTest={handleCancelTest}
          />
        )}

        {view === 'results' && (
          <ResultsScreen
            sessionResult={lastSessionResult}
            onRetrySame={handleRetrySame}
            onNewConfig={handleNewConfig}
            onViewReports={handleViewReports}
          />
        )}

        {view === 'reports' && (
          <ReportsScreen
            sessions={sessions}
            stats={stats}
            onClearHistory={handleClearHistory}
            onDeleteSession={handleDeleteSession}
            onStartNew={() => setView('config')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs font-semibold text-slate-400 select-none border-t border-slate-100 mt-auto">
        <p>Matikkapeli 🎒 • Suunniteltu alakoulun 1.–2. luokkalaisille</p>
      </footer>
    </div>
  );
}

