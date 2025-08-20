// Esta interface define a estrutura esperada para um objeto de transação.
// Embora esta interface seja para dados mock em memória, ela pode ser útil
// para comparar com a estrutura dos seus documentos do MongoDB, se necessário.
export interface Transaction {
  id: number;
  description: string;
  amount: number; // Valor da transação (pode ser positivo para entrada, negativo para saída)
  date: string;   // Data da transação no formato YYYY-MM-DD
  type: 'income' | 'expense'; // Tipo da transação: 'income' (receita) ou 'expense' (despesa)
  category: string; // Categoria da transação
}

// Este array contém dados de transações de exemplo que eram usados quando a API
// armazenava dados apenas em memória. Com o MongoDB, estes dados não são mais
// utilizados diretamente pelas operações CRUD da API.
export const transactions: Transaction[] = [
  { id: 1, description: 'Salário', amount: 3000, date: '2024-07-01', type: 'income', category: 'Salário' },
  { id: 2, description: 'Aluguel', amount: -1200, date: '2024-07-05', type: 'expense', category: 'Moradia' },
  { id: 3, description: 'Supermercado', amount: -350, date: '2024-07-10', type: 'expense', category: 'Alimentação' },
  { id: 4, description: 'Freelance Design', amount: 800, date: '2024-07-15', type: 'income', category: 'Serviços' },
  { id: 5, description: 'Transporte', amount: -150, date: '2024-07-18', type: 'expense', category: 'Transporte' },
  { id: 6, description: 'Venda de Item Usado', amount: 200, date: '2024-07-20', type: 'income', category: 'Vendas' },
  { id: 7, description: 'Conta de Luz', amount: -80, date: '2024-07-22', type: 'expense', category: 'Contas' },
];
