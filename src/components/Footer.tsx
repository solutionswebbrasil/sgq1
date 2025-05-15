import React from 'react';
import useDarkMode from '../hooks/useDarkMode';

function Footer() {
  const { isDarkMode } = useDarkMode();

  return (
    <footer className={`${isDarkMode ? 'bg-primary-dark text-white' : 'bg-primary-light text-white'} py-6 mt-auto`}>
      <div className="container mx-auto px-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">SGQ - Sistema de Gestão da Qualidade</h3>
          <p className="text-sm text-gray-300">
            Desenvolvido para auxiliar na gestão da qualidade e conformidade dos processos.
          </p>
        </div>
        <div className={`mt-8 pt-6 border-t border-gray-700 text-center text-sm text-gray-400`}>
          <p>&copy; {new Date().getFullYear()} SGQ. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;