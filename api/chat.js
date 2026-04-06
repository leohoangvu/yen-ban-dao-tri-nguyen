module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

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
9. Nếu khách hỏi ngoài lĩnh vực yến sào → nhẹ nhàng quay về chủ đề

CỰC KỲ QUAN TRỌNG: CHỈ trả lời nội dung chat trực tiếp cho khách hàng. TUYỆT ĐỐI KHÔNG được viết suy nghĩ, phân tích, checklist, draft, reasoning, hoặc bất kỳ ghi chú nội bộ nào. Chỉ output câu trả lời cuối cùng bằng tiếng Việt.`;

  // Gemma models don't support systemInstruction, so prepend as first turn
  const contents = [
    { role: 'user', parts: [{ text: systemPrompt + '\n\nHãy bắt đầu vai trò tư vấn viên.' }] },
    { role: 'model', parts: [{ text: 'Vâng, em đã sẵn sàng tư vấn với vai trò Hoa Nguyễn — chuyên viên tư vấn yến sào Đại Lý Hoa Nguyễn. Anh/Chị cần em hỗ trợ gì ạ?' }] },
    ...messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
        })
      }
    );

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, em chưa thể trả lời lúc này. Anh/Chị vui lòng gọi 0979.84.0979 để được tư vấn trực tiếp ạ!';
    
    // Strip Gemma 4 chain-of-thought artifacts aggressively
    // 1. Remove <think>...</think> blocks
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // 2. Split into lines and filter aggressively
    const lines = reply.split('\n');
    const cleanLines = [];
    let foundVietnamese = false;
    
    for (const line of lines) {
      const l = line.trim();
      if (!l) { if (foundVietnamese) cleanLines.push(''); continue; }
      
      // Skip lines starting with * (reasoning bullets)
      if (l.startsWith('*')) continue;
      // Skip lines that are English-dominant (more ASCII than Vietnamese chars)
      const vietChars = (l.match(/[\u00C0-\u024F\u1E00-\u1EFF\u0300-\u036F]/g) || []).length;
      const enWords = (l.match(/\b(user|ask|check|done|draft|rule|constraint|persona|knowledge|response|thinking|plan|suggest|budget|target|analysis|need|want|goal|acknowledge|consultant|premium|bird|nest|type|price|texture|refin|ready|okay|hmm)\b/gi) || []).length;
      if (enWords >= 2 && vietChars < 3) continue;
      // Skip numbered analysis lines (1. User asks, 2. Persona, etc)
      if (/^\d+\.\s*[A-Z]/.test(l) && vietChars < 2) continue;
      // Skip "- Analysis:" style lines
      if (/^-\s*[A-Z]/.test(l) && enWords >= 1 && vietChars < 2) continue;
      
      foundVietnamese = true;
      cleanLines.push(line);
    }
    
    reply = cleanLines.join('\n').trim();
    // Remove surrounding quotes
    reply = reply.replace(/^["']|["']$/g, '').trim();
    
    if (!reply) reply = 'Anh/Chị vui lòng liên hệ Zalo 0979.84.0979 để được tư vấn trực tiếp ạ!';
    
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi kết nối. Vui lòng thử lại sau!' });
  }
};
