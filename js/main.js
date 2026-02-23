// Initialize Supabase
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Login form
const loginForm = document.getElementById('login-form');
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);

  // Redirect based on role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (userProfile.role === 'admin') {
    window.location.href = '/admin.html';
  } else {
    window.location.href = '/dashboard.html';
  }
});

// Signup link
document.getElementById('signup-link')?.addEventListener('click', async () => {
  const email = prompt('Enter email:');
  const password = prompt('Enter password:');
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return alert(error.message);

  // Insert user into profile table
  await supabase.from('users').insert([{ id: data.user.id, email, role: 'user' }]);
  alert('Account created! Please login.');
});