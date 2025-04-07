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

  const handleStart = () => {
    if (!inputName.trim()) {
      alert("Por favor, digite seu nome.");
      return;
    }
    setName(inputName);
    navigate("/intro");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#d9e0d0] to-[#f4f1ed] p-6">
      <h1 className="text-4xl font-heading text-[#2d4739] text-center mb-6">
        Bem-vindo(a) ao Teste de Valores Pessoais
      </h1>
      <p className="text-lg font-body text-[#2d4739] text-center max-w-xl mb-6">
        Este teste tem como objetivo ajudá-lo(a) a identificar e refletir sobre os valores que são mais importantes na sua vida. Vamos começar?
      </p>
      <input
        type="text"
        placeholder="Digite seu nome"
        value={inputName}
        onChange={(e) => setInputName(e.target.value)}
        className="border border-gray-400 p-3 rounded-lg w-72 mx-auto shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4a7856] transition mb-6"
      />
      <button
        onClick={handleStart}
        className="bg-[#4a7856] hover:bg-[#3a6146] text-white font-body px-6 py-3 rounded-lg text-lg shadow transition-all"
      >
        Iniciar
      </button>
    </div>
  );
}

function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#d9e0d0] to-[#f4f1ed] p-6">
      <h1 className="text-4xl font-heading text-[#2d4739] text-center mb-6">
        Entenda como funciona
      </h1>

      <p className="text-lg font-body text-[#2d4739] text-center max-w-2xl mb-6">
        A Classificação de Valores Pessoais é destinada a te ajudar a esclarecer seus valores centrais e refletir sobre eles em sua vida diária. Você irá classificar os valores em 5 categorias com base na importância de cada um:
      </p>

      <ul className="text-left font-body text-[#2d4739] list-disc list-inside bg-white p-4 rounded-xl shadow-md max-w-xl mb-8">
        {CATEGORIES.map((cat) => (
          <li key={cat} className="mb-1">{cat}</li>
        ))}
      </ul>

      <button
        className="bg-[#4a7856] hover:bg-[#3a6146] text-white font-body px-6 py-3 rounded-lg text-lg shadow transition-all"
        onClick={() => navigate("/classificacao")}
      >
        Começar
      </button>
    </div>
  );
}

function ClassificacaoPage({ categorized, setCategorized }) {
  const navigate = useNavigate();

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
  const progresso = (totalClassificados / valuesWithDescriptions.length) * 100;
  const tudoPreenchido = totalClassificados === valuesWithDescriptions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d9e0d0] to-[#f4f1ed] pb-12">
      {/* Barra de progresso fixa no topo */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md px-4 py-2">
        <div className="max-w-6xl mx-auto">
          <p className="text-center mb-1 font-body text-sm text-[#2d4739]">
            {totalClassificados} / {valuesWithDescriptions.length} valores classificados
          </p>
          <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#4a7856] to-[#6ab97d] transition-all duration-500"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="pt-20 px-6 max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-heading text-[#2d4739]">
            Classifique os valores de acordo com sua importância
          </h2>
          <p className="text-sm mt-3 text-gray-600 font-body">
            Todos os 100 valores devem ser preenchidos antes de avançar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {valuesWithDescriptions.map(({ value, description }) => (
            <div
              key={value}
              className="bg-white border border-[#a4c5b4] rounded-2xl p-5 shadow-md hover:shadow-xl transition-all"
            >
              <div className="text-xl font-semibold text-[#2d4739] mb-2">{value}</div>
              <p className="text-sm font-body text-gray-600 mb-3">{description}</p>
              <select
                className="w-full p-3 border border-gray-400 rounded-xl font-body focus:ring-2 focus:ring-[#4a7856]"
                value={CATEGORIES.find((cat) => categorized[cat].includes(value)) || ""}
                onChange={(e) => handleChange(value, e.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Botão Finalizar */}
        <div className="mt-12 text-center">
          {!tudoPreenchido && (
            <p className="text-red-600 mb-4 font-medium">
              Classifique todos os 100 valores antes de continuar.
            </p>
          )}
          <button
            className={`px-6 py-3 rounded-lg text-lg font-medium shadow-md transition-all ${
              tudoPreenchido
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-green-300 text-white cursor-not-allowed"
            }`}
            onClick={() => {
              if (tudoPreenchido) {
                navigate("/priorizacao");
              }
            }}
            disabled={!tudoPreenchido}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

function PriorizacaoPage({ categorized, name }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  const importantes = [
    ...categorized["É o mais importante para mim"],
    ...categorized["É muito importante para mim"],
  ];

  const toggleSelect = (val) => {
    if (selected.includes(val)) {
      setSelected(selected.filter((v) => v !== val));
    } else if (selected.length < 10) {
      setSelected([...selected, val]);
    }
  };

  const gerarPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = document.getElementById("resumo-valores").innerHTML;
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Valores Pessoais</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #2d4739; }
            h2, h3 { color: #4a7856; }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const gerarTextoWhatsApp = () => {
    let texto = `Meus valores pessoais (${name}):\n\n`;

    if (selected.length) {
      texto += "*Valores Prioritários*\n";
      selected.forEach((val, i) => {
        texto += `${i + 1}. ${val}\n`;
      });
      texto += `\n`;
    }

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

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-[#d9e0d0] to-[#f4f1ed] p-6">
      <h2 className="text-3xl font-heading text-[#2d4739] mb-2 text-center">
        Selecione de 5 a 10 valores mais importantes para você
      </h2>
      <p className="text-md font-body text-[#2d4739] mb-6 text-center">
        Clique para selecionar até 10 dos valores que mais representam você entre os classificados como mais e muito importantes.
      </p>
      <p className="mb-8 text-center font-body text-[#2d4739]">Selecionados: {selected.length} / 10</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        {[{ label: "É o mais importante para mim", values: categorized["É o mais importante para mim"] },
          { label: "É muito importante para mim", values: categorized["É muito importante para mim"] }].map(({ label, values }) => (
          <div key={label}>
            <h3 className="text-lg font-semibold text-[#4a7856] mb-3">{label}</h3>
            {values.map((val) => {
              const info = valuesWithDescriptions.find((v) => v.value === val);
              return (
                <div
                  key={val}
                  className={`p-4 border rounded-xl shadow cursor-pointer mb-3 transition-all font-body text-[#2d4739] bg-white hover:bg-[#f4f1ed] ${
                    selected.includes(val) ? "border-[#4a7856] bg-[#e6efe4]" : ""
                  }`}
                  onClick={() => toggleSelect(val)}
                >
                  <div className="font-semibold text-[#2d4739]">{val}</div>
                  <div className="text-sm">{info?.description}</div>
                  {selected.includes(val) && (
                    <div className="mt-1 font-bold text-[#4a7856]">#{selected.indexOf(val) + 1}</div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selected.length < 5 && (
  <p className="text-red-600 text-center mb-4 font-medium">
    Selecione pelo menos 5 valores prioritários para continuar.
  </p>
)}

<div className="flex flex-wrap gap-4 justify-center mt-6">
  <button
    onClick={() => navigate("/classificacao")}
    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
  >
    Voltar
  </button>

  <button
    onClick={gerarPDF}
    disabled={selected.length < 5}
    className={`px-4 py-2 rounded-xl text-white transition-all ${
      selected.length < 5
        ? "bg-blue-300 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
  >
    Gerar PDF
  </button>

  <a
    href={selected.length >= 5 ? gerarTextoWhatsApp() : "#"}
    target="_blank"
    rel="noopener noreferrer"
    className={`px-4 py-2 rounded-xl text-white transition-all ${
      selected.length < 5
        ? "bg-green-300 pointer-events-none cursor-not-allowed"
        : "bg-green-500 hover:bg-green-600"
    }`}
  >
    Compartilhar no WhatsApp
  </a>
</div>

      <div id="resumo-valores" className="hidden p-6 text-[#2d4739]">
        <h2 className="text-2xl font-bold mb-4">Resumo dos Meus Valores Pessoais</h2>
        <p className="mb-4"><strong>Nome:</strong> {name}</p>

        {selected.length > 0 && (
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
        )}

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
        <Route path="/priorizacao" element={<PriorizacaoPage categorized={categorized} name={name} />} />
      </Routes>
    </Router>
  );
}
