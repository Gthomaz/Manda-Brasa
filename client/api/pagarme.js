export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, customer } = req.body;

  if (!amount || !customer) {
    return res.status(400).json({ error: 'Faltam dados obrigatórios' });
  }

  const secretKey = process.env.PAGARME_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Chave secreta do Pagar.me não configurada na Vercel.' });
  }

  // Basic validation and extraction of phone numbers
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
        amount: Math.round(amount * 100), // Pagar.me works in cents
        description: 'Pedido Manda Brasa Delivery',
        quantity: 1,
        code: `ped_${Date.now()}`
      }
    ],
    customer: {
      name: customer.name || 'Cliente Manda Brasa',
      email: customer.email || 'cliente@mandabrasa.com',
      type: 'individual',
      document: '00000000000', // Dummy CPF for Pix generation
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
          expires_in: 3600 // Expira em 1 hora
        }
      }
    ]
  };

  try {
    // Encode the API key for Basic Auth
    const encodedKey = Buffer.from(`${secretKey}:`).toString('base64');

    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro Pagar.me:', data);
      return res.status(400).json({ error: 'Erro ao gerar PIX', details: data });
    }

    // Extract Pix data
    const pixData = data.charges[0].last_transaction.qr_code_url;
    const pixText = data.charges[0].last_transaction.qr_code;

    res.status(200).json({
      qr_code_url: pixData,
      qr_code: pixText,
      order_id: data.id
    });
  } catch (error) {
    console.error('Internal API error:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
