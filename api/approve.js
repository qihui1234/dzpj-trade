// api/approve.js
module.exports = async (req, res) => {
    // 1. 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. 获取前端传来的 paymentId
    const { paymentId } = req.body;
    // 3. 从 Vercel 环境变量中读取你的 Server API Key
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) {
        return res.status(500).json({ error: 'Server API Key not configured' });
    }

    try {
        // 4. 向 Pi 官方服务器发起批准请求
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${PI_API_KEY}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to approve payment');
        }

        const data = await response.json();
        // 5. 返回成功
        return res.status(200).json(data);
    } catch (error) {
        console.error('Approval error:', error);
        return res.status(500).json({ error: error.message });
    }
};
