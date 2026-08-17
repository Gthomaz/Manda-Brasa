import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
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

  const supabaseUrl = process.env.SUPABASE_URL || 'https://yrsfgjvlmqdtuxqdejpd.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc2ZnanZsbXFkdHV4cWRlanBkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5ODUxOCwiZXhwIjoyMTAyNDc0NTE4fQ.yZXWoFqQYgBmLdH1KSHPrOUrsIrpyTGEc3E2dgOtfqM';

  if (!supabaseKey) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { method, query, body } = req;
  const { action, id } = query;

  try {
    if (method === 'GET') {
      const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
      if (profilesError) throw profilesError;

      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const users = authData.users.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id) || {};
        return {
          ...profile,
          id: authUser.id,
          email: authUser.email,
          banned: !!authUser.banned_until,
          created_at: profile.created_at || authUser.created_at
        };
      });

      users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.status(200).json(users);

    } else if (method === 'POST') {
      if (action === 'ban' && id) {
        const isBan = body.ban === true;
        const banDuration = isBan ? '876000h' : 'none';
        const { error } = await supabase.auth.admin.updateUserById(id, { ban_duration: banDuration });
        if (error) throw error;
        return res.status(200).json({ message: isBan ? 'User banned' : 'User unbanned' });
      }

      const { email, password, full_name, phone, address_street, address_neighborhood, address_city, address_cep } = body;
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name }
      });
      if (authError) throw authError;

      const newUserId = authData.user.id;
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: newUserId, full_name, phone, address_street, address_neighborhood, address_city, address_cep, fidelity_points: 0
      });
      if (profileError) {
        await supabase.auth.admin.deleteUser(newUserId);
        throw profileError;
      }
      return res.status(200).json({ message: 'User created successfully', id: newUserId });

    } else if (method === 'PUT') {
      if (!id) throw new Error('Missing user ID');
      const { email, full_name, phone, address_street, address_neighborhood, address_city, address_cep } = body;
      
      if (email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(id, { email });
        if (authError) throw authError;
      }

      const { error: profileError } = await supabase.from('profiles').update({
        full_name, phone, address_street, address_neighborhood, address_city, address_cep
      }).eq('id', id);
      if (profileError) throw profileError;

      return res.status(200).json({ message: 'User updated' });

    } else if (method === 'DELETE') {
      if (!id) throw new Error('Missing user ID');
      await supabase.from('profiles').delete().eq('id', id);
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) throw authError;
      return res.status(200).json({ message: 'User deleted' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(400).json({ error: error.message });
  }
}
