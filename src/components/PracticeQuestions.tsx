'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface PracticeQuestionsProps {
  lessonId: string;
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
  }>;
}

export default function PracticeQuestions({ lessonId, questions }: PracticeQuestionsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  if (!questions || questions.length === 0) {
    return (
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Questões de Prática</h3>
        </div>
        <p className="text-sm text-slate-600">
          Nenhuma questão de prática disponível para esta lição.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    setShowResult(true);
    
    // Mark this question as answered
    setAnsweredQuestions(prev => new Set([...prev, currentQuestionIndex]));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Reset to first question if at the end
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const resetQuestions = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnsweredQuestions(new Set());
  };

  const getAnswerButtonClass = (option: string) => {
    if (!showResult) {
      return selectedAnswer === option 
        ? 'border-indigo-500 bg-indigo-50' 
        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50';
    }
    
    if (option === currentQuestion.answer) {
      return 'border-green-500 bg-green-50';
    }
    
    if (selectedAnswer === option && !isCorrect) {
      return 'border-red-500 bg-red-50';
    }
    
    return 'border-slate-200';
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Questões de Prática</h3>
        </div>
        <button
          onClick={resetQuestions}
          className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </button>
      </div>
      
      <p className="text-sm text-slate-600 mb-6">
        Teste seu conhecimento com estas questões práticas sobre o conteúdo da lição.
      </p>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
          <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <p className="font-semibold text-lg mb-4">{currentQuestion.question}</p>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={showResult}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${getAnswerButtonClass(option)}`}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && option === currentQuestion.answer && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {showResult && selectedAnswer === option && !isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`mt-4 p-4 rounded-lg text-center ${
            isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-semibold">
                {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
              </span>
            </div>
            {!isCorrect && (
              <p className="text-sm">
                A resposta correta é: {currentQuestion.answer}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          
          {showResult && (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Próxima' : 'Voltar ao Início'}
            </button>
          )}
        </div>
      </div>

      {/* Question Indicators */}
      <div className="flex justify-center gap-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentQuestionIndex
                ? 'bg-indigo-600'
                : answeredQuestions.has(index)
                ? 'bg-green-500'
                : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}