import { NextResponse, type NextRequest } from 'next/server';

// A rota de sincronização não tem sessão porque quem chama é o agendamento do
// servidor. Ela se protege sozinha, conferindo a chave no cabeçalho.
// A rota de sincronização e o webhook do WhatsApp não têm sessão: quem chama é
// o agendamento do servidor e a Meta. Cada uma se protege sozinha, por chave e
// por assinatura.
const PUBLICAS = ['/login', '/api/sincronizar', '/api/whatsapp'];

// Checagem barata: so confirma que existe um cookie de sessao, sem validar a
// assinatura, porque o middleware roda no runtime edge e verificar o JWT aqui
// encareceria toda navegacao. A validacao de verdade acontece no layout do
// painel, que roda no servidor e derruba token forjado ou expirado.
export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (PUBLICAS.some((rota) => pathname.startsWith(rota))) return NextResponse.next();

  const temSessao = request.cookies.has('browns_sessao');

  if (!temSessao) {
    const destino = new URL('/login', request.url);
    destino.searchParams.set('proximo', pathname);
    return NextResponse.redirect(destino);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
