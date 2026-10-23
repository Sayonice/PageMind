// src/components/RotaProtegida.jsx
//
// Envolve qualquer página que exija login. Se ainda estamos checando
// a sessão (primeiro carregamento), mostra um aviso simples; se não
// houver usuário, redireciona para /login. Já renderiza a Navbar
// junto, para não repetir isso em cada página protegida.

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
