require('dotenv').config();
const axios = require('axios');

async function testPix() {
  const PAGARME_SECRET_KEY = process.env.PAGARME_API_KEY;
  if (!PAGARME_SECRET_KEY) {
    console.log("NO SECRET KEY");
    return;
  }
  const payload = {
    items: [
      {
        amount: 500,
        description: 'Pedido Manda Brasa Delivery',
        quantity: 1,
        code: `ped_${Date.now()}`
      }
    ],
    customer: {
      name: 'Cliente Manda Brasa',
      email: 'cliente@mandabrasa.com',
      type: 'individual',
      document: '00000000000',
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: '22',
          number: '999999999'
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

  const encodedKey = Buffer.from(`${PAGARME_SECRET_KEY}:`).toString('base64');
  try {
    const response = await axios.post('https://api.pagar.me/core/v5/orders', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${encodedKey}`
      }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
testPix();
