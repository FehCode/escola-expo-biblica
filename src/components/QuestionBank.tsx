'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, Target } from 'lucide-react';

interface QuestionBankProps {
  lms: {
    questionBank: any[];
    qbankStats: any;
    activeQBankId: string | null;
    setActiveQBankId: (id: string) => void;
    addQBankHistory: (questionId: string, status: 'correct' | 'incorrect') => void;
  };
}

export default function QuestionBank({ lms }: QuestionBankProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  const currentQuestion = lms.questionBank.find(q => q.id === lms.activeQBankId);

  useEffect(() => {
    if (!lms.activeQBankId && lms.questionBank.length > 0) {
      loadNextQuestion();
    }
  }, [lms.activeQBankId, lms.questionBank]);

  const loadNextQuestion = () => {
    const availableQuestions = lms.questionBank.filter(q => q.id !== lms.activeQBankId);
    if (availableQuestions.length === 0) return;
    
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    lms.setActiveQBankId(randomQuestion.id);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion?.answer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Update streak
    if (correct) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setTotalAttempts(prev => prev + 1);
    lms.addQBankHistory(currentQuestion.id, correct ? 'correct' : 'incorrect');
  };

  const getAccuracy = () => {
    if (totalAttempts === 0) return 0;
    return Math.round((lms.qbankStats.correct / totalAttempts) * 100);
  };

  const renderHistoryItem = (item: any) => {
    const question = lms.questionBank.find(q => q.id === item.id);
    if (!question) return null;
    
    return (
      <div key={item.id} className="flex items-center gap-2 text-sm text-slate-600 p-2 rounded hover:bg-slate-50">
        {item.status === 'correct' ? (
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        )}
        <span className="truncate flex-grow">{question.question.substring(0, 40)}...</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Banco de Questões</h2>
      <p className="text-slate-600 mb-8">Teste seu conhecimento com questões aleatórias sobre hermenêutica e teologia.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question Container */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          {currentQuestion ? (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <span className="inline-block bg-slate-100 text-slate-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {currentQuestion.topic}
                </span>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{totalAttempts} tentativas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span>{streak} sequência</span>
                  </div>
                </div>
              </div>
              
              {/* Question */}
              <p className="font-semibold text-lg leading-relaxed">{currentQuestion.question}</p>
              
              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showResult}
                    className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                      selectedAnswer === option
                        ? showResult
                          ? isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-indigo-500 bg-indigo-50'
                        : showResult && option === currentQuestion.answer
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{option}</span>
                      {showResult && option === currentQuestion.answer && (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                      )}
                      {showResult && selectedAnswer === option && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Result Feedback */}
              {showResult && (
                <div className={`p-4 rounded-lg text-center ${
                  isCorrect ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                    <span className="font-semibold text-lg">
                      {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <p className="text-sm">
                      A resposta correta é: <strong>{currentQuestion.answer}</strong>
                    </p>
                  )}
                </div>
              )}
              
              {/* Next Question Button */}
              {showResult && (
                <div className="text-center">
                  <button
                    onClick={loadNextQuestion}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <RotateCcw className="h-5 w-5" />
                    Próxima Questão
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">Carregando questão...</p>
            </div>
          )}
        </div>

        {/* Stats and History */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-4">Estatísticas</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Corretas</span>
                </span>
                <span className="font-bold text-green-600 text-lg">{lms.qbankStats.correct}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Incorretas</span>
                </span>
                <span className="font-bold text-red-600 text-lg">{lms.qbankStats.incorrect}</span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Precisão</span>
                  <span className="font-bold text-indigo-600">{getAccuracy()}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getAccuracy()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* History Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-4">Histórico Recente</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {lms.qbankStats.history.length > 0 ? (
                lms.qbankStats.history.map(renderHistoryItem)
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">Nenhuma questão respondida ainda.</p>
                  <p className="text-slate-400 text-xs mt-2">Comece a responder para ver seu histórico aqui.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}