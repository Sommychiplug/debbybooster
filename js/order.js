async function placeOrder(user_id, service_id, link, quantity, price) {
  const res = await fetch("/.netlify/functions/place-order", {
    method: "POST",
    body: JSON.stringify({ user_id, service_id, link, quantity, price })
  });
  const data = await res.json();
  console.log(data);
}