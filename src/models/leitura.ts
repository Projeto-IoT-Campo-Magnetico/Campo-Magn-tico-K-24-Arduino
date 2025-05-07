import { Schema, model, Document } from 'mongoose';

export interface ILeitura extends Document {
  valor: number;
  estado: string;
  timestamp: Date;
}

const leituraSchema = new Schema<ILeitura>({
  valor: { type: Number, required: true },
  estado: { type: String, enum: ['IMÃ_DETECTADO', 'SEM_IMÃ'], required: true },
  timestamp: { type: Date, default: Date.now }
});

export default model<ILeitura>('Leitura', leituraSchema);