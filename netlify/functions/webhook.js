const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event) => {
  const payload = JSON.parse(event.body)

  if (payload.event !== "charge.success") {
    return { statusCode: 200 }
  }

  const deposit_id = payload.data.reference
  const amount = payload.data.amount

  // Update deposit
  await supabase
    .from("deposits")
    .update({ status: "completed" })
    .eq("id", deposit_id)

  // Get user
  const { data: deposit } = await supabase
    .from("deposits")
    .select("user_id")
    .eq("id", deposit_id)
    .single()

  // Credit balance
  await supabase.rpc("increment_balance", {
    uid: deposit.user_id,
    amt: amount
  })

  return { statusCode: 200 }
}