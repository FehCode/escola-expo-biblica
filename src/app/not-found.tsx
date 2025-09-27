export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Página Não Encontrada</h1>
        <p className="text-slate-600 mb-8">Desculpe, a página que você está procurando não existe.</p>
        <a 
          href="/" 
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Voltar para o Início
        </a>
      </div>
    </div>
  );
}