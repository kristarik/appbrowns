export type CampoIntegracao = {
  id: string;
  rotulo: string;
  ajuda?: string;
};

// Fica fora do arquivo de acoes porque um modulo com 'use server' so pode
// exportar funcoes assincronas. Exportar este objeto de la quebrava a pagina.
export const CAMPOS_INTEGRACAO: Record<string, CampoIntegracao[]> = {
  whatsapp: [
    { id: 'phoneNumberId', rotulo: 'Phone Number ID', ajuda: 'Número no painel da Meta' },
    { id: 'businessAccountId', rotulo: 'WhatsApp Business Account ID' },
    { id: 'accessToken', rotulo: 'Token de acesso permanente' },
    {
      id: 'verifyToken',
      rotulo: 'Verify token do webhook',
      ajuda: 'Você inventa este valor e repete no painel da Meta',
    },
  ],
  bling: [
    { id: 'clientId', rotulo: 'Client ID' },
    { id: 'clientSecret', rotulo: 'Client Secret' },
  ],
};

export const DESCRICOES_INTEGRACAO: Record<string, { nome: string; texto: string }> = {
  whatsapp: {
    nome: 'WhatsApp Cloud API',
    texto:
      'Credenciais do app oficial da Meta. Guardadas criptografadas e nunca devolvidas para a tela.',
  },
  bling: {
    nome: 'Bling',
    texto: 'Credenciais do aplicativo criado no painel de desenvolvedor do Bling.',
  },
};
