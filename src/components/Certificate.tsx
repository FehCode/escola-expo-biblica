'use client';

import { useState, useEffect } from 'react';
import { Download, Award, Calendar, User } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
  courseName: string;
  studentName: string;
  completionDate: string;
  instructor: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Certificate({ 
  courseName, 
  studentName, 
  completionDate, 
  instructor, 
  isVisible, 
  onClose 
}: CertificateProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const certificateElement = document.getElementById('certificate-content');
      if (!certificateElement) return;

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`certificado-${courseName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Certificado de Conclusão
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div id="certificate-content" className="border-8 border-yellow-500 p-8 bg-gradient-to-br from-yellow-50 to-white">
            {/* Certificate Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Award className="h-16 w-16 text-yellow-500" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Certificado de Conclusão
              </h1>
              <div className="w-32 h-1 bg-yellow-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">
                Escola de Exposição Bíblica
              </p>
            </div>

            {/* Certificate Content */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                Certificamos que
              </p>
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 inline-block mb-4">
                <h2 className="text-3xl font-bold text-gray-800">
                  {studentName}
                </h2>
              </div>
              <p className="text-lg text-gray-700 mb-4">
                concluiu com êxito o curso
              </p>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 inline-block mb-4">
                <h3 className="text-2xl font-bold text-blue-800">
                  {courseName}
                </h3>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Data de Conclusão:</span>
                </div>
                <p className="text-lg text-gray-800">{completionDate}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-semibold text-gray-700">Instrutor:</span>
                </div>
                <p className="text-lg text-gray-800">{instructor}</p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="text-center mb-6">
              <p className="text-base text-gray-600 mb-4">
                Este certificado atesta o comprometimento do aluno com o estudo bíblico
                e a aplicação dos princípios de interpretação das Escrituras.
              </p>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                  <p className="text-sm text-gray-600">Assinatura do Aluno</p>
                </div>
                <div className="text-center">
                  <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                  <p className="text-sm text-gray-600">Assinatura do Instrutor</p>
                </div>
              </div>
            </div>

            {/* Certificate Border Decoration */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-gray-500">
                  Certificado válido como comprovação de conclusão de curso bíblico
                </span>
                <Award className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-5 w-5" />
              {isGenerating ? 'Gerando PDF...' : 'Baixar Certificado'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}