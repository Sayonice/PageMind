import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { buscarResenhas } from '../services/api';
import { corAvatar, iniciais } from '../utils/formatacao';
import Logo from './Logo';
import { IconeBusca, IconeConfig, IconeFechar, IconeMenu } from './Icones';
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

  function alternarMenu() {
    fecharBusca();
    setMenuAberto((atual) => !atual);
  }

  function pesquisar() {
    const termo = termoBusca.trim();
    if (!termo) return;

    setCarregandoBusca(true);
    setErroBusca('');
    buscarResenhas(termo)
      .then((resultado) => {
        setResultadosBusca(resultado);
        setBuscouAlgumaVez(true);
      })
      .catch((erroCapturado) => setErroBusca(erroCapturado.message))
      .finally(() => setCarregandoBusca(false));
  }

  function handleCliqueLupa() {
    if (buscaAberta) {
      pesquisar();
      return;
    }
    setMenuAberto(false);
    setBuscaAberta(true);
  }

  function handleSubmitBusca(evento) {
    evento.preventDefault();
    pesquisar();
  }

  const nome = usuario?.nome || '';
  const mostrarPainel = buscaAberta && (carregandoBusca || erroBusca || buscouAlgumaVez);

  return (
    <header className="navbar">
      <Link to="/feed" className="navbar-logo">
        <Logo />
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
              placeholder="Nome do livro ou da pessoa"
              tabIndex={buscaAberta ? 0 : -1}
            />
            <button
              type="button"
              className="navbar-botao"
              onClick={handleCliqueLupa}
              title="Buscar resenhas"
              aria-label="Buscar resenhas"
            >
              <IconeBusca />
            </button>
            {buscaAberta && (
              <button
                type="button"
                className="navbar-botao navbar-botao-pequeno"
                onClick={fecharBusca}
                aria-label="Fechar busca"
              >
                <IconeFechar tamanho={16} />
              </button>
            )}
          </form>

          {mostrarPainel && (
            <div className="navbar-busca-painel">
              {carregandoBusca && <p className="navbar-busca-status">Buscando...</p>}
              {erroBusca && <p className="navbar-busca-status navbar-busca-erro">{erroBusca}</p>}
              {!carregandoBusca && !erroBusca && resultadosBusca.length === 0 && (
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

        <Link to="/configuracoes" className="navbar-botao" title="Configurações" aria-label="Configurações">
          <IconeConfig />
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
            className="navbar-botao"
            onClick={alternarMenu}
            aria-label="Abrir menu"
            aria-expanded={menuAberto}
          >
            <IconeMenu tamanho={22} />
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
