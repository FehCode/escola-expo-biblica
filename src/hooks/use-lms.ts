'use client';

import { useState, useEffect } from 'react';
import { coursesData, questionBankData, Progress, QBankStats } from '@/lib/data';

export function useLMS() {
  const [progress, setProgress] = useState<Progress>({});
  const [qbankStats, setQbankStats] = useState<QBankStats>({ correct: 0, incorrect: 0, history: [] });
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeQBankId, setActiveQBankId] = useState<string | null>(null);
  const [chatbotHistory, setChatbotHistory] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([]);
  const [currentView, setCurrentView] = useState('dashboard');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('lmsProgress');
    const savedQBankStats = localStorage.getItem('lmsQBankStats');
    const lastView = localStorage.getItem('lms_last_view');
    const lastCourse = localStorage.getItem('lms_last_course_id');

    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedQBankStats) setQbankStats(JSON.parse(savedQBankStats));
    if (lastView) setCurrentView(lastView);
    if (lastCourse) setActiveCourseId(lastCourse);
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('lmsProgress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('lmsQBankStats', JSON.stringify(qbankStats));
  }, [qbankStats]);

  const saveProgress = (newProgress: Progress) => {
    setProgress(newProgress);
  };

  const saveQBankStats = (newStats: QBankStats) => {
    setQbankStats(newStats);
  };

  const isLessonCompleted = (courseId: string, lessonId: string): boolean => {
    return progress[courseId]?.completedLessons?.includes(lessonId) || false;
  };

  const getCourseProgress = (courseId: string): number => {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return 0;
    
    const lessonItems = course.lessons.filter(l => l.type !== 'quiz');
    const courseProgress = progress[courseId];
    if (!courseProgress || lessonItems.length === 0) return 0;
    
    const completedCount = courseProgress.completedLessons.filter(id => !id.includes('quiz')).length;
    return (completedCount / lessonItems.length) * 100;
  };

  const markLessonComplete = (courseId: string, lessonId: string) => {
    const newProgress = { ...progress };
    if (!newProgress[courseId]) {
      newProgress[courseId] = { completedLessons: [] };
    }
    
    if (!newProgress[courseId].completedLessons.includes(lessonId)) {
      newProgress[courseId].completedLessons.push(lessonId);
      saveProgress(newProgress);
    }
  };

  const updateLastLesson = (courseId: string, lessonId: string) => {
    const newProgress = { ...progress };
    if (!newProgress[courseId]) {
      newProgress[courseId] = { completedLessons: [], lastLesson: lessonId };
    } else {
      newProgress[courseId].lastLesson = lessonId;
    }
    saveProgress(newProgress);
  };

  const setQuizScore = (courseId: string, score: number) => {
    const newProgress = { ...progress };
    if (!newProgress[courseId]) {
      newProgress[courseId] = { completedLessons: [], quizScore: score };
    } else {
      newProgress[courseId].quizScore = score;
    }
    saveProgress(newProgress);
  };

  const addQBankHistory = (questionId: string, status: 'correct' | 'incorrect') => {
    const newStats = { ...qbankStats };
    if (status === 'correct') {
      newStats.correct++;
    } else {
      newStats.incorrect++;
    }
    
    newStats.history.unshift({ id: questionId, status });
    if (newStats.history.length > 5) {
      newStats.history.pop();
    }
    
    saveQBankStats(newStats);
  };

  const addChatMessage = (role: 'user' | 'bot', content: string) => {
    setChatbotHistory(prev => [...prev, { role, content }]);
  };

  const changeView = (view: string) => {
    setCurrentView(view);
    localStorage.setItem('lms_last_view', view);
  };

  return {
    // Data
    courses: coursesData,
    questionBank: questionBankData,
    progress,
    qbankStats,
    activeCourseId,
    activeLessonId,
    activeQBankId,
    chatbotHistory,
    currentView,
    
    // Actions
    setActiveCourseId,
    setActiveLessonId,
    setActiveQBankId,
    changeView,
    isLessonCompleted,
    getCourseProgress,
    markLessonComplete,
    updateLastLesson,
    setQuizScore,
    addQBankHistory,
    addChatMessage,
  };
}