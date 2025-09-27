'use client';

import { CheckCircle, TrendingUp, BookOpen, ArrowRight, Clock, Award, Target } from 'lucide-react';
import { Course, Lesson, Progress } from '@/lib/data';

interface DashboardProps {
  lms: {
    courses: Course[];
    progress: Progress;
    changeView: (view: string) => void;
  };
}

export default function Dashboard({ lms }: DashboardProps) {
  // Calculate statistics
  let coursesCompleted = 0;
  let lessonsCompleted = 0;
  let totalLessons = 0;
  let totalStudyTime = 0; // Mock study time in minutes

  lms.courses.forEach(course => {
    totalLessons += course.lessons.filter(l => l.type !== 'quiz').length;
    const courseProgress = lms.progress[course.id];
    if (courseProgress) {
      lessonsCompleted += courseProgress.completedLessons.filter(id => !id.includes('quiz')).length;
      totalStudyTime += lessonsCompleted * 15; // Assume 15 minutes per lesson
      const quizLesson = course.lessons.find(l => l.type === 'quiz');
      if (quizLesson && courseProgress.completedLessons.includes(quizLesson.id)) {
        coursesCompleted++;
      }
    }
  });

  const totalProgress = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  // Find last accessed course and lesson
  const lastCourseId = typeof window !== 'undefined' ? localStorage.getItem('lms_last_course_id') : null;
  const lastLessonId = lastCourseId ? lms.progress[lastCourseId]?.lastLesson : null;
  
  let lastCourse: Course | undefined = undefined;
  let lastLesson: Lesson | undefined = undefined;
  
  if (lastCourseId && lastLessonId) {
    lastCourse = lms.courses.find(c => c.id === lastCourseId);
    if (lastCourse) {
      lastLesson = lastCourse.lessons.find(l => l.id === lastLessonId);
    }
  }

  // Calculate study time in hours and minutes
  const studyHours = Math.floor(totalStudyTime / 60);
  const studyMinutes = totalStudyTime % 60;
  const studyTimeText = studyHours > 0 ? `${studyHours}h ${studyMinutes}min` : `${studyMinutes}min`;

  const quickAccessItems = [
    {
      id: 'courses',
      label: 'Catálogo de Cursos',
      icon: BookOpen,
      action: () => lms.changeView('courses'),
      description: 'Explorar todos os cursos disponíveis'
    },
    {
      id: 'question-bank',
      label: 'Banco de Questões',
      icon: Target,
      action: () => lms.changeView('question-bank'),
      description: 'Testar seu conhecimento'
    },
    {
      id: 'chatbot',
      label: 'Apolo Chatbot',
      icon: TrendingUp,
      action: () => lms.changeView('chatbot'),
      description: 'Tirar dúvidas com o assistente'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Seu Painel de Controle</h2>
      <p className="text-slate-600 mb-8">Bem-vindo de volta! Continue sua jornada de aprendizado.</p>
      
      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-indigo-600">{coursesCompleted}</span>
          </div>
          <p className="text-sm text-slate-500">Cursos Concluídos</p>
          <div className="mt-2 text-xs text-slate-400">
            {coursesCompleted > 0 ? 'Continue assim!' : 'Comece seu primeiro curso'}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-green-600">{totalProgress}%</span>
          </div>
          <p className="text-sm text-slate-500">Progresso Geral</p>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-2xl font-bold text-amber-600">{lessonsCompleted}</span>
          </div>
          <p className="text-sm text-slate-500">Lições Completas</p>
          <div className="mt-2 text-xs text-slate-400">
            de {totalLessons} lições totais
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{studyTimeText}</span>
          </div>
          <p className="text-sm text-slate-500">Tempo de Estudo</p>
          <div className="mt-2 text-xs text-slate-400">
            Tempo total estimado
          </div>
        </div>
      </div>

      {/* Continue Learning and Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning Card */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-6 w-6 text-indigo-600" />
            <h3 className="font-bold text-lg">Continue de onde parou</h3>
          </div>
          <div className="text-center p-6 bg-slate-50 rounded-lg">
            {lastCourse && lastLesson ? (
              <div>
                <div className="mb-4">
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Em andamento
                  </span>
                </div>
                <p className="font-semibold text-lg text-slate-800 mb-2">{lastCourse.title}</p>
                <p className="text-sm text-slate-500 mb-4">Lição: {lastLesson.title}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Progresso do curso</span>
                    <span>{Math.round(lms.progress[lastCourse.id] ? (lms.progress[lastCourse.id].completedLessons.filter(id => !id.includes('quiz')).length / lastCourse.lessons.filter(l => l.type !== 'quiz').length * 100) : 0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${lms.progress[lastCourse.id] ? (lms.progress[lastCourse.id].completedLessons.filter(id => !id.includes('quiz')).length / lastCourse.lessons.filter(l => l.type !== 'quiz').length * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    lms.changeView('course-detail');
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors w-full"
                >
                  Continuar Estudando
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <span className="inline-block bg-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Não iniciado
                  </span>
                </div>
                <p className="text-slate-500 mb-4">Você ainda não começou nenhum curso.</p>
                <button 
                  onClick={() => lms.changeView('courses')}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 transition-colors w-full"
                >
                  Ver Catálogo de Cursos
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Card */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-indigo-600" />
            <h3 className="font-bold text-lg">Acesso Rápido</h3>
          </div>
          <div className="space-y-3">
            {quickAccessItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                    <div>
                      <span className="font-medium text-slate-800">{item.label}</span>
                      <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Dica do Dia</h3>
            <p className="text-indigo-100 text-sm">
              A prática consistente é a chave para o aprendizado eficaz. 
              Dedique pelo menos 15 minutos por dia para estudar e verá resultados surpreendentes!
            </p>
          </div>
          <BookOpen className="h-12 w-12 text-indigo-200" />
        </div>
      </div>
    </div>
  );
}