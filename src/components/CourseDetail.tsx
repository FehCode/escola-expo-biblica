'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, Award, Download } from 'lucide-react';
import AITutor from '@/components/AITutor';
import PracticeQuestions from '@/components/PracticeQuestions';
import Certificate from '@/components/Certificate';

interface CourseDetailProps {
  lms: {
    courses: any[];
    activeCourseId: string | null;
    activeLessonId: string | null;
    progress: any;
    isLessonCompleted: (courseId: string, lessonId: string) => boolean;
    getCourseProgress: (courseId: string) => number;
    markLessonComplete: (courseId: string, lessonId: string) => void;
    updateLastLesson: (courseId: string, lessonId: string) => void;
    setActiveCourseId: (courseId: string) => void;
    setActiveLessonId: (lessonId: string) => void;
    changeView: (view: string) => void;
  };
}

export default function CourseDetail({ lms }: CourseDetailProps) {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: string}>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const course = lms.courses.find(c => c.id === lms.activeCourseId);
  const currentLesson = course?.lessons.find(l => l.id === lms.activeLessonId);

  useEffect(() => {
    if (course && !lms.activeLessonId) {
      // Set first lesson as active if none is selected
      const firstLesson = course.lessons[0];
      lms.setActiveLessonId(firstLesson.id);
      lms.updateLastLesson(course.id, firstLesson.id);
    }
  }, [course, lms.activeLessonId]);

  useEffect(() => {
    // Check if course is completed and show certificate
    if (course) {
      const quizLesson = course.lessons.find(l => l.type === 'quiz');
      if (quizLesson && lms.isLessonCompleted(course.id, quizLesson.id)) {
        setShowCertificate(true);
      }
    }
  }, [course, lms.progress]);

  const handleGenerateCertificate = () => {
    setShowCertificateModal(true);
  };

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-slate-500">Curso não encontrado.</p>
        <button 
          onClick={() => lms.changeView('courses')}
          className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700"
        >
          Voltar para os cursos
        </button>
      </div>
    );
  }

  const areAllLessonsCompleted = course.lessons
    .filter(l => l.type !== 'quiz')
    .every(l => lms.isLessonCompleted(course.id, l.id));

  const handleLessonSelect = (lessonId: string) => {
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (lesson.type === 'quiz' && !areAllLessonsCompleted) {
      alert('Você precisa completar todas as lições antes de fazer o questionário.');
      return;
    }

    lms.setActiveLessonId(lessonId);
    lms.updateLastLesson(course.id, lessonId);
  };

  const handleMarkComplete = () => {
    if (!lms.activeLessonId) return;
    
    if (currentLesson?.type === 'quiz') {
      setShowQuizModal(true);
    } else {
      lms.markLessonComplete(course.id, lms.activeLessonId);
      navigateToLesson('next');
    }
  };

  const navigateToLesson = (direction: 'prev' | 'next') => {
    if (!lms.activeLessonId) return;
    
    const currentIndex = course.lessons.findIndex(l => l.id === lms.activeLessonId);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < course.lessons.length) {
      const newLesson = course.lessons[newIndex];
      lms.setActiveLessonId(newLesson.id);
      lms.updateLastLesson(course.id, newLesson.id);
    }
  };

  const handleQuizAnswer = (questionIndex: number, answer: string) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const submitQuiz = () => {
    if (!currentLesson?.questions) return;
    
    let correctAnswers = 0;
    currentLesson.questions.forEach((q: any, index: number) => {
      if (quizAnswers[index] === q.answer) {
        correctAnswers++;
      }
    });
    
    const score = correctAnswers / currentLesson.questions.length;
    setQuizScore(score);
    setQuizSubmitted(true);
    
    if (score >= 0.7) {
      lms.markLessonComplete(course.id, lms.activeLessonId!);
      setShowCertificate(true);
    }
  };

  const closeQuizModal = () => {
    setShowQuizModal(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const currentIndex = course.lessons.findIndex(l => l.id === lms.activeLessonId);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < course.lessons.length - 1;
  const isCurrentLessonCompleted = lms.activeLessonId ? lms.isLessonCompleted(course.id, lms.activeLessonId) : false;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="md:flex min-h-[70vh]">
          {/* Sidebar */}
          <aside className="w-full md:w-1/3 lg:w-1/4 bg-slate-50 border-r border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold">{course.title}</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-slate-600 mb-1">
                  <span>Progresso</span>
                  <span>{Math.round(lms.getCourseProgress(course.id))}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${lms.getCourseProgress(course.id)}%` }}
                  />
                </div>
              </div>
            </div>
            <nav className="p-2 space-y-1">
              {course.lessons.map((lesson) => {
                const isCompleted = lms.isLessonCompleted(course.id, lesson.id);
                const isActive = lesson.id === lms.activeLessonId;
                const isQuiz = lesson.type === 'quiz';
                const isLocked = isQuiz && !areAllLessonsCompleted;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson.id)}
                    disabled={isLocked}
                    className={`w-full flex items-center text-left p-3 rounded-md font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                        : isCompleted
                        ? 'text-slate-600 hover:bg-slate-100'
                        : 'text-slate-600 hover:bg-slate-100'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="flex-grow text-left">{lesson.title}</span>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="w-full md:w-2/3 lg:w-3/4 p-6 sm:p-8 flex flex-col">
            {currentLesson && (
              <>
                <div className="flex-grow">
                  <h2 className="text-3xl font-bold mb-4 text-slate-900">
                    {currentLesson.title}
                  </h2>
                  
                  {currentLesson.type === 'quiz' ? (
                    <div className="text-center py-8">
                      <p className="text-slate-600 mb-4">
                        Esta é a avaliação final do curso. Responda todas as perguntas para concluir.
                      </p>
                      <p className="text-sm text-slate-500">
                        Você precisa acertar 70% das questões para ser aprovado.
                      </p>
                    </div>
                  ) : (
                    <div 
                      className="prose-custom max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentLesson.content || '' }}
                    />
                  )}

                  {/* AI Tutor Section */}
                  {currentLesson.type !== 'quiz' && (
                    <AITutor 
                      lessonId={currentLesson.id} 
                      lessonTitle={currentLesson.title} 
                    />
                  )}

                  {/* Practice Questions Section */}
                  {currentLesson.type !== 'quiz' && currentLesson.practiceQuestions && (
                    <PracticeQuestions 
                      lessonId={currentLesson.id}
                      questions={currentLesson.practiceQuestions}
                    />
                  )}
                </div>

                {/* Certificate Section */}
                {showCertificate && (
                  <div className="mt-8 p-6 bg-green-50 border-2 border-dashed border-green-300 rounded-lg text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Award className="h-8 w-8 text-green-600" />
                      <h3 className="text-xl font-bold text-green-800">Parabéns! Curso Concluído</h3>
                    </div>
                    <p className="text-green-700 mb-4">
                      Você concluiu todas as lições e foi aprovado na avaliação final.
                    </p>
                    <button
                      onClick={handleGenerateCertificate}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Certificado
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div className="mt-8 pt-6 border-t flex justify-between items-center flex-wrap gap-2">
                  <button
                    onClick={() => navigateToLesson('prev')}
                    disabled={!canGoPrev}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </button>

                  <button
                    onClick={handleMarkComplete}
                    disabled={isCurrentLessonCompleted}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-slate-400"
                  >
                    {currentLesson?.type === 'quiz' 
                      ? (isCurrentLessonCompleted ? 'Questionário Concluído' : 'Fazer Questionário')
                      : (isCurrentLessonCompleted ? 'Concluída' : 'Marcar como Concluída')
                    }
                  </button>

                  <button
                    onClick={() => navigateToLesson('next')}
                    disabled={!canGoNext}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próxima
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && course && (
        <Certificate
          courseName={course.title}
          studentName=""
          completionDate={new Date().toLocaleDateString('pt-BR')}
          instructor="Escola de Exposição Bíblica"
          isVisible={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Quiz Modal */}
      {showQuizModal && currentLesson?.questions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{currentLesson.title}</h3>
              
              {!quizSubmitted ? (
                <div className="space-y-6">
                  {currentLesson.questions.map((q: any, index: number) => (
                    <div key={index}>
                      <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                      <div className="space-y-2">
                        {q.options.map((option: string, optIndex: number) => (
                          <label key={optIndex} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-slate-50">
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={quizAnswers[index] === option}
                              onChange={() => handleQuizAnswer(index, option)}
                              className="mr-3"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={closeQuizModal}
                      className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length !== currentLesson.questions.length}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                      Enviar Respostas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-4 ${quizScore >= 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.round(quizScore * 100)}%
                  </div>
                  <p className="text-lg mb-6">
                    {quizScore >= 0.7 
                      ? 'Parabéns! Você foi aprovado no questionário.'
                      : 'Você não atingiu a pontuação mínima. Estude mais e tente novamente.'
                    }
                  </p>
                  <button
                    onClick={closeQuizModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Fechar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}