'use client';

import { BookOpen, MessageSquare, HelpCircle, Home } from 'lucide-react';

interface HeaderProps {
  lms: {
    currentView: string;
    changeView: (view: string) => void;
  };
}

export default function Header({ lms }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: Home },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'question-bank', label: 'Questões', icon: HelpCircle },
    { id: 'chatbot', label: 'Apolo', icon: MessageSquare },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 
          className="text-xl font-bold text-slate-900 flex items-center gap-3 cursor-pointer"
          onClick={() => lms.changeView('dashboard')}
        >
          <BookOpen className="h-8 w-8 text-indigo-600" />
          <span>Escola de Exposição Bíblica</span>
        </h1>
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-link px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  lms.currentView === item.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => lms.changeView(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}