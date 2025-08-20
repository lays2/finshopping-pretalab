// src/models/transaction.model.ts

import { Schema, model, Document } from 'mongoose'; // Importa Schema, model e Document do Mongoose

// Interface que estende Document do Mongoose para tipar o documento da transação
export interface ITransaction extends Document {
  description: string;
  amount: number;
  date: Date; // Usaremos Date para o tipo no MongoDB
  type: 'income' | 'expense';
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

// Definição do esquema Mongoose para a coleção de transações
const TransactionSchema = new Schema<ITransaction>({
  description: {
    type: String,
    required: [true, 'A descrição da transação é obrigatória.'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'O valor da transação é obrigatório.'],
  },
  date: {
    type: Date, // Armazenará a data como um tipo Date no MongoDB
    required: [true, 'A data da transação é obrigatória.'],
  },
  type: {
    type: String,
    enum: ['income', 'expense'], // O tipo deve ser 'income' ou 'expense'
    required: [true, 'O tipo da transação é obrigatório (income/expense).'],
  },
  category: {
    type: String,
    required: [true, 'A categoria da transação é obrigatória.'],
    trim: true,
  },
}, {
  timestamps: true, // Adiciona automaticamente campos 'createdAt' e 'updatedAt'
});

// Cria e exporta o modelo Mongoose.
// Se o modelo 'Transaction' já foi compilado, usa-o; caso contrário, compila um novo.
const Transaction = model<ITransaction>('Transaction', TransactionSchema);

export default Transaction; // Exporta o modelo Transaction
