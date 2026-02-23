const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ovmwnruxlmwuvxbzkgsd.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXducnV4bG13dXZ4YnprZ3NkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY4NzQzOCwiZXhwIjoyMDg3MjYzNDM4fQ.z_BsMxcH8pglpkf_z_RsNjSiP2uh-PU3-6UjVO7vLb8";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

exports.handler = async (event, context) => {
  const { user_id, service, quantity } = JSON.parse(event.body);

  const { data, error } = await supabase.from('orders').insert([{ user_id, service, quantity, status: 'pending' }]);

  if (error) return { statusCode: 400, body: JSON.stringify(error) };

  return { statusCode: 200, body: JSON.stringify(data) };
};