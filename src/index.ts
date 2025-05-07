import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import Leitura from './models/leitura';
import './serialReader';

const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const MONGODB_URI = 'mongodb://127.0.0.1:27017/campo_magnetico';

// Conexão robusta com MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Conectado ao MongoDB');
  } catch (err) {
    console.error('❌ Falha na conexão com MongoDB:', err);
    process.exit(1);
  }
}

connectToDatabase();

// Rotas
app.get('/leituras', async (req, res) => {
  try {
    const leituras = await Leitura.find().sort({ timestamp: -1 });
    res.json(leituras);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar leituras' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});