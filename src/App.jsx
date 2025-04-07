import React, { useEffect, useRef, useState } from "react";
import { valuesWithDescriptions } from "./data/valuesList";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import './App.css';
import { useVisibilityObserver } from "./hooks/useVisibilityObserver";


const CATEGORIES = [
  "Não é importante para mim",
  "É um pouco importante para mim",
  "É importante para mim",
  "É muito importante para mim",
  "É o mais importante para mim",
];

function HomePage({ setName }) {
  const navigate = useNavigate();
  const [inputName, setInputName] = useState("");

  const handleNext = () => {
    if (!inputName.trim()) {
      alert("Por favor, digite seu nome.");
      return;
    }
    setName(inputName);
    navigate("/intro");
  };

  return (
    <div className="p-8 text-center min-h-screen flex flex-col justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Classificação de Valores Pessoais
      </h1>
      <input
        type="text"
        placeholder="Digite seu nome"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
        className="border border-gray-300 p-3 rounded-lg w-72 mx-auto shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
      />
      <button
        onClick={handleNext}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg shadow-md transition-all"
      >
        Próximos
      </button>
    </div>
  );
}

function IntroPage() {
  const navigate = useNavigate();
  return (
    <div className="p-8 max-w-3xl mx-auto text-center min-h-screen flex flex-col justify-center">
      <p className="text-lg mb-6">
        A Classificação de Valores Pessoais é destinada a te ajudar a esclarecer seus valores centrais e refletir sobre eles em sua vida diária. Classifique os valores em 5 categorias, com base na importância de cada um:
      </p>
      <ul className="text-left list-disc list-inside mb-6">
        {CATEGORIES.map((cat) => <li key={cat}>{cat}</li>)}
      </ul>
      <button
        className="bg-green-600 text-white px-6 py-2 rounded"
        onClick={() => navigate("/classificacao")}
      >
        Começar
      </button>
    </div>
  );
}

function ClassificacaoPage({ categorized, setCategorized }) {
  const navigate = useNavigate();
  const [progressRef, showProgress] = useVisibilityObserver({ threshold: 0.3 });

  const handleChange = (value, category) => {
    const updated = { ...categorized };
    for (const cat of CATEGORIES) {
      updated[cat] = updated[cat].filter((v) => v !== value);
    }
    updated[category].push(value);
    setCategorized(updated);
  };

  const totalClassificados = Object.values(categorized).reduce(
    (acc, list) => acc + list.length,
    0
  );
  const tudoPreenchido = totalClassificados === valuesWithDescriptions.length;
  const progresso = (totalClassificados / valuesWithDescriptions.length) * 100;

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      {/* Barra de Progresso */}
      <div className="mb-6" ref={progressRef}>
        {showProgress && (
          <div className="mb-6">
            <p className="text-center mb-2 font-semibold text-blue-700">
              {totalClassificados} / {valuesWithDescriptions.length} valores classificados
            </p>
            <div className="w-full h-5 bg-gray-300 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
  
      {/* Grid de valores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {valuesWithDescriptions.map(({ value, description }) => (
          <div
            key={value}
            className="bg-white border-2 border-blue-300 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="text-xl font-semibold text-blue-800 mb-2">{value}</div>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            <select
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={CATEGORIES.find((cat) => categorized[cat].includes(value)) || ""}
              onChange={(e) => handleChange(value, e.target.value)}
            >
              <option value="">Selecione uma categoria</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
  
      {/* Botão Finalizar */}
      <div className="mt-10 text-center">
        <button
          className={`px-6 py-3 rounded-lg text-lg font-medium shadow-md transition-all ${
            tudoPreenchido
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          onClick={() => {
            if (tudoPreenchido) {
              navigate("/priorizacao");
            } else {
              alert("Você precisa classificar todos os 100 valores antes de continuar.");
            }
          }}
          disabled={!tudoPreenchido}
        >
          Finalizar
        </button>
      </div>
    </div>
  );  
}

function PriorizacaoPage({ categorized, name }) {
  const navigate = useNavigate();
  const importantes = [
    ...categorized["É o mais importante para mim"],
    ...categorized["É muito importante para mim"],
  ];
  const [selected, setSelected] = useState([]);

  const toggleSelect = (val) => {
    if (selected.includes(val)) {
      setSelected(selected.filter((v) => v !== val));
    } else if (selected.length < 10) {
      setSelected([...selected, val]);
    }
  };

  const gerarPDF = () => {
    const content = document.getElementById("resumo-valores");
    html2pdf().from(content).save("valores-pessoais.pdf");
  };

  const gerarTextoWhatsApp = () => {
    let texto = `Meus valores pessoais (${name}):\n\n`;

    // PRIORITÁRIOS PRIMEIRO
    if (selected.length) {
      texto += "*Valores Prioritários*\n";
      selected.forEach((val, i) => {
        texto += `${i + 1}. ${val}\n`;
      });
      texto += `\n`;
    }

    // DEMAIS CATEGORIAS
    CATEGORIES.forEach((cat) => {
      const valores = categorized[cat];
      if (valores.length > 0) {
        texto += `*${cat}*\n`;
        valores.forEach((val) => {
          const desc = valuesWithDescriptions.find((v) => v.value === val)?.description || "";
          texto += `- ${val}: ${desc}\n`;
        });
        texto += `\n`;
      }
    });

    return `https://wa.me/?text=${encodeURIComponent(texto)}`;
  };

  const maisImportante = categorized["É o mais importante para mim"];
  const muitoImportante = categorized["É muito importante para mim"];

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <h2 className="text-xl font-semibold mb-4">
        Identifique de 5 a 10 valores mais importantes para você. Depois, classifique-os em ordem de prioridade.
      </h2>
      <p className="mb-4">Selecionados: {selected.length} / 10</p>

      {/* Grade em duas colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div>
          <h3 className="text-lg font-bold mb-2">É o mais importante para mim</h3>
          {maisImportante.map((val) => {
            const info = valuesWithDescriptions.find((v) => v.value === val);
            return (
              <div
                key={val}
                className={`p-4 border rounded-lg shadow cursor-pointer mb-3 transition-all ${
                  selected.includes(val)
                    ? "bg-green-100 border-green-600"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleSelect(val)}
              >
                <div className="font-semibold">{val}</div>
                <div className="text-sm text-gray-600">{info?.description}</div>
                {selected.includes(val) && (
                  <div className="mt-1 font-bold text-green-700">#{selected.indexOf(val) + 1}</div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">É muito importante para mim</h3>
          {muitoImportante.map((val) => {
            const info = valuesWithDescriptions.find((v) => v.value === val);
            return (
              <div
                key={val}
                className={`p-4 border rounded-lg shadow cursor-pointer mb-3 transition-all ${
                  selected.includes(val)
                    ? "bg-green-100 border-green-600"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleSelect(val)}
              >
                <div className="font-semibold">{val}</div>
                <div className="text-sm text-gray-600">{info?.description}</div>
                {selected.includes(val) && (
                  <div className="mt-1 font-bold text-green-700">#{selected.indexOf(val) + 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={() => navigate("/classificacao")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
        <button
          onClick={gerarPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Gerar PDF
        </button>
        <a
          href={gerarTextoWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Compartilhar no WhatsApp
        </a>
      </div>

      {/* Resumo para PDF */}
      <div id="resumo-valores" className="hidden p-6 text-black">
        <h2 className="text-2xl font-bold mb-4">Resumo dos Meus Valores Pessoais</h2>
        <p className="mb-4"><strong>Nome:</strong> {name}</p>

        {/* PRIORITÁRIOS PRIMEIRO */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Meus 5-10 Valores Prioritários</h3>
          <ol className="list-decimal list-inside">
            {selected.map((val, i) => {
              const info = valuesWithDescriptions.find((v) => v.value === val);
              return (
                <li key={val} className="mb-1">
                  <strong>{val}</strong>: {info?.description}
                </li>
              );
            })}
          </ol>
        </div>

        {/* CATEGORIAS DEPOIS */}
        {CATEGORIES.map((cat) => {
          const valores = categorized[cat];
          if (valores.length === 0) return null;

          return (
            <div key={cat} className="mb-6">
              <h3 className="text-lg font-semibold mb-2">{cat}</h3>
              <ul className="list-disc list-inside">
                {valores.map((val) => {
                  const info = valuesWithDescriptions.find((v) => v.value === val);
                  return (
                    <li key={val} className="mb-1">
                      <strong>{val}</strong>: {info?.description}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [name, setName] = useState("");
  const [categorized, setCategorized] = useState(Object.fromEntries(CATEGORIES.map((cat) => [cat, []])));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage setName={setName} />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/classificacao" element={<ClassificacaoPage categorized={categorized} setCategorized={setCategorized} />} />
        <Route path="/priorizacao" element={<PriorizacaoPage categorized={categorized} />} />
      </Routes>
    </Router>
  );
}
