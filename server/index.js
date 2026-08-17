require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PAGARME_API_KEY = process.env.PAGARME_API_KEY;

// Route for creating a transaction with Pagar.me
app.post('/api/pagarme/transaction', async (req, res) => {
  try {
    const { amount, card_number, card_cvv, card_expiration_date, card_holder_name, customer } = req.body;

    // Convert amount to cents (Pagar.me expects cents)
    const amountInCents = Math.round(amount * 100);

    const payload = {
      api_key: PAGARME_API_KEY,
      amount: amountInCents,
      card_number,
      card_cvv,
      card_expiration_date,
      card_holder_name,
      customer: {
        external_id: customer.id,
        name: customer.name,
        type: 'individual',
        country: 'br',
        email: customer.email,
        documents: [
          {
            type: 'cpf',
            number: customer.cpf || '00000000000' // Placeholder if not provided
          }
        ],
        phone_numbers: ['+55' + customer.phone.replace(/\D/g, '')]
      },
      billing: {
        name: customer.name,
        address: {
          country: 'br',
          state: 'RJ', // Defaulting to RJ as it's Quissamã
          city: 'Quissamã',
          neighborhood: customer.neighborhood,
          street: customer.street,
          street_number: 'S/N',
          zipcode: customer.cep.replace(/\D/g, '')
        }
      },
      items: [
        {
          id: '1',
          title: 'Pedido Manda Brasa Delivery',
          unit_price: amountInCents,
          quantity: 1,
          tangible: true
        }
      ]
    };

    const response = await axios.post('https://api.pagar.me/1/transactions', payload);

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Pagar.me API Error:', error.response ? error.response.data : error.message);
    res.status(400).json({ 
      error: 'Erro ao processar pagamento', 
      details: error.response ? error.response.data.errors : error.message 
    });
  }
});

// Route for Pix generation (V5 Core API)
app.post('/api/pagarme', async (req, res) => {
  try {
    const { amount, customer } = req.body;

    if (!amount || !customer) {
      return res.status(400).json({ error: 'Faltam dados obrigatórios' });
    }

    // Usamos a chave do .env do server (deve ser a Secret Key v5 se possível)
    const secretKey = PAGARME_API_KEY; // Nota: A API v5 exige Secret Key, se PAGARME_API_KEY for a chave v4, pode falhar. Se tiver uma PAGARME_SECRET_KEY, use-a.
    const actualKey = process.env.PAGARME_SECRET_KEY || secretKey;

    if (!actualKey) {
      return res.status(500).json({ error: 'Chave secreta do Pagar.me não configurada.' });
    }

    let ddd = '22';
    let number = '999999999';
    if (customer.phone) {
      const cleanPhone = customer.phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        ddd = cleanPhone.substring(0, 2);
        number = cleanPhone.substring(2);
      }
    }

    const payload = {
      items: [
        {
          amount: Math.round(amount * 100),
          description: 'Pedido Manda Brasa Delivery',
          quantity: 1,
          code: `ped_${Date.now()}`
        }
      ],
      customer: {
        name: customer.name || 'Cliente Manda Brasa',
        email: customer.email || 'cliente@mandabrasa.com',
        type: 'individual',
        document: customer.cpf || '00000000000',
        phones: {
          mobile_phone: {
            country_code: '55',
            area_code: ddd,
            number: number
          }
        }
      },
      payments: [
        {
          payment_method: 'pix',
          pix: {
            expires_in: 3600
          }
        }
      ]
    };

    const encodedKey = Buffer.from(`${actualKey}:`).toString('base64');
    
    // axios is used in server/index.js
    const response = await axios.post('https://api.pagar.me/core/v5/orders', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      }
    });

    const data = response.data;
    
    if (data.status === 'failed') {
      const errorMsg = data.charges[0]?.last_transaction?.gateway_response?.errors?.[0]?.message || 'Transação recusada pelo gateway';
      return res.status(400).json({ error: 'Falha ao gerar PIX no Pagar.me', details: errorMsg });
    }

    const pixData = data.charges[0]?.last_transaction?.qr_code_url;
    const pixText = data.charges[0]?.last_transaction?.qr_code;

    if (!pixData) {
      return res.status(400).json({ error: 'QR Code não retornado pelo Pagar.me' });
    }

    res.status(200).json({
      qr_code_url: pixData,
      qr_code: pixText,
      transaction_id: data.id,
      status: data.status
    });
  } catch (error) {
    console.error('Pagar.me API Error:', error.response ? error.response.data : error.message);
    res.status(400).json({ error: 'Erro ao gerar PIX', details: error.response ? error.response.data : error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
