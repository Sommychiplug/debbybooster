// Initialize Supabase client (use service role key in Netlify function ideally)
const SUPABASE_URL = "https://sjyctlwlbriisblcksfd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqeWN0bHdsYnJpaXNibGNrc2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTY5MDksImV4cCI6MjA4NzM3MjkwOX0.pA9q6gW7cljyJECnAT11ZnwKCZ7owINc8MTlOnHyWKA"; // optional if only admin function
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadOrders() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = "";

  orders.forEach(order => {
    const tr = document.createElement("tr");
    tr.classList.add("border-b");

    tr.innerHTML = `
      <td class="p-2">${order.user_id}</td>
      <td class="p-2">${order.service_id}</td>
      <td class="p-2">${order.link}</td>
      <td class="p-2">${order.quantity}</td>
      <td class="p-2">${order.price}</td>
      <td class="p-2">${order.status}</td>
      <td class="p-2">${new Date(order.created_at).toLocaleString()}</td>
    `;

    tbody.appendChild(tr);
  });
}

loadOrders();
async function loadOrders() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = "";

  orders.forEach(order => {
    const tr = document.createElement("tr");
    tr.classList.add("border-b", "hover:bg-blue-50");

    tr.innerHTML = `
      <td class="p-2">${order.user_id}</td>
      <td class="p-2">${order.service_id}</td>
      <td class="p-2">${order.link}</td>
      <td class="p-2">${order.quantity}</td>
      <td class="p-2">${order.price}</td>
      <td class="p-2">
        <span id="status-${order.id}" class="font-semibold">${order.status}</span>
      </td>
      <td class="p-2">${new Date(order.created_at).toLocaleString()}</td>
      <td class="p-2">
        <button onclick="updateStatus('${order.id}', 'completed')" class="bg-green-500 text-white px-2 py-1 rounded mr-1">Complete</button>
        <button onclick="updateStatus('${order.id}', 'canceled')" class="bg-red-500 text-white px-2 py-1 rounded">Cancel</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Function to update status via Netlify Function
async function updateStatus(order_id, status) {
  try {
    const res = await fetch("/.netlify/functions/update-order-status", {
      method: "POST",
      body: JSON.stringify({ order_id, status })
    });

    const data = await res.json();
    if (res.ok) {
      // Update status in the table without reloading
      document.getElementById(`status-${order_id}`).innerText = status;
      alert("Order updated!");
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Request failed: " + err.message);
  }
}

// Load orders when page opens
loadOrders();