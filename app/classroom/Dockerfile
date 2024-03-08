# Use uma imagem base do Node.js 18
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app/classroom

# Copie o arquivo package.json para o diretório de trabalho
COPY package.json .

# Instale as dependências do projeto
RUN npm install

# Copie todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Execute o comando para gerar as migrações
RUN npx prisma generate

# Exponha a porta em que o servidor Classroom está ouvindo
EXPOSE 3000

# Comando para iniciar o servidor Classroom
CMD ["npm", "start"]
