import { redirect } from 'next/navigation';
import { SemPermissao } from '@/components/layout/sem-permissao';
import { TelaRelatorios } from '@/components/relatorios/tela-relatorios';
import { TelaMarketing } from '@/components/relatorios/tela-marketing';
import {
  ABAS_COMERCIAL,
  ABAS_MARKETING,
  type Aba,
  type AbaMarketing,
} from '@/lib/abas-relatorio';
import { montarComercial } from '@/lib/relatorios';
import type { Periodo } from '@/lib/periodos';
import { montarMarketing } from '@/lib/relatorios-marketing';
import { verRelatorios } from '@/lib/permissoes';
import { lerSessao } from '@/lib/sessao';

type Busca = Promise<{ aba?: string; periodo?: string }>;

const PaginaRelatorios = async ({ searchParams }: { searchParams: Busca }) => {
  const usuario = await lerSessao();

  if (!usuario) redirect('/login');

  if (!verRelatorios(usuario.papel)) {
    return <SemPermissao papel={usuario.papel} precisa="para gerentes e administradores" />;
  }

  const { aba, periodo } = await searchParams;

  const periodoAtual = (['30', '90', '365', 'tudo'].includes(periodo ?? '')
    ? periodo
    : '90') as Periodo;

  const abaMarketing = ABAS_MARKETING.find((a) => a.id === aba)?.id;

  if (abaMarketing) {
    const dados = await montarMarketing(periodoAtual);

    return (
      <div className="h-full overflow-y-auto p-5">
        <TelaMarketing dados={dados} aba={abaMarketing as AbaMarketing} />
      </div>
    );
  }

  const abaAtual = (ABAS_COMERCIAL.find((a) => a.id === aba)?.id ?? 'geral') as Aba;
  const dados = await montarComercial(periodoAtual);

  return (
    <div className="h-full overflow-y-auto p-5">
      <TelaRelatorios dados={dados} aba={abaAtual} />
    </div>
  );
};

export default PaginaRelatorios;
