import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContextObject';
import { fazerLogin, fazerLogout, verificarSessao } from '../services/api';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
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