// tests/unit/transaction.unit.test.ts

// Importa os dados mock de transações para simular o ambiente
// IMPORTANTE: Embora a API agora use MongoDB, este teste unitário simula
// a lógica de busca em um array, o que é válido para testar a função `find`
// ou a lógica de filtragem em si, isolada da base de dados.
import { transactions, Transaction } from '../../src/data/transaction';

// Descreve o conjunto de testes para a funcionalidade de busca de transação
describe('Funcionalidade de Busca de Transação', () => {

  // Teste para verificar se uma transação existente é encontrada corretamente
  it('deve retornar uma transação se o ID existir', () => {
    const transactionId = 1; // ID da transação a ser buscada
    // Transação esperada para o ID 1
    const expectedTransaction: Transaction = {
      id: 1,
      description: 'Salário',
      amount: 3000,
      date: '2024-07-01',
      type: 'income',
      category: 'Salário'
    };

    // Simula a lógica de busca que seria usada no handler da rota (find em um array)
    const foundTransaction = transactions.find(t => t.id === transactionId);

    // Assertions:
    // Verifica se uma transação foi realmente encontrada
    expect(foundTransaction).toBeDefined();
    // Verifica se a transação encontrada é exatamente igual à transação esperada
    expect(foundTransaction).toEqual(expectedTransaction);
  });

  // Teste para verificar se nenhuma transação é retornada para um ID que não existe
  it('deve retornar undefined se o ID não existir', () => {
    const nonExistentId = 999; // ID que sabidamente não existe nos dados mock

    // Simula a lógica de busca
    const foundTransaction = transactions.find(t => t.id === nonExistentId);

    // Assertion: Verifica se o resultado da busca é 'undefined'
    expect(foundTransaction).toBeUndefined();
  });

  // Teste para verificar o comportamento com um ID não numérico
  // Nota: Em um ambiente Express, 'parseInt' lida com strings.
  // Aqui, testamos diretamente a lógica do '.find()' com um tipo inesperado.
  it('deve retornar undefined para um ID que não é um número válido para comparação', () => {
    const invalidId: any = 'abc'; // Simula um ID que seria uma string não numérica

    // O método 'find' compara estritamente os tipos.
    // 't.id' é um número, 'invalidId' é uma string. A comparação '===' falhará.
    const foundTransaction = transactions.find(t => t.id === invalidId);

    // Esperamos que nenhuma transação seja encontrada porque a comparação de tipo falha
    expect(foundTransaction).toBeUndefined();
  });
});
