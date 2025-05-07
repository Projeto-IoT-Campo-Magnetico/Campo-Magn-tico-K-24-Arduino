import { SerialPort } from 'serialport';
import mongoose from 'mongoose';
import Leitura from './models/leitura';

// Configurações
const SERIAL_PORT = 'COM4';
const BAUD_RATE = 115200;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/ky024-db';
const THRESHOLD = 874;

// Interface TypeScript
interface ILeitura extends mongoose.Document {
  valor: number;
  estado: string;
  timestamp: Date;
}

// Conexão MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado');
  } catch (err) {
    console.error('❌ Erro na conexão:', err);
    process.exit(1);
  }
}

// Função principal
async function main() {
  await connectDB();
  
  const port = new SerialPort({ path: SERIAL_PORT, baudRate: BAUD_RATE });
  let buffer = '';

  port.on('data', async (data: Buffer) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('VALOR:')) continue;

      try {
        const parts = line.trim().split(',');
        const valor = parseInt(parts[0].split(':')[1]);
        const estadoRaw = parts[1].split(':')[1];
        
        // Determina o estado baseado no threshold
        const estado = valor > THRESHOLD ? 'IMÃ_DETECTADO' : 'SEM_IMÃ';
        
        // Salva no MongoDB
        await Leitura.create({ 
          valor,
          estado,
          timestamp: new Date()
        } as ILeitura);

        console.log(`📊 Valor: ${valor} | ${estado}`);
        
      } catch (err) {
        console.error('Erro:', err instanceof Error ? err.message : String(err));
      }
    }
  });
}

// Inicialização
main().catch(console.error);

// Encerramento limpo
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});