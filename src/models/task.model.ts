import { Schema, model, Document, Types } from 'mongoose'; // Importa Schema, model, Document E Types do Mongoose

// Interface que estende Document do Mongoose para tipar o documento da tarefa
export interface ITask extends Document {
  _id: Types.ObjectId; // Adiciona explicitamente o tipo para _id
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Definição do esquema Mongoose para a coleção de tarefas
const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: [true, 'O título da tarefa é obrigatório.'], // O título é do tipo String e é obrigatório
    trim: true, // Remove espaços em branco do início e fim
  },
  completed: {
    type: Boolean,
    default: false, // O valor padrão para 'completed' é false
  },
}, {
  timestamps: true, // Adiciona automaticamente campos 'createdAt' e 'updatedAt'
});

// Cria e exporta o modelo Mongoose.
// Se o modelo 'Task' já foi compilado, usa-o; caso contrário, compila um novo.
const Task = model<ITask>('Task', TaskSchema);

export default Task; // Exporta o modelo Task
