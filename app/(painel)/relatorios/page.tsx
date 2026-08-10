import { existsSync } from 'node:fs';
import { redirect } from 'next/navigation';
import { SemPermissao } from '@/components/layout/sem-permissao';
import { TelaRelatorios, ABAS, type Aba } from '@/components/relatorios/tela-relatorios';
import { TelaMarketing, type EstadoFonte } from '@/components/relatorios/tela-marketing';
import { montarComercial, type Periodo } from '@/lib/relatorios';
import { verRelatorios } from '@/lib/permissoes';
import { lerSessao } from '@/lib/sessao';

const ABAS_MARKETING = ['origem', 'google-ads', 'site'];

const fontesDeMarketing = (): EstadoFonte[] => {
  const temChave = Boolean(
    process.env.GOOGLE_SA_KEY_PATH && existsSync(process.env.GOOGLE_SA_KEY_PATH),
  );

  return [
    {
      id: 'ga4',
      nome: 'Google Analytics 4',
      configurado: temChave && Boolean(process.env.GA4_PROPERTY_ID),
      detalhe: process.env.GA4_PROPERTY_ID
        ? `Propriedade ${process.env.GA4_PROPERTY_ID}, conta de serviço no servidor`
        : 'Sem propriedade configurada',
      falta: 'Falta a leitura automática das sessões e páginas.',
    },
    {
      id: 'gsc',
      nome: 'Search Console',
      configurado: temChave && Boolean(process.env.GSC_SITE_URL),
      detalhe: process.env.GSC_SITE_URL ?? 'Sem propriedade configurada',
      falta: 'Falta a leitura das buscas que trazem visita.',
    },
    {
      id: 'ads',
      nome: 'Google Ads',
      configurado: Boolean(process.env.GADS_DEVELOPER_TOKEN && process.env.GADS_CUSTOMER_ID),
      detalhe: process.env.GADS_CUSTOMER_ID
        ? `Conta ${process.env.GADS_CUSTOMER_ID}, token de desenvolvedor no servidor`
        : 'Sem conta configurada',
      falta: 'Falta autorizar o acesso pelo Google, que é feito uma vez pelo navegador.',
    },
  ];
};

type Busca = Promise<{ aba?: string; periodo?: string }>;

const PaginaRelatorios = async ({ searchParams }: { searchParams: Busca }) => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  if (!verRelatorios(usuario.papel)) {
    return <SemPermissao papel={usuario.papel} precisa="para gerentes e administradores" />;
  }

  const { aba, periodo } = await searchParams;

  if (aba && ABAS_MARKETING.includes(aba)) {
    return (
      <div className="h-full overflow-y-auto p-5">
        <TelaMarketing fontes={fontesDeMarketing()} />
      </div>
    );
  }

  const abaAtual = (ABAS.find((a) => a.id === aba)?.id ?? 'geral') as Aba;
  const periodoAtual = (['30', '90', '365', 'tudo'].includes(periodo ?? '')
    ? periodo
    : '90') as Periodo;

  const dados = await montarComercial(periodoAtual);

  return (
    <div className="h-full overflow-y-auto p-5">
      <TelaRelatorios dados={dados} aba={abaAtual} />
    </div>
  );
};

export default PaginaRelatorios;
