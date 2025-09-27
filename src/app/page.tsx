'use client';

import { useState } from 'react';
import { useLMS } from '@/hooks/use-lms';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import Courses from '@/components/Courses';
import CourseDetail from '@/components/CourseDetail';
import QuestionBank from '@/components/QuestionBank';
import EnhancedChatbot from '@/components/EnhancedChatbot';

export default function Home() {
  const lms = useLMS();

  const renderCurrentView = () => {
    switch (lms.currentView) {
      case 'dashboard':
        return <Dashboard lms={lms} />;
      case 'courses':
        return <Courses lms={lms} />;
      case 'course-detail':
        return <CourseDetail lms={lms} />;
      case 'question-bank':
        return <QuestionBank lms={lms} />;
      case 'chatbot':
        return <EnhancedChatbot lms={lms} />;
      default:
        return <Dashboard lms={lms} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header lms={lms} />
      <main className="flex-grow p-4 sm:p-6 lg:px-8 lg:py-12">
        {renderCurrentView()}
      </main>
      <footer className="bg-white mt-8 shadow-inner">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          &copy; 2024 Escola de Exposição Bíblica. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}