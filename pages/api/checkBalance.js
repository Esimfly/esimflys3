export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, errorMsg: 'Method Not Allowed' });
  }

  const ACCESS_CODE = 'c1b7f81b90f04f2c95312ab29a34cb1f';

  try {
    const response = await fetch('https://api.esimaccess.com/api/v1/open/balance/query', {
      method: 'POST',
      headers: {
        'RT-AccessCode': ACCESS_CODE,
        'Content-Type': 'application/json',
      },
      body: '', // طلب POST بدون بيانات body حسب الوثائق
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Balance API error:', response.status, text);
      return res.status(500).json({ success: false, errorMsg: 'External API error.' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, balance: data });
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ success: false, errorMsg: 'Server error.' });
  }
}
