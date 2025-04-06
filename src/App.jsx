import { useState } from 'react';

const valores = [
  "Abertura", "Aceitação", "Amado", "Amizade", "Amoroso", "Aptidão Física",
  "Arte", "Atenção Plena", "Atração", "Autenticidade", "Autoaceitação", "Autoconhecimento",
  // ... (adicione todos aqui, posso colar tudo se quiser)
];

function App() {
  const [selecionados, setSelecionados] = useState([]);

  const toggleValor = (valor) => {
    setSelecionados((prev) =>
      prev.includes(valor) ? prev.filter((v) => v !== valor) : [...prev, valor]
    );
  };

  return (
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">Meus Valores Pessoais</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {valores.map((valor) => (
          <button
            key={valor}
            onClick={() => toggleValor(valor)}
            className={`border rounded-xl px-3 py-2 text-sm transition ${
              selecionados.includes(valor)
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {valor}
          </button>
        ))}
      </div>

      {selecionados.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Selecionados:</h2>
          <ul className="list-disc pl-5">
            {selecionados.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
