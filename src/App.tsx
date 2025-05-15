import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { PrivateRoute } from './components/PrivateRoute';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import Dashboard from './pages/Dashboard';
import CadastroToners from './pages/CadastroToners';
import CadastroUnidades from './pages/CadastroUnidades';
import CadastroFormulariosAuditoria from './pages/CadastroFormulariosAuditoria';
import RegistroRetornados from './pages/RegistroRetornados';
import ConsultaToners from './pages/ConsultaToners';
import ConsultaUnidades from './pages/ConsultaUnidades';
import ConsultaRetornados from './pages/ConsultaRetornados';
import RegistroMovimentacoes from './pages/RegistroMovimentacoes';
import ConsultaMovimentacoes from './pages/ConsultaMovimentacoes';
import RegistroGarantias from './pages/RegistroGarantias';
import ConsultaGarantias from './pages/ConsultaGarantias';
import TCO from './pages/TCO';
import ConsultaTCO from './pages/ConsultaTCO';
import RegistroNC from './pages/RegistroNC';
import ConsultaNC from './pages/ConsultaNC';
import RegistroAuditoria from './pages/RegistroAuditoria';
import ConsultaAuditorias from './pages/ConsultaAuditorias';
import CadastroITs from './pages/CadastroITs';
import RegistroITs from './pages/RegistroITs';
import ConsultaITs from './pages/ConsultaITs';
import Graficos from './pages/Graficos';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* All routes are now protected with simplified PrivateRoute */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* Cadastros */}
              <Route path="cadastro-toners" element={<CadastroToners />} />
              <Route path="cadastro-unidades" element={<CadastroUnidades />} />
              <Route path="cadastro-formularios-auditoria" element={<CadastroFormulariosAuditoria />} />
              <Route path="cadastro-its" element={<CadastroITs />} />
              
              {/* Registros */}
              <Route path="registro-retornados" element={<RegistroRetornados />} />
              <Route path="registro-movimentacoes" element={<RegistroMovimentacoes />} />
              <Route path="registro-garantias" element={<RegistroGarantias />} />
              <Route path="tco" element={<TCO />} />
              <Route path="registro-nc" element={<RegistroNC />} />
              <Route path="registro-auditoria" element={<RegistroAuditoria />} />
              <Route path="registro-its" element={<RegistroITs />} />
              
              {/* Consultas */}
              <Route path="consulta-toners" element={<ConsultaToners />} />
              <Route path="consulta-unidades" element={<ConsultaUnidades />} />
              <Route path="consulta-retornados" element={<ConsultaRetornados />} />
              <Route path="consulta-movimentacoes" element={<ConsultaMovimentacoes />} />
              <Route path="consulta-garantias" element={<ConsultaGarantias />} />
              <Route path="consulta-tco" element={<ConsultaTCO />} />
              <Route path="consulta-nc" element={<ConsultaNC />} />
              <Route path="consulta-auditorias" element={<ConsultaAuditorias />} />
              <Route path="consulta-its" element={<ConsultaITs />} />
              
              {/* Gráficos */}
              <Route path="graficos" element={<Graficos />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;