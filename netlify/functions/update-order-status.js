const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async function(event, context) {
  try {
    const data = JSON.parse(event.body);
    const { order_id, status } = data;

    // Validate status
    if (!["pending", "processing", "completed", "canceled"].includes(status)) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid status" }) };
    }

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date() })
      .eq("id", order_id);

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ message: "Order updated" }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};