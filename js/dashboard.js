// Initialize Supabase
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
});

// Get current user
async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    window.location.href = '/index.html';
    return;
  }
  currentUser = user;
  loadOrders();
}

// Load user orders
async function loadOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  const list = document.getElementById('ordersList');
  list.innerHTML = '';
  orders.forEach(o => {
    const li = document.createElement('li');
    li.className = 'p-2 border rounded flex justify-between';
    li.innerHTML = `<span>${o.service} - ${o.quantity} - ${o.status}</span>`;
    list.appendChild(li);
  });
}

// Place order
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const service = document.getElementById('service').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  const { data, error } = await supabase.from('orders').insert([{
    user_id: currentUser.id,
    service,
    quantity,
    status: 'pending'
  }]);

  if (error) return alert(error.message);
  document.getElementById('orderForm').reset();
  loadOrders()
loadBalance();
});

// Run on page load
getUser();
async function loadBalance() {
  const { data, error } = await supabase
    .from('users')
    .select('balance')
    .eq('id', currentUser.id)
    .single()

  if (!error) {
    document.getElementById('balance').innerText = `$${data.balance}`
  }
}
document.getElementById('depositBtn').addEventListener('click', async () => {
  const amount = Number(document.getElementById('depositAmount').value)

  if (amount <= 0) {
    alert("Enter a valid amount")
    return
  }

  const { error } = await supabase.from('deposits').insert({
    user_id: currentUser.id,
    amount,
    status: 'pending'
  })

  if (error) {
    alert(error.message)
  } else {
    alert("Deposit request created. Complete payment to confirm.")
    document.getElementById('depositAmount').value = ''
  }
})