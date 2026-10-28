import logoBranca from '../assets/logo-branca.png';
import logoColorida from '../assets/logo-colorida.png';
import './Logo.css';

export default function Logo() {
  return (
    <span className="logo-pagemind">
      <img src={logoBranca} alt="PageMind" className="logo-img logo-img-branca" />
      <img src={logoColorida} alt="PageMind" className="logo-img logo-img-colorida" />
    </span>
  );
}
