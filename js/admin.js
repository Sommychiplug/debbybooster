const SUPABASE_URL = "https://ovmwnruxlmwuvxbzkgsd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXducnV4bG13dXZ4YnprZ3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODc0MzgsImV4cCI6MjA4NzI2MzQzOH0.t_E8w409ay6C8D1dhZU7t14H339FcZkoRqFh11NG5Bk";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
});

// Get current user & check admin
async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    window.location.href = '/index.html';
    return;
  }
  currentUser = user;

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile.role !== 'admin') {
    alert('Access denied');
    window.location.href = '/dashboard.html';
    return;
  }

  loadOrders();
}

// Load all orders (admin)
async function loadOrders() {
  const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  const list = document.getElementById('ordersList');
  list.innerHTML = '';
  orders.forEach(o => {
    const li = document.createElement('li');
    li.className = 'p-2 border rounded flex justify-between items-center';
    li.innerHTML = `<span>${o.service} - ${o.quantity} - ${o.status}</span>
      <button onclick="updateStatus('${o.id}')" class="bg-blue-500 text-white px-2 py-1 rounded">Mark Complete</button>`;
    list.appendChild(li);
  });
}

// Update order status
async function updateStatus(orderId) {
  await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
  loadOrders();
}

getUser();