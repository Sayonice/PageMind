// src/App.jsx

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaProtegida from './components/RotaProtegida';
import { aplicarConfiguracoes } from './utils/configuracoes';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Feed from './pages/Feed';
import NovaResenha from './pages/NovaResenha';
import Biblioteca from './pages/Biblioteca';
import Estatisticas from './pages/Estatisticas';
import Perfil from './pages/Perfil';
import Configuracoes from './pages/Configuracoes';
import LivroDetalhe from './pages/LivroDetalhe';
import PainelProfessor from './pages/PainelProfessor';


export default function App() {
  // Aplica tema/tipografia/layout salvos (ver Configurações) assim que o
  // app carrega, pra pessoa não ver o tema padrão piscar antes do dela.
  useEffect(() => {
    aplicarConfiguracoes();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route
            path="/feed"
            element={
              <RotaProtegida>
                <Feed />
              </RotaProtegida>
            }
          />
          <Route
            path="/nova-resenha"
            element={
              <RotaProtegida>
                <NovaResenha />
              </RotaProtegida>
            }
          />
          <Route
            path="/biblioteca"
            element={
              <RotaProtegida>
                <Biblioteca />
              </RotaProtegida>
            }
          />
          <Route
            path="/estatisticas"
            element={
              <RotaProtegida>
                <Estatisticas />
              </RotaProtegida>
            }
          />
          <Route
            path="/perfil"
            element={
              <RotaProtegida>
                <Perfil />
              </RotaProtegida>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <RotaProtegida>
                <Configuracoes />
              </RotaProtegida>
            }
          />
          <Route
            path="/livro/:id"
            element={
              <RotaProtegida>
                <LivroDetalhe />
              </RotaProtegida>
            }
          />
          <Route
            path="/painel-professor"
            element={
              <RotaProtegida>
                <PainelProfessor />
              </RotaProtegida>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}