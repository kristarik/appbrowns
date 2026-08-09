import { NextResponse, type NextRequest } from 'next/server';

const PUBLICAS = ['/login'];

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
