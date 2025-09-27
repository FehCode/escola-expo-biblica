'use client';

import { BookOpen } from 'lucide-react';
import BibleExplainer from './BibleExplainer';
import StudyGenerator from './StudyGenerator';

interface CoursesProps {
  lms: {
    courses: any[];
    getCourseProgress: (courseId: string) => number;
    setActiveCourseId: (courseId: string) => void;
    setActiveLessonId: (lessonId: string) => void;
    changeView: (view: string) => void;
  };
}

export default function Courses({ lms }: CoursesProps) {
  const handleCourseClick = (courseId: string) => {
    lms.setActiveCourseId(courseId);
    lms.changeView('course-detail');
  };

  return (
    <div className="max-w-7xl mx-auto fade-in">
      <h2 className="text-3xl font-bold text-slate-800 mb-8">Catálogo de Cursos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {lms.courses.map((course) => {
          const progress = lms.getCourseProgress(course.id);
          
          return (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="p-6 flex-grow">
                <div className="mb-3">
                  <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {course.lessons.length} Módulos
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {course.description}
                </p>
              </div>
              <div className="p-6 bg-slate-50 border-t">
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right text-sm font-medium text-slate-600">
                  {Math.round(progress)}% Completo
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <BibleExplainer />
      <StudyGenerator />
    </div>
  );
}