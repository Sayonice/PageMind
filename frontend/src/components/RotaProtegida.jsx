import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Navbar from './Navbar';
import './RotaProtegida.css';

export default function RotaProtegida({ children }) {
  const { usuario, carregandoSessao } = useAuth();

  if (carregandoSessao) {
    return <p>Carregando...</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
