import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import path from 'path'; // Adicione esta linha
import Leitura from './leitura';

const app = express();
app.use(bodyParser.json());

// Configuração para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

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

connectToDatabase();

// Rota raiz - serve o arquivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'index.html'));
});

// Rota para obter leituras
app.get('/leituras', async (req, res) => {
  try {
    const leituras = await Leitura.find().sort({ timestamp: -1 });
    res.json(leituras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar leituras' });
  }
});

// Rota para receber dados do ESP8266
app.post('/leituras', async (req, res) => {
  try {
    const { valor, estado } = req.body;

    const novaLeitura = await Leitura.create({
      valor,
      estado,
      timestamp: new Date(),
    });

    res.status(201).json(novaLeitura);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar leitura' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});