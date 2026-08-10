import type { Metadata } from 'next';
import { FormularioLogin } from '@/components/login/formulario';
import { buscarConfiguracao, type ConfiguracaoGeral } from '@/lib/consultas';

// A tela de login é a porta de entrada: se o banco piscar, ela ainda precisa
// abrir para a pessoa tentar de novo. Sem isto, uma falha de conexão trocaria o
// formulário por uma tela de erro.
const PADRAO: ConfiguracaoGeral = {
  nomeLoja: 'Browns Alfaiataria',
  corMarca: '#4d322e',
  corSuave: '#fae9db',
  logoUrl: '/marca/logo.svg',
};

const configuracaoSegura = async () => {
  try {
    return await buscarConfiguracao();
  } catch {
    return PADRAO;
  }
};

export const generateMetadata = async (): Promise<Metadata> => {
  const { nomeLoja } = await configuracaoSegura();

  return { title: `Entrar · ${nomeLoja}` };
};

const PaginaLogin = async () => <FormularioLogin configuracao={await configuracaoSegura()} />;

export default PaginaLogin;
