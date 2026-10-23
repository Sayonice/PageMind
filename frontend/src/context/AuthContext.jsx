// src/context/AuthContext.jsx
//
// Guarda o usuário logado de forma global na aplicação.
// O objeto de contexto vem de AuthContextObject.js e o hook de acesso
// (useAuth) fica em useAuth.js — para que este arquivo exporte
// apenas o componente AuthProvider (exigência do Fast Refresh do Vite).

import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContextObject';
import { fazerLogin, fazerLogout, verificarSessao } from '../services/api';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  // Enquanto isso é true, ainda não sabemos se há sessão ativa ou não.
  // Evita, por exemplo, mandar alguém logado de volta pro /login
  // só porque a checagem inicial ainda não terminou.
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    verificarSessao()
      .then((resposta) => setUsuario(resposta.usuario))
      .finally(() => setCarregandoSessao(false));
  }, []);

  async function login({ email, senha }) {
    const resposta = await fazerLogin({ email, senha });
    setUsuario(resposta.usuario);
    return resposta.usuario;
  }

  async function logout() {
    await fazerLogout();
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, carregandoSessao, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}