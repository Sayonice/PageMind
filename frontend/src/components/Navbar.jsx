// src/components/Navbar.jsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { buscarResenhas } from '../services/api';
import { corAvatar, iniciais } from '../utils/formatacao';
import './Navbar.css';

const LINKS_MENU = [
  { to: '/feed', rotulo: 'Feed' },
  { to: '/biblioteca', rotulo: 'Biblioteca' },
  { to: '/estatisticas', rotulo: 'Estatísticas' },
  { to: '/nova-resenha', rotulo: 'Nova resenha' },
];

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef(null);

  const [buscaAberta, setBuscaAberta] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [carregandoBusca, setCarregandoBusca] = useState(false);
  const [erroBusca, setErroBusca] = useState('');
  const [buscouAlgumaVez, setBuscouAlgumaVez] = useState(false);
  const buscaRef = useRef(null);

  const fecharBusca = useCallback(() => {
    setBuscaAberta(false);
    setTermoBusca('');
    setResultadosBusca([]);
    setErroBusca('');
    setBuscouAlgumaVez(false);
  }, []);

  // Fecha os dois menus suspensos (hamburguer e busca) ao clicar fora deles.
  useEffect(() => {
    function aoClicarFora(evento) {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuAberto(false);
      }
      if (buscaRef.current && !buscaRef.current.contains(evento.target)) {
        fecharBusca();
      }
    }
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, [fecharBusca]);

  async function handleSair() {
    setMenuAberto(false);
    await logout();
    navigate('/login');
  }

  function toggleMenu() {
    fecharBusca();
    setMenuAberto((atual) => !atual);
  }

  function abrirBusca() {
    setMenuAberto(false);
    setBuscaAberta(true);
  }

  function handleCliqueLupa(evento) {
    if (!buscaAberta) {
      evento.preventDefault();
      abrirBusca();
    }
    // Se já está aberta, deixa o clique seguir como envio normal do formulário.
  }

  function handleSubmitBusca(evento) {
    evento.preventDefault();
    const valorLimpo = termoBusca.trim();
    if (!valorLimpo) return;

    setCarregandoBusca(true);
    setErroBusca('');
    buscarResenhas(valorLimpo)
      .then((resultado) => {
        setResultadosBusca(resultado);
        setBuscouAlgumaVez(true);
      })
      .catch((erroCapturado) => setErroBusca(erroCapturado.message))
      .finally(() => setCarregandoBusca(false));
  }

  const nome = usuario?.nome || '';

  return (
    <header className="navbar">
      <Link to="/feed" className="navbar-logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M4 19a2.5 2.5 0 0 1 2.5-2.5H20"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <span>PageMind</span>
      </Link>

      <div className="navbar-acoes">
        <div className="navbar-busca" ref={buscaRef}>
          <form
            className={buscaAberta ? 'navbar-busca-form navbar-busca-form-aberta' : 'navbar-busca-form'}
            onSubmit={handleSubmitBusca}
          >
            <input
              type="text"
              className="navbar-busca-input"
              value={termoBusca}
              onChange={(evento) => setTermoBusca(evento.target.value)}
              placeholder="Nome do livro ou da pessoa..."
              tabIndex={buscaAberta ? 0 : -1}
            />

            <button
              type="submit"
              className="navbar-icone"
              onClick={handleCliqueLupa}
              title="Buscar resenhas"
              aria-label="Buscar resenhas"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            {buscaAberta && (
              <button
                type="button"
                className="navbar-busca-fechar"
                onClick={fecharBusca}
                aria-label="Fechar busca"
              >
                ✕
              </button>
            )}
          </form>

          {buscaAberta && (carregandoBusca || erroBusca || buscouAlgumaVez) && (
            <div className="navbar-busca-painel">
              {carregandoBusca && <p className="navbar-busca-status">Buscando...</p>}
              {erroBusca && <p className="navbar-busca-status navbar-busca-erro">{erroBusca}</p>}
              {!carregandoBusca &&
                !erroBusca &&
                buscouAlgumaVez &&
                resultadosBusca.length === 0 && (
                  <p className="navbar-busca-status">Nenhuma resenha encontrada.</p>
                )}

              {resultadosBusca.length > 0 && (
                <ul className="navbar-busca-resultados">
                  {resultadosBusca.map((resenha) => (
                    <li key={resenha.id_resenha}>
                      <Link to={`/livro/${resenha.id_livro}`} onClick={fecharBusca}>
                        <img src={resenha.imagem_capa} alt="" />
                        <span className="navbar-busca-info">
                          <strong>{resenha.titulo_livro}</strong>
                          <small>resenha de {resenha.nome_usuario}</small>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <Link
          to="/configuracoes"
          className="navbar-icone"
          title="Configurações"
          aria-label="Configurações"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M19.4 13.5c.04-.33.06-.66.06-1s-.02-.67-.06-1l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.4 7.4 0 0 0-1.73-1l-.36-2.54A.5.5 0 0 0 14 2h-3.84a.5.5 0 0 0-.5.44l-.36 2.54c-.63.24-1.21.58-1.73 1l-2.39-.96a.5.5 0 0 0-.6.22L2.66 8.56a.5.5 0 0 0 .12.64L4.8 10.78c-.04.33-.06.66-.06 1s.02.67.06 1l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.4.3.6.22l2.39-.96c.52.42 1.1.76 1.73 1l.36 2.54c.04.25.25.44.5.44H14c.25 0 .46-.19.5-.44l.36-2.54c.63-.24 1.21-.58 1.73-1l2.39.96c.2.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64L19.4 13.5Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <Link
          to="/perfil"
          className="navbar-avatar"
          style={{ backgroundColor: corAvatar(nome) }}
          title={nome}
        >
          {iniciais(nome)}
        </Link>

        <div className="navbar-menu" ref={menuRef}>
          <button
            type="button"
            className="navbar-hamburguer"
            onClick={toggleMenu}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {menuAberto && (
            <div className="navbar-dropdown">
              {LINKS_MENU.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMenuAberto(false)}>
                  {link.rotulo}
                </Link>
              ))}
              {usuario?.tipo === 'professor' && (
                <Link to="/painel-professor" onClick={() => setMenuAberto(false)}>
                  Painel do professor
                </Link>
              )}
              <hr />
              <button type="button" className="navbar-dropdown-sair" onClick={handleSair}>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}