import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import Leitura from './leitura';

const app = express();
app.use(bodyParser.json());

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

const PORT = 3000;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/campo_magnetico';

// Conexão com MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Conectado ao MongoDB');
  } catch (err) {
    console.error('❌ Falha na conexão com MongoDB:', err);
    process.exit(1);
  }
}

// Configuração da porta serial
function setupSerialConnection() {
  // Lista portas seriais disponíveis (útil para debug)
  SerialPort.list().then(ports => {
    console.log('Portas seriais disponíveis:');
    ports.forEach(port => {
      console.log(`- ${port.path}`, port.manufacturer);
    });
  });

  // Ajuste a porta conforme necessário (COM3 no Windows, /dev/ttyUSB0 ou /dev/ttyACM0 no Linux)
  const port = new SerialPort({
    path: 'COM4', // Substitua pela porta correta
    baudRate: 9600,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  // Buffer para acumular dados e lidar com mensagens incompletas
  let buffer = '';

  parser.on('data', async (data: string) => {
    try {
      buffer += data;
      console.log(`Dados brutos recebidos: ${data}`);
      
      // Processa todos os JSONs completos no buffer
      while (true) {
        const startIdx = buffer.indexOf('{');
        const endIdx = buffer.indexOf('}', startIdx);
        
        // Sai do loop se não encontrar um JSON completo
        if (startIdx === -1 || endIdx === -1) break;
        
        // Extrai o JSON do buffer
        const jsonStr = buffer.substring(startIdx, endIdx + 1);
        buffer = buffer.substring(endIdx + 1); // Remove o JSON processado do buffer
        
        try {
          console.log(`Processando JSON: ${jsonStr}`);
          const parsedData = JSON.parse(jsonStr);
          
          // Validação dos dados
          if (typeof parsedData.valor !== 'number' || !['IMÃ_DETECTADO', 'SEM_IMÃ'].includes(parsedData.estado)) {
            throw new Error('Formato de dados inválido');
          }

          // Salva no MongoDB
          const novaLeitura = await Leitura.create({
            valor: parsedData.valor,
            estado: parsedData.estado,
            timestamp: new Date(),
          });

          console.log(`✅ Leitura salva no MongoDB: ID ${novaLeitura._id}`);
        } catch (jsonError) {
          if (jsonError && typeof jsonError === 'object' && 'message' in jsonError) {
            console.error('❌ Erro ao processar JSON:', (jsonError as { message: string }).message);
          } else {
            console.error('❌ Erro ao processar JSON:', jsonError);
          }
          continue; // Continua para o próximo JSON no buffer
        }
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        console.error('❌ Erro no handler serial:', (error as { message: string }).message);
      } else {
        console.error('❌ Erro no handler serial:', error);
      }
    }
  });

  port.on('error', (err: Error) => {
    console.error('Erro na porta serial:', err);
  });

  port.on('open', () => {
    console.log('✅ Conexão serial estabelecida');
  });
}

// Inicialização do servidor
async function startServer() {
  await connectToDatabase();
  setupSerialConnection();

  // Rotas existentes
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.get('/leituras', async (req, res) => {
    try {
      const leituras = await Leitura.find().sort({ timestamp: -1 });
      res.json(leituras);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar leituras' });
    }
  });

  app.post('/leituras', async (req, res) => {
    try {
      const { valor, estado } = req.body;
      const novaLeitura = await Leitura.create({ valor, estado });
      res.status(201).json(novaLeitura);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao salvar leitura' });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Falha na inicialização:', err);
  process.exit(1);
});