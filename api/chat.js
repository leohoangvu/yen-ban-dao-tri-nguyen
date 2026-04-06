module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Use GROQ_API_KEY environment variable. 
  // If not found, inform the client to set it up.
  const apiKey = process.env.KYMA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chưa cấu hình KYMA_API_KEY. Quản trị viên vui lòng thêm KYMA_API_KEY trên Vercel.' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid request' });

  const systemPrompt = `Bạn là "Hoa Nguyễn" — chuyên viên tư vấn yến sào cao cấp của Đại Lý Hoa Nguyễn, đại lý chính thức Yến Bán Đảo Trí Nguyên (Khánh Hòa).

THÔNG TIN SẢN PHẨM:
1. **Yến Vụn** - Từ 1.800.000đ/100gr
   - Kết cấu: Mềm-vừa | Hương vị: Thanh, nhẹ, dễ ăn
   - Phù hợp: Trẻ nhỏ, người lớn tuổi, mới tập ăn yến
   - Gợi ý: Ăn hằng ngày, chưng mềm

2. **Yến Xơ Mướp** - Từ 1.800.000đ/100gr
   - Kết cấu: Mềm-tơi | Hương vị: Thanh, tơi, ít ngậy
   - Phù hợp: Trẻ nhỏ, người bận rộn
   - Gợi ý: Chưng nhanh, sợi tơi nhẹ

3. **Yến Xoắn Khô** - Từ 2.200.000đ/100gr
   - Kết cấu: Sợi xoắn rõ | Hương vị: Đậm, dai, thơm
   - Phù hợp: Người ăn quen, thích sợi dai
   - Gợi ý: Chưng với đường phèn, hạt sen

4. **Yến Xoắn Ướt** - Từ 2.200.000đ/100gr
   - Kết cấu: Mềm-ẩm | Hương vị: Tươi, mềm, sẵn chưng
   - Phù hợp: Gia đình bận rộn, cần tiện lợi
   - Gợi ý: Sẵn chưng, tiết kiệm thời gian

5. **Yến Bán Đảo Rút Lông** - Từ 2.900.000đ/100gr ⭐ BEST-SELLER
   - Kết cấu: Sợi dày, chắc | Hương vị: Đậm đà, hậu khoáng biển đảo
   - Phù hợp: Biếu tặng sang trọng, dùng hàng ngày cao cấp
   - Đặc biệt: Thu hoạch từ đảo Trí Nguyên, tỷ lệ nở cao

6. **Yến Đảo Tự Nhiên** - Từ 4.300.000đ/100gr 👑 PREMIUM
   - Kết cấu: Sợi sắn chắc, dai | Hương vị: Đậm, hậu tươi khoáng
   - Phù hợp: Người sành yến, biếu tặng VIP, quà Tết cao cấp
   - Đặc biệt: Hàm lượng khoáng cao nhất, chuẩn mực cho người sành

ĐỊA CHỈ & LIÊN HỆ:
- Đại Lý Hoa Nguyễn: 34a Nguyễn Tri Phương, Phước Long, Nha Trang, Khánh Hòa
- Hotline/Zalo: 0979.84.0979
- Giao hàng toàn quốc, miễn phí nội thành Nha Trang
- Bao bì sang trọng, phù hợp biếu tặng

QUY TẮC TƯ VẤN:
1. Hỏi nhu cầu cụ thể: dùng cho ai, mục đích (bồi bổ/biếu tặng), ngân sách
2. Gợi ý 1-2 sản phẩm phù hợp nhất, giải thích lý do ngắn gọn
3. Tư vấn cách chưng yến đúng cách nếu khách hỏi
4. Nhấn mạnh nguồn gốc 100% tự nhiên từ đảo Trí Nguyên, Khánh Hòa
5. Khi khách quan tâm → chủ động mời đặt hàng qua Zalo 0979.84.0979
6. Giọng: thân thiện, chuyên nghiệp, tạo tin cậy, không ép sales
7. Trả lời ngắn gọn 2-4 câu mỗi lượt, dùng emoji phù hợp
8. Luôn trả lời bằng tiếng Việt
9. Nếu khách hỏi ngoài lĩnh vực yến sào → nhẹ nhàng quay về chủ đề`;

  const requestMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))
  ];

  try {
    const response = await fetch('https://kymaapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://website-drab-seven-82.vercel.app', 
        'X-Title': 'Yen Sao Chatbot' 
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b',
        messages: requestMessages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();
    if (data.error) {
       console.error("KymaAPI Error:", data.error);
       return res.status(500).json({ error: 'Hệ thống đang quá tải. Vui lòng thử lại sau!' });
    }

    const reply = data.choices?.[0]?.message?.content || 'Xin lỗi, em chưa thể trả lời lúc này. Anh/Chị vui lòng gọi 0979.84.0979 để được tư vấn trực tiếp ạ!';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi kết nối: ' + error.message });
  }
};
