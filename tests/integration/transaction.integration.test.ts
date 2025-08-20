// tests/integration/transaction.integration.test.ts

import request from 'supertest';
// Importa app, server e funções do DB re-exportadas de 'app'
import { app, server, connectDB, disconnectDB, clearCollections } from '../../src/app';
// Importa o modelo Mongoose de Transaction e sua interface ITransaction
import Transaction, { ITransaction } from '../../src/models/transaction.model'; // Adicionado ITransaction aqui

describe('Rotas de Transações - Testes de Integração', () => {
  // Antes de todos os testes, conecta ao DB
  beforeAll(async () => {
    await connectDB();
  });

  // Antes de cada teste, limpa a coleção de transações para garantir um estado limpo
  beforeEach(async () => {
    await clearCollections(['Transaction']);
  });

  // Após todos os testes, desconecta do DB e fecha o servidor
  afterAll(async () => {
    await disconnectDB();
    if (server) {
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });

  // --- Testes para POST /transactions ---
  it('POST /transactions - deve criar uma nova transação com sucesso', async () => {
    const newTransactionData = {
      description: 'Compra de Livro',
      amount: -50,
      date: new Date().toISOString(), // Data atual
      type: 'expense',
      category: 'Educação',
    };

    const res = await request(app).post('/transactions').send(newTransactionData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.description).toEqual(newTransactionData.description);
    expect(res.body.amount).toEqual(newTransactionData.amount);
    expect(res.body.type).toEqual(newTransactionData.type);
    expect(res.body._id).toBeDefined();

    const transactionInDb = await Transaction.findById(res.body._id);
    expect(transactionInDb).toBeDefined();
    expect(transactionInDb?.description).toEqual(newTransactionData.description);
  });

  it('POST /transactions - deve retornar 400 se campos obrigatórios estiverem faltando', async () => {
    const invalidTransactionData = { amount: -50 }; // Sem descrição, data, tipo, categoria
    const res = await request(app).post('/transactions').send(invalidTransactionData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('descrição da transação é obrigatória');
    expect(res.body.message).toContain('data da transação é obrigatória');
    expect(res.body.message).toContain('tipo da transação é obrigatório');
    expect(res.body.message).toContain('categoria da transação é obrigatória');
  });

  // --- Testes para GET /transactions/:id ---
  it('GET /transactions/:id - deve retornar uma transação por ID', async () => {
    const createdTransaction = await Transaction.create({
      description: 'Recebimento de Pagamento',
      amount: 1500,
      date: new Date(),
      type: 'income',
      category: 'Trabalho',
    }) as ITransaction; // Adiciona o cast ITransaction aqui para ajudar na tipagem do _id

    const res = await request(app).get(`/transactions/${createdTransaction._id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.description).toEqual('Recebimento de Pagamento');
    // Para comparar com o _id do corpo da resposta, converta para string
    expect(res.body._id).toEqual(createdTransaction._id.toString());
  });

  it('GET /transactions/:id - deve retornar 404 se a transação não for encontrada', async () => {
    const nonExistentId = '60c72b2f9f1b2c001f8e9a2b';
    const res = await request(app).get(`/transactions/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Transação não encontrada');
  });

  it('GET /transactions/:id - deve retornar 400 para um ID inválido', async () => {
    const invalidId = '123';
    const res = await request(app).get(`/transactions/${invalidId}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('ID de transação inválido.');
  });

  // --- Testes para GET /transactions ---
  it('GET /transactions - deve retornar um array vazio se não houver transações', async () => {
    const res = await request(app).get('/transactions');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('GET /transactions - deve retornar uma lista de transações existentes', async () => {
    await Transaction.create({ description: 'Salário', amount: 3000, date: new Date(), type: 'income', category: 'Salário' });
    await Transaction.create({ description: 'Aluguel', amount: -1200, date: new Date(), type: 'expense', category: 'Moradia' });

    const res = await request(app).get('/transactions');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].description).toEqual('Salário');
    expect(res.body[1].description).toEqual('Aluguel');
  });

  // --- Testes para PUT /transactions/:id ---
  it('PUT /transactions/:id - deve atualizar uma transação existente', async () => {
    const createdTransaction = await Transaction.create({
      description: 'Compra Antiga',
      amount: -100,
      date: new Date(),
      type: 'expense',
      category: 'Compras',
    }) as ITransaction; // Adiciona o cast ITransaction aqui

    const updatedData = { description: 'Compra Nova', amount: -120, category: 'Lazer' };

    const res = await request(app).put(`/transactions/${createdTransaction._id}`).send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.description).toEqual(updatedData.description);
    expect(res.body.amount).toEqual(updatedData.amount);
    expect(res.body.category).toEqual(updatedData.category);

    const transactionInDb = await Transaction.findById(createdTransaction._id);
    expect(transactionInDb?.description).toEqual(updatedData.description);
    expect(transactionInDb?.amount).toEqual(updatedData.amount);
    expect(transactionInDb?.category).toEqual(updatedData.category);
  });

  it('PUT /transactions/:id - deve retornar 404 se a transação a ser atualizada não for encontrada', async () => {
    const nonExistentId = '60c72b2f9f1b2c001f8e9a2b';
    const updatedData = { description: 'Não existe' };
    const res = await request(app).put(`/transactions/${nonExistentId}`).send(updatedData);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Transação não encontrada');
  });

  it('PUT /transactions/:id - deve retornar 400 para ID inválido ao atualizar', async () => {
    const invalidId = 'invalid-id';
    const updatedData = { description: 'Update' };
    const res = await request(app).put(`/transactions/${invalidId}`).send(updatedData);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('ID de transação inválido.');
  });

  // --- Testes para DELETE /transactions/:id ---
  it('DELETE /transactions/:id - deve deletar uma transação existente', async () => {
    const createdTransaction = await Transaction.create({
      description: 'Para deletar',
      amount: -20,
      date: new Date(),
      type: 'expense',
      category: 'Diversos',
    }) as ITransaction; // Adiciona o cast ITransaction aqui
    const res = await request(app).delete(`/transactions/${createdTransaction._id}`);

    expect(res.statusCode).toEqual(204); // No Content

    const transactionInDb = await Transaction.findById(createdTransaction._id);
    expect(transactionInDb).toBeNull(); // Deve ter sido deletada
  });

  it('DELETE /transactions/:id - deve retornar 404 se a transação a ser deletada não for encontrada', async () => {
    const nonExistentId = '60c72b2f9f1b2c001f8e9a2b';
    const res = await request(app).delete(`/transactions/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Transação não encontrada');
  });

  it('DELETE /transactions/:id - deve retornar 400 para ID inválido ao deletar', async () => {
    const invalidId = 'invalid-id';
    const res = await request(app).delete(`/transactions/${invalidId}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('ID de transação inválido.');
  });
});
