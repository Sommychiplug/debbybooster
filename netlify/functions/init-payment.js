const fetch = require("node-fetch")
const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event) => {
  try {
    const { user_id, amount, deposit_id, email } = JSON.parse(event.body)

    const response = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KORA_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        currency: "NGN",
        reference: deposit_id,
        redirect_url: "https://debbyboostersites.netlify.app/dashboard.html",
        customer: { email }
      })
    })

    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ checkout_url: data.data.checkout_url })
    }

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}