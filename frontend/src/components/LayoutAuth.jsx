import Logo from './Logo';
import '../styles/formularios.css';
import '../pages/AuthPages.css';

export default function LayoutAuth({ frase, children }) {
  return (
    <div className="pagina-auth">
      <aside className="pagina-auth-painel">
        <Logo />
        <p className="pagina-auth-frase">{frase}</p>
        <small className="pagina-auth-rodape">© {new Date().getFullYear()} PageMind</small>
      </aside>

      <section className="pagina-auth-conteudo">{children}</section>
    </div>
  );
}
