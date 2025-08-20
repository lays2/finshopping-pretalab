import { connectDB } from './../../src/config/database';
// tests/integration/gemini.integration.test.ts

import request from 'supertest';
// Importa a instância do aplicativo Express e o servidor que o 'app.listen()' retorna
// para que possamos iniciar e parar o servidor nos testes.
import { app, server, } from '../../src/app'; // Adicionado connectDB e disconnectDB para DB nos testes de integração

// Descreve o conjunto de testes de integração para a rota POST /gemini/generate
describe('POST /gemini/generate - Testes de Integração', () => {

  // Antes de todos os testes, certifique-se de que o servidor está pronto
  beforeAll(async () => {
    // Conecta ao banco de dados, necessário para que o app Express inicie corretamente
    await connectDB();
    // O servidor já é iniciado em app.ts após a conexão com o DB.
    // Nada mais a fazer aqui para iniciar o servidor.
  });

  // Após todos os testes, feche o servidor para liberar a porta e desconecte do DB
  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve)); // Fecha o servidor
      console.log('Servidor de teste Gemini fechado.');
    }
    await connectDB (); // Desconecta do DB após os testes
  });

  // Teste: Deve retornar 200 e um texto gerado para um prompt válido
  it('deve retornar 200 e um texto gerado para um prompt válido', async () => {
    const prompt = 'Qual a capital do Brasil?'; // Prompt de exemplo

    // Faz uma requisição POST para a rota '/gemini/generate' com o prompt
    const res = await request(app)
      .post('/gemini/generate')
      .send({ prompt }); // Envia o prompt no corpo da requisição como JSON

    // Assertions:
    expect(res.statusCode).toEqual(200); // Espera status 200 OK
    expect(res.body).toHaveProperty('generatedText'); // Espera que a resposta tenha a propriedade 'generatedText'
    expect(typeof res.body.generatedText).toBe('string'); // Espera que 'generatedText' seja uma string
    expect(res.body.generatedText.length).toBeGreaterThan(0); // Espera que a string não esteja vazia
    // Opcional: pode-se adicionar uma verificação mais específica sobre o conteúdo,
    // mas respostas de LLMs podem variar.
    expect(res.body.generatedText).toContain('Brasília'); // Espera que a resposta contenha "Brasília"
  }, 20000); // Aumenta o timeout para este teste, pois chamadas de API podem demorar

  // Teste: Deve retornar 400 Bad Request se o prompt estiver ausente
  it('deve retornar 400 se o prompt estiver ausente', async () => {
    const res = await request(app)
      .post('/gemini/generate')
      .send({}); // Envia um corpo vazio ou sem a propriedade 'prompt'

    // Assertions:
    expect(res.statusCode).toEqual(400); // Espera status 400 Bad Request
    expect(res.body).toEqual({ message: 'O prompt é obrigatório no corpo da requisição.' });
  });

  // Teste: Deve retornar 401 se a API Key for inválida/ausente (simulando no ambiente de teste)
  // Este teste é importante para garantir o tratamento de erros da API Key.
  it('deve retornar 401 se a API Key do Gemini for inválida/ausente', async () => {
    // Para testar isso em um ambiente de integração, o mais confiável seria:
    // 1. Em um ambiente de CI, garantir que a variável de ambiente GEMINI_API_KEY NÃO esteja configurada.
    // 2. Ou, em um ambiente de teste local, temporariamente remover a variável de ambiente
    //    ou modificar o `app.ts` para usar uma chave inválida para este teste específico (e revertê-lo depois).
    // O teste espera que o erro de autenticação seja tratado e retorne 401.
    
    // Para fins de demonstração, se a sua variável de ambiente local para GEMINI_API_KEY estiver vazia ou não definida
    // e o `app.ts` estiver usando `process.env.GEMINI_API_KEY || ""` para uma chave vazia, este teste funcionará.
    // Se você tiver uma chave válida configurada localmente, este teste pode falhar a menos que você
    // force uma chave inválida para ele.

    const prompt = 'Este é um teste para chave inválida.';
    const res = await request(app)
      .post('/gemini/generate')
      .send({ prompt });

    // A asserção esperada é 401.
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toContain('API key inválida');
  }, 20000); // Aumenta o timeout
});
