module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const { paymentId, txid } = req.body;
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) return res.status(500).json({ error: 'Server API Key not configured' });

    try {
        // 🛡️ 防刷单：先向 Pi 官方服务器核实这笔支付的状态
        const checkResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}`, {
            headers: { 'Authorization': `Key ${PI_API_KEY}` }
        });
        const paymentData = await checkResponse.json();

        // 如果官方显示未批准或交易哈希不匹配，直接拦截！
        if (paymentData.status.developer_approved !== true || paymentData.transaction.txid !== txid) {
            return res.status(400).json({ error: 'Fraudulent payment detected' });
        }

        // 校验通过，向 Pi 官方提交完成确认
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${PI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txid })
        });

        if (!response.ok) throw new Error('Failed to complete payment');
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
