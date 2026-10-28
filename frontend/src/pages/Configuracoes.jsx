import { useState } from 'react';
import { obterConfiguracoes, salvarConfiguracoes } from '../utils/configuracoes';
import './Configuracoes.css';

const OPCOES_TEMA = [
  { valor: 'claro', rotulo: 'Claro' },
  { valor: 'escuro', rotulo: 'Escuro' },
  { valor: 'sistema', rotulo: 'Sistema' },
];

const OPCOES_FONTE = [
  { valor: 'pequeno', rotulo: 'Pequeno' },
  { valor: 'medio', rotulo: 'Médio' },
  { valor: 'grande', rotulo: 'Grande' },
];

function GrupoOpcoes({ opcoes, atual, aoEscolher }) {
  return (
    <div className="chips">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          className={atual === opcao.valor ? 'chip chip-ativo' : 'chip'}
          onClick={() => aoEscolher(opcao.valor)}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}

export default function Configuracoes() {
  const [config, setConfig] = useState(obterConfiguracoes);
  const [salvo, setSalvo] = useState(false);

  function atualizar(mudanca) {
    const novaConfig = { ...config, ...mudanca };
    setConfig(novaConfig);
    salvarConfiguracoes(novaConfig);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  return (
    <div className="pagina-configuracoes">
      <span className="rotulo-secao">Preferências</span>
      <h1>Configurações</h1>
      <p className="subtitulo-configuracoes">
        Essas preferências ficam salvas só neste navegador.
      </p>

      <section className="painel secao-config">
        <h2>Tema</h2>
        <GrupoOpcoes
          opcoes={OPCOES_TEMA}
          atual={config.tema}
          aoEscolher={(valor) => atualizar({ tema: valor })}
        />
      </section>

      <section className="painel secao-config">
        <h2>Tipografia</h2>
        <GrupoOpcoes
          opcoes={OPCOES_FONTE}
          atual={config.tamanhoFonte}
          aoEscolher={(valor) => atualizar({ tamanhoFonte: valor })}
        />
      </section>

      <section className="painel secao-config">
        <h2>Layout</h2>

        <label className="linha-toggle">
          <span>
            <strong>Visualização compacta</strong>
            <small>Reduz espaçamentos para caber mais conteúdo na tela.</small>
          </span>
          <input
            type="checkbox"
            checked={config.visualizacaoCompacta}
            onChange={(e) => atualizar({ visualizacaoCompacta: e.target.checked })}
          />
        </label>

        <label className="linha-toggle">
          <span>
            <strong>Animações</strong>
            <small>Transições suaves entre estados da interface.</small>
          </span>
          <input
            type="checkbox"
            checked={config.animacoes}
            onChange={(e) => atualizar({ animacoes: e.target.checked })}
          />
        </label>
      </section>

      {salvo && <p className="mensagem-sucesso">Preferências salvas.</p>}
    </div>
  );
}
