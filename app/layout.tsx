import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Painel Browns Alfaiataria',
  description: 'Atendimento, funil e clientes da Browns Alfaiataria',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="pt-BR">
    <body className={`${geist.variable} antialiased`}>{children}</body>
  </html>
);

export default RootLayout;
