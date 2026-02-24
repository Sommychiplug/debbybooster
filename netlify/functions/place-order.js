const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SMM_API_URL = process.env.SMM_API_URL; // https://justanotherpanel.com/api/v2
const SMM_API_KEY = process.env.SMM_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async function(event, context) {
  try {
    const data = JSON.parse(event.body);
    const { user_id, service_id, link, quantity, price } = data;

    // 1️⃣ Create order in JAP
    const response = await fetch(`${SMM_API_URL}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": SMM_API_KEY
      },
      body: JSON.stringify({
        service: service_id,
        link: link,
        quantity: quantity
      })
    });

    const result = await response.json();

    if (result.error) {
      return { statusCode: 400, body: JSON.stringify(result) };
    }

    // 2️⃣ Save order in Supabase
    const { error } = await supabase
      .from("orders")
      .insert([{
        user_id,
        service_id,
        link,
        quantity,
        price,
        status: "processing"
      }]);

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ message: "Order placed", jap_order_id: result.order }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
// 1️⃣ Get user who placed order
const { data: buyer } = await supabase
  .from("users")
  .select("id, referred_by")
  .eq("id", user_id)
  .single();

// 2️⃣ Check if this is user's FIRST order
const { count } = await supabase
  .from("orders")
  .select("*", { count: "exact", head: true })
  .eq("user_id", user_id);

// 3️⃣ Pay referral bonus ONLY ON FIRST ORDER
if (count === 1 && buyer.referred_by) {

  // Check if already paid
  const { data: paidCheck } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", user_id)
    .eq("referral_paid", true)
    .limit(1);

  if (!paidCheck || paidCheck.length === 0) {

    // Add ₦100 to referrer
    await supabase.rpc("increment_referral", {
      uid: buyer.referred_by,
      amount: 1
    });

    // Mark referral as paid
    await supabase
      .from("orders")
      .update({ referral_paid: true })
      .eq("user_id", user_id);
  }
}