import request from 'supertest';
import { app, server, connectDB, disconnectDB, clearCollections } from '../../src/app'; // Importa app, server e funções do DB
import Task from '../../src/models/task.model'; // Importa o modelo Mongoose de Task

describe('Rotas de Tarefas - Testes de Integração', () => {
  // Antes de todos os testes, conecta ao DB e inicia o servidor (se ainda não estiver conectado/iniciado)
  beforeAll(async () => {
    await connectDB(); // Garante que a conexão com o DB esteja ativa
    // O servidor já é iniciado em app.ts após a conexão com o DB.
    // Nada mais a fazer aqui para iniciar o servidor.
  });

  // Antes de cada teste, limpa a coleção de tarefas para garantir um estado limpo
  beforeEach(async () => {
    await clearCollections(['Task']); // Passa o nome da coleção (modelo) para limpar
  });

  // Após todos os testes, desconecta do DB e fecha o servidor
  afterAll(async () => {
    await disconnectDB(); // Desconecta do DB
    if (server) {
      await new Promise(resolve => server.close(resolve)); // Fecha o servidor
    }
  });

  // --- Testes para GET /tasks ---
  it('GET /tasks - deve retornar um array vazio se não houver tarefas', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('GET /tasks - deve retornar uma lista de tarefas existentes', async () => {
    await Task.create({ title: 'Comprar leite', completed: false });
    await Task.create({ title: 'Pagar contas', completed: true });

    const res = await request(app).get('/tasks');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].title).toEqual('Comprar leite');
    expect(res.body[1].title).toEqual('Pagar contas');
  });

  // --- Testes para POST /tasks ---
  it('POST /tasks - deve criar uma nova tarefa com sucesso', async () => {
    const newTask = { title: 'Fazer lição de casa', completed: false };
    const res = await request(app).post('/tasks').send(newTask);

    expect(res.statusCode).toEqual(201);
    expect(res.body.title).toEqual(newTask.title);
    expect(res.body.completed).toEqual(newTask.completed);
    expect(res.body._id).toBeDefined(); // Verifica se um ID do MongoDB foi gerado

    const taskInDb = await Task.findById(res.body._id);
    expect(taskInDb).toBeDefined();
    expect(taskInDb?.title).toEqual(newTask.title);
  });

  it('POST /tasks - deve retornar 400 se o título estiver ausente', async () => {
    const newTask = { completed: false }; // Sem título
    const res = await request(app).post('/tasks').send(newTask);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('O título da tarefa é obrigatório.');
  });

  // --- Testes para GET /tasks/:id ---
  it('GET /tasks/:id - deve retornar uma tarefa por ID', async () => {
    const createdTask = await Task.create({ title: 'Tarefa para buscar', completed: false });
    const res = await request(app).get(`/tasks/${createdTask._id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual('Tarefa para buscar');
    expect(res.body._id).toEqual(createdTask._id.toString());
  });

  it('GET /tasks/:id - deve retornar 404 se a tarefa não for encontrada', async () => {
    const nonExistentId = '60c72b2f9f1b2c001f8e9a2b'; // Um ID MongoDB válido, mas que não existe no DB
    const res = await request(app).get(`/tasks/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Tarefa não encontrada');
  });

  it('GET /tasks/:id - deve retornar 400 para um ID inválido', async () => {
    const invalidId = '123'; // Um ID que não é um formato de ObjectId válido do MongoDB
    const res = await request(app).get(`/tasks/${invalidId}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('ID de tarefa inválido.');
  });

  // --- Testes para PUT /tasks/:id ---
  it('PUT /tasks/:id - deve atualizar uma tarefa existente', async () => {
    const createdTask = await Task.create({ title: 'Tarefa para atualizar', completed: false });
    const updatedData = { title: 'Tarefa atualizada', completed: true };

    const res = await request(app).put(`/tasks/${createdTask._id}`).send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.title).toEqual(updatedData.title);
    expect(res.body.completed).toEqual(updatedData.completed);

    const taskInDb = await Task.findById(createdTask._id);
    expect(taskInDb?.title).toEqual(updatedData.title);
    expect(taskInDb?.completed).toEqual(updatedData.completed);
  });

  it('PUT /tasks/:id - deve retornar 404 se a tarefa a ser atualizada não for encontrada', async () => {
    const nonExistentId = '60c72b2f9f1b2c001f8e9a2b';
    const updatedData = { title: 'Não existe' };
    const res = await request(app).put(`/tasks/${nonExistentId}`).send(updatedData);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Tarefa não encontrada');
  });

  it('PUT /tasks/:id - deve retornar 400 para ID inválido ao atualizar', async () => {
    const invalidId = 'invalid-id';
    const updatedData = { title: 'Update' };
    const res = await request(app).put(`/tasks/${invalidId}`).send(updatedData);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('ID de tarefa inválido.');
  });


  // --- Testes para DELETE /tasks/:id ---
  it('DELETE /tasks/:id - deve deletar uma tarefa existente', async () => {
    const createdTask = await Task.create({ title: 'Tarefa para deletar', completed: false });
    const res = await request(app).delete(`/tasks/${createdTask._id}`);

    expect(res.statusCode).toEqual(204); // No Content

    const taskInDb = await Task.findById(createdTask._id);
    expect(taskInDb).toBeNull(); // Deve ter sido deletada
  });

  it('DELETE /tasks/:id - deve retornar 404 se a tarefa a ser deletada não for encontrada', async () => {
    const nonExistentId = '60c72b2f9f1b2c001f8e9a2b';
    const res = await request(app).delete(`/tasks/${nonExistentId}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Tarefa não encontrada');
  });

  it('DELETE /tasks/:id - deve retornar 400 para ID inválido ao deletar', async () => {
    const invalidId = 'invalid-id';
    const res = await request(app).delete(`/tasks/${invalidId}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('ID de tarefa inválido.');
  });
});
