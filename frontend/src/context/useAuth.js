// src/context/useAuth.js
//
// Hook de atalho: dentro de qualquer tela, basta usar
// const { usuario, login, logout } = useAuth();

import { useContext } from 'react';
import { AuthContext } from './AuthContextObject';

export function useAuth() {
  return useContext(AuthContext);
}