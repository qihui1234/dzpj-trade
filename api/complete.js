// api/complete.js
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { paymentId, txid } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) {
        return res.status(500).json({ error: 'Server API Key not configured' });
    }

    try {
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${PI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txid })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to complete payment');
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Completion error:', error);
        return res.status(500).json({ error: error.message });
    }
};
