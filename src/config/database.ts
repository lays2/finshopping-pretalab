// src/config/database.ts

import mongoose from 'mongoose'; // Importa a biblioteca Mongoose

// URL de conexão com o MongoDB.
// É altamente recomendável usar variáveis de ambiente para a URL do DB em produção.
// Para desenvolvimento local, você pode usar 'mongodb://localhost:27017/pretalab_db'.
// Certifique-se de que um servidor MongoDB esteja rodando.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://santoslays67:OjjhskOnIFwe8KIv@lays.dqibjym.mongodb.net/?retryWrites=true&w=majority&appName=Lays';

/**
 * Conecta a aplicação ao banco de dados MongoDB.
 * @returns {Promise<void>} Uma promessa que resolve quando a conexão é bem-sucedida.
 */
export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🎉 Conexão com o MongoDB estabelecida com sucesso!');
  } catch (error: any) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1); // Encerra o processo da aplicação em caso de falha na conexão
  }
};

/**
 * Desconecta a aplicação do banco de dados MongoDB.
 * Útil para testes ou para desligamento gracioso do servidor.
 * @returns {Promise<void>} Uma promessa que resolve quando a desconexão é bem-sucedida.
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('👋 Conexão com o MongoDB encerrada.');
  } catch (error: any) {
    console.error('❌ Erro ao desconectar do MongoDB:', error.message);
  }
};

/**
 * Limpa uma ou mais coleções do banco de dados.
 * Essencial para testes de integração para garantir um estado limpo antes de cada teste.
 * @param {string[]} collectionNames Nomes das coleções a serem limpas.
 * @returns {Promise<void>} Uma promessa que resolve quando as coleções são limpas.
 */
export const clearCollections = async (collectionNames: string[]): Promise<void> => {
  try {
    for (const name of collectionNames) {
      // Verifica se o modelo existe antes de tentar acessá-lo
      if (mongoose.models[name]) {
        await mongoose.models[name].deleteMany({});
        console.log(`🧹 Coleção '${name}' limpa.`);
      } else {
        // Se o modelo não foi carregado, pode tentar acessar diretamente a coleção via connection
        // ou garantir que todos os modelos relevantes sejam importados/registrados antes de chamar clearCollections
        console.warn(`⚠️ Modelo para a coleção '${name}' não encontrado. Pulando limpeza.`);
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao limpar coleções:', error.message);
  }
};
