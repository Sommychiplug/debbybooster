export const handler = async (event) => {
  try {
    const { amount, email, user_id } = JSON.parse(event.body);

    const res = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KORAPAY_SECRET_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        currency: "NGN",
        reference: `DEP_${Date.now()}`,
        customer: {
          email: email
        },
        redirect_url: "https://debbyboostersites.netlify.app/dashboard.html",
        metadata: {
          user_id: user_id
        }
      })
    });

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Payment init failed" })
    };
  }
};