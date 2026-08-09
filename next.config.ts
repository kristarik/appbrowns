import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Gera um bundle que carrega so as dependencias realmente usadas, em vez de
  // levar o node_modules inteiro para a imagem. Necessario para o Dockerfile.
  output: 'standalone',
};

export default nextConfig;
