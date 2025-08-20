// src/app.ts (ou index.ts)

import express, { Request, Response } from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Importa as funções de conexão/desconexão/limpeza do DB diretamente do arquivo de configuração
import { connectDB, disconnectDB, clearCollections } from './config/database';

// Importa os modelos Mongoose para Tasks e Transactions
import Task from './models/task.model';
import Transaction from './models/transaction.model';

const app = express();
const port = 3000;

// --- Middlewares ---
app.use(express.json()); // Analisa o corpo das requisições JSON
app.use(cors());         // Habilita CORS para permitir requisições de diferentes origens

// --- Configuração da API Gemini ---
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// --- Rotas da API ---

// Rota Raiz
app.get('/', (req: Request, res: Response) => {
    res.send("Bem-vindo à API de Tarefas, Transações (MongoDB) e Gemini!");
});

// --- Rotas de Tarefas (COM MONGODB) ---

// GET /tasks - Lista todas as tarefas
app.get('/tasks', async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error: any) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ message: 'Erro interno ao buscar tarefas.' });
    }
});

// GET /tasks/:id - Detalha uma tarefa por ID
app.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Tarefa não encontrada" });
        }
        res.json(task);
    } catch (error: any) {
        console.error('Erro ao buscar tarefa por ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de tarefa inválido.' });
        }
        res.status(500).json({ message: 'Erro interno ao buscar tarefa.' });
    }
});

// POST /tasks - Cria uma nova tarefa
app.post('/tasks', async (req: Request, res: Response) => {
    try {
        const newTask = new Task(req.body);
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error: any) {
        console.error('Erro ao criar tarefa:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno ao criar tarefa.' });
    }
});

// PUT /tasks/:id - Atualiza uma tarefa existente
app.put('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedTask) {
            return res.status(404).json({ message: "Tarefa não encontrada" });
        }
        res.json(updatedTask);
    } catch (error: any) {
        console.error('Erro ao atualizar tarefa:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de tarefa inválido.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno ao atualizar tarefa.' });
    }
});

// DELETE /tasks/:id - Deleta uma tarefa
app.delete('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) {
            return res.status(404).json({ message: "Tarefa não encontrada" });
        }
        res.status(204).send();
    } catch (error: any) {
        console.error('Erro ao deletar tarefa:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de tarefa inválido.' });
        }
        res.status(500).json({ message: 'Erro interno ao deletar tarefa.' });
    }
});

// --- Rotas de Transações (COM MONGODB) ---

// GET /transactions/:id - Detalha uma transação por ID
app.get('/transactions/:id', async (req: Request, res: Response) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transação não encontrada' });
        }
        res.json(transaction);
    } catch (error: any) {
        console.error('Erro ao buscar transação por ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de transação inválido.' });
        }
        res.status(500).json({ message: 'Erro interno ao buscar transação.' });
    }
});

// POST /transactions - Cria uma nova transação
app.post('/transactions', async (req: Request, res: Response) => {
    try {
        const newTransaction = new Transaction(req.body);
        await newTransaction.save();
        res.status(201).json(newTransaction);
    } catch (error: any) {
        console.error('Erro ao criar transação:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno ao criar transação.' });
    }
});

// GET /transactions - Lista todas as transações
app.get('/transactions', async (req: Request, res: Response) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error: any) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ message: 'Erro interno ao buscar transações.' });
    }
});

// PUT /transactions/:id - Atualiza uma transação existente
app.put('/transactions/:id', async (req: Request, res: Response) => {
    try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedTransaction) {
            return res.status(404).json({ message: 'Transação não encontrada' });
        }
        res.json(updatedTransaction);
    } catch (error: any) {
        console.error('Erro ao atualizar transação:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de transação inválido.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro interno ao atualizar transação.' });
    }
});

// DELETE /transactions/:id - Deleta uma transação
app.delete('/transactions/:id', async (req: Request, res: Response) => {
    try {
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transação não encontrada' });
        }
        res.status(204).send();
    } catch (error: any) {
        console.error('Erro ao deletar transação:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de transação inválido.' });
        }
        res.status(500).json({ message: 'Erro interno ao deletar transação.' });
    }
});

// --- Rota de Integração com Gemini ---
app.post('/gemini/generate', async (req: Request, res: Response) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'O prompt é obrigatório no corpo da requisição.' });
    }

    try {
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(prompt);
        const responseText = await result.response.text();

        res.json({ generatedText: responseText });

    } catch (error: any) {
        console.error('Erro ao chamar a API Gemini:', error);
        if (error.message && error.message.includes('API key not valid')) {
            return res.status(401).json({
                message: 'Erro de autenticação com a API Gemini: Chave inválida ou ausente. Certifique-se de que a variável de ambiente GEMINI_API_KEY está configurada corretamente.'
            });
        }
        res.status(500).json({ message: 'Erro interno ao gerar texto com Gemini.', error: error.message });
    }
});


// Inicia o servidor Express E conecta ao MongoDB
let serverInstance: any; // Declaração para o servidor poder ser fechado
connectDB().then(() => {
    serverInstance = app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch(error => {
    console.error("Falha ao iniciar o servidor devido ao erro de conexão com o DB:", error);
    process.exit(1);
});

// --- EXPORTAÇÕES PARA TESTES ---
// Exporta o app, a instância do servidor, e as funções de DB para que os testes de integração
// possam controlá-las (conectar/desconectar/limpar coleções).
export { app, serverInstance as server, connectDB, disconnectDB, clearCollections };