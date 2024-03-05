# Use a imagem oficial do Node.js como base
FROM node:14

# Diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o código fonte para o contêiner
COPY . .

# Compile o TypeScript
RUN npm run build

# Expor a porta onde o aplicativo será executado
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
