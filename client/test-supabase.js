import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrsfgjvlmqdtuxqdejpd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc2ZnanZsbXFkdHV4cWRlanBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5ODUxOCwiZXhwIjoyMTAyNDc0NTE4fQ.yZXWoFqQYgBmLdH1KSHPrOUrsIrpyTGEc3E2dgOtfqM'; // SERVICE ROLE KEY
const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  { name: 'Frango Assado', price: 50.00, category: 'Carnes', image_url: '/menu/frango-assado-real.jpg', description: 'O famoso frango na brasa, suculento e crocante.' },
  { name: 'Costela no Bafo (1 kg)', price: 70.00, category: 'Carnes', image_url: '/menu/img4.png', description: 'Costela assada lentamente, desmanchando na boca.' },
  { name: 'Coxa com Sobrecoxa (un)', price: 8.00, category: 'Carnes', image_url: '/menu/img3.png', description: 'Cortes selecionados e tempero especial.' },
  { name: 'Linguiça na Brasa (un)', price: 4.00, category: 'Carnes', image_url: '/menu/linguica-real.jpg', description: 'Tradicional linguiça toscana assada na brasa.' },
  { name: 'Torresminho', price: 15.00, category: 'Acompanhamentos', image_url: '/menu/torresminho-real.jpg', description: 'Porção de torresmo frito, super crocante.' },
  { name: 'Salpicão', price: 25.00, category: 'Acompanhamentos', image_url: '/menu/img5.png', description: 'Salpicão cremoso de frango com batata palha.' },
  { name: 'Feijão Tropeiro', price: 25.00, category: 'Acompanhamentos', image_url: '/menu/img2.png', description: 'Clássico feijão tropeiro com farofa, bacon e ovos.' },
  { name: 'Maionese', price: 25.00, category: 'Acompanhamentos', image_url: '/menu/maionese-real.jpg', description: 'Maionese caseira de batata com cenoura.' },
  { name: 'Batata frita', price: 20.00, category: 'Acompanhamentos', image_url: '/menu/batata-real.jpg', description: 'Porção generosa de batata frita bem sequinha.' },
  { name: 'Vinagrete', price: 10.00, category: 'Acompanhamentos', image_url: '/menu/vinagrete-real.png', description: 'Vinagrete fresquinho com tomate, cebola e pimentão.' },
  { name: 'Arroz', price: 10.00, category: 'Acompanhamentos', image_url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800&q=80', description: 'Arroz branco soltinho, feito na hora.' }
];

async function run() {
  console.log('Deletando produtos antigos...');
  const { error: delErr } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.error('Erro ao deletar:', delErr);
    return;
  }
  
  console.log('Inserindo cardapio oficial...');
  const { error: insErr } = await supabase.from('products').insert(products);
  if (insErr) {
    console.error('Erro ao inserir:', insErr);
  } else {
    console.log('SUCESSO TOTAL!');
  }
}

run();
