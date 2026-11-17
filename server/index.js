const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { db } = require('./db');

const PORT = process.env.PORT || 4322;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function generateAutonomousPipelineArtifacts({ title, platform, niche, targetAudience, tone, keyPoints }) {
  const isLong = platform.toLowerCase().includes('dài') || platform.toLowerCase().includes('youtube (8');
  const cleanTitle = title.trim();
  const cleanNiche = (niche || 'Kinh doanh & Sáng tạo nội dung').trim();
  const cleanAudience = (targetAudience || 'Người xem quan tâm thực chiến trong ngành').trim();
  const cleanTone = (tone || 'Chuyên gia thực chiến, súc tích, thuyết phục').trim();
  const extraNote = keyPoints ? `\n- **Luận điểm trọng tâm từ Chủ kênh:** ${keyPoints.trim()}` : '';

  const viralScore = Math.floor(89 + Math.random() * 9);
  const lowView = Math.floor(120 + Math.random() * 140);
  const highView = lowView * 2 + Math.floor(Math.random() * 150);
  const estViews = `${lowView}K - ${highView}K`;

  const strategyBrief = `## PHÊ DUYỆT CHIẾN LƯỢC — [DIR-01 Minh Quân] & [TRD-02 Hải Yến]

- **Định vị Chủ đề:** ${cleanTitle}
- **Ngách Nội dung (Content Pillar):** ${cleanNiche}
- **Tệp Khán giả Mục tiêu:** ${cleanAudience}
- **Giọng điệu & Nhịp độ (Tone of Voice):** ${cleanTone}${extraNote}

### 5 Phương án Câu Mở Đầu (Hook 3 Giây Đầu) — [HOK-03 Tuấn Kiệt]
1. **[Phá vỡ niềm tin cũ]:** "90% người làm trong ngành **${cleanNiche}** đang hiểu sai hoàn toàn về **${cleanTitle}** — và đây là cái giá phải trả."
2. **[Con số & Cảnh báo trực diện]:** "Đừng bắt tay vào làm **${cleanTitle}** nếu bạn chưa kiểm tra 3 nguyên tắc sống còn này!"
3. **[Bằng chứng thực chiến]:** "Đây là quy trình từng bước giúp mình giải quyết triệt để bài toán **${cleanTitle}** chỉ trong 15 phút mỗi ngày."
4. **[Tò mò & Bí mật ngành]:** "Thứ mà các chuyên gia lâu năm trong mảng **${cleanNiche}** không bao giờ tiết lộ công khai cho người mới."
5. **[So sánh Before / After]:** "Sự khác biệt giữa người thất bại và người dẫn đầu khi xử lý **${cleanTitle}** chỉ nằm ở đúng 1 bước này."`;

  const scriptContent = isLong
    ? `## KỊCH BẢN PHÂN CẢNH CHUYÊN SÂU (8 - 12 PHÚT) — [SCR-05 Hoàng Bách]

| Thời lượng | Bố cục Hình ảnh / B-Roll minh họa | Lời thoại Chi tiết (Storytelling & Chuyên gia) |
| :--- | :--- | :--- |
| **00:00 - 00:45** *(Hook & Open Loop)* | Cận cảnh kết quả thực tế + Chuyển cảnh nhanh các sai lầm phổ biến. | "Nếu bạn đang tìm cách làm chủ **${cleanTitle}**, hãy xem hết 45 giây đầu tiên này. Mình sẽ chỉ ra chính xác lý do vì sao cách làm truyền thống không còn hiệu quả, và hệ thống 3 bước giúp bạn đảo ngược tình thế." |
| **00:45 - 03:00** *(Giải phẫu Nỗi đau)* | Đồ họa phân tích nguyên nhân gốc rễ (Root Cause) trên màn hình. | "Hầu hết mọi người trong lĩnh vực **${cleanNiche}** thường lao vào làm phần ngọn mà bỏ qua cấu trúc nền tảng. Điều này dẫn tới lãng phí thời gian và ngân sách..." |
| **03:00 - 07:30** *(Khung Giải pháp 3 Bước)* | Quay trực tiếp quy trình thực hiện thực tế (Step-by-step Walkthrough). | "Để giải quyết triệt để, chúng ta áp dụng quy trình 3 tầng: Tầng 1 - Chuẩn hóa đầu vào; Tầng 2 - Tối ưu hóa điểm chạm quan trọng nhất; Tầng 3 - Đo lường và nhân bản kết quả..." |
| **07:30 - 09:30** *(Case Study Thực tế)* | Bảng số liệu đối chiếu trước và sau khi áp dụng. | "Hãy nhìn vào ví dụ thực tế này để thấy sự thay đổi rõ rệt khi bạn kiểm soát đúng biến số cốt lõi..." |
| **09:30 - 10:30** *(Tổng kết & CTA)* | Chủ kênh nhìn thẳng ống kính, hiển thị tài liệu tặng kèm trên màn hình. | "Mình đã tổng hợp toàn bộ biểu mẫu thực hành của bài **${cleanTitle}** ở phần mô tả và bình luận ghim. Hãy tải về áp dụng ngay và cho mình biết kết quả của bạn ở phần bình luận nhé!"`
    : `## KỊCH BẢN PHÂN CẢNH TỐC ĐỘ CAO (60 - 75 GIÂY) — [SCR-04 Bảo Ngọc]

| Thời lượng | Hình ảnh / Chuyển động Camera (Visual) | Lời thoại (Voiceover - Nhịp nhanh, dứt khoát) |
| :--- | :--- | :--- |
| **00:00 - 00:04** *(3s Hook)* | Cận cảnh trực diện + Hiệu ứng chữ nổi bật ngay giữa khung hình. | "Đừng tốn thêm bất kỳ khoản chi phí hay thời gian nào cho **${cleanTitle}** nếu bạn chưa nắm rõ 3 quy tắc thực chiến này!" |
| **00:04 - 00:16** *(Xoáy sâu vấn đề)* | Cảnh đối chiếu sai lầm thường gặp của tệp **${cleanAudience}**. Chuyển cảnh nhanh. | "Rất nhiều người trong mảng **${cleanNiche}** làm ngày làm đêm nhưng không ra kết quả, chỉ vì mắc phải cái bẫy làm theo cảm tính mà thiếu quy trình chuẩn." |
| **00:16 - 00:45** *(3 Bước Cốt lõi)* | Lần lượt hiện 3 thẻ đồ họa trực quan + B-Roll thao tác thực tế. | "Thứ nhất: Xác định đúng trọng tâm tạo ra 80% kết quả. Thứ hai: Loại bỏ ngay các bước rườm rà làm giảm tốc độ chuyển đổi. Và quan trọng nhất là thứ ba: Luôn có bảng kiểm tra (Checklist) trước khi xuất bản." |
| **00:45 - 00:58** *(Kết quả & Bằng chứng)* | Cận cảnh thành quả hoàn thiện sắc nét, chuyên nghiệp. | "Chỉ cần thay đổi đúng trình tự này, hiệu suất công việc và chất lượng đầu ra của bạn sẽ tăng gấp đôi ngay trong tuần đầu tiên." |
| **00:58 - 01:08** *(Kêu gọi hành động - CTA)* | Chỉ tay xuống khu vực bình luận + Hiện bảng hướng dẫn nhận tài liệu. | "Mình đã đóng gói sẵn bộ Checklist chi tiết cho **${cleanTitle}**. Bình luận ngay từ khóa **QUYTRINH** bên dưới để đội ngũ gửi tặng bạn hoàn toàn miễn phí nhé!"`;

  const visualStoryboard = `## CHỈ ĐẠO HÌNH ẢNH, THUMBNAIL & HẬU KỲ CAPCUT — [VIS-06 Khánh Linh] & [EDT-07 Đức Anh]

### 1. Thiết kế Thumbnail (Tối ưu tỷ lệ nhấp CTR > 10.5%)
- **Concept 1 (Tương phản Mạnh):** Nền tối độ tương phản cao, chủ thể chính bên phải biểu cảm quyết đoán, bên trái là sơ đồ/vật thể minh họa cho **${cleanTitle}** được khoanh đỏ kèm mũi tên.
- **Chữ trên Thumbnail (Giới hạn 3-4 từ):** \`ĐỪNG LÀM SAI!\` hoặc \`BÍ MẬT NGÀNH\` (Font chữ không chân dày, màu Vàng #F59E0B hoặc Xanh Neon #10B981).

### 2. Bảng Phân Cảnh Dựng Phim & Sound Design (CapCut / Premiere)
- **Nhịp cắt (Pacing):** Cắt bỏ hoàn toàn khoảng nghỉ lấy hơi (Jump-cut sát chữ). Cứ mỗi **3 - 4 giây** thay đổi tiêu cự (Zoom 100% -> 115%) hoặc chèn cảnh phụ (B-Roll).
- **Âm thanh Hiệu ứng (SFX):**
  - \`00:00\`: Tiếng **Boom Bass Drop** + **Whoosh** mở cảnh.
  - \`00:16, 00:26, 00:36\`: Tiếng **Pop / Digital Click** mỗi khi liệt kê luận điểm 1, 2, 3.
- **Phụ đề (Dynamic Captions):** Đặt ở vùng an toàn trung tâm dưới, highlight tự động từ khóa quan trọng theo giọng đọc.`;

  const seoPackage = `## GÓI TỐI ƯU THUẬT TOÁN, SEO & CHUYỂN ĐỔI — [SEO-08 Phương Thảo] & [BIZ-09 Gia Huy]

### 1. Bộ Tiêu đề Đa biến thể (A/B Testing Titles)
- **Tiêu đề chuẩn SEO Tìm kiếm:** Hướng dẫn ${cleanTitle} thực chiến từ A-Z cho người mới (${cleanNiche})
- **Tiêu đề kích thích Đề xuất (Viral):** 3 Sai lầm khiến bạn thất bại khi làm ${cleanTitle} (Và cách khắc phục ngay)

### 2. Mô tả & Bộ Từ khóa / Hashtags Phân tầng
> Video chia sẻ quy trình thực chiến về **${cleanTitle}** dành riêng cho **${cleanAudience}**.
> **Hashtags:** \`#${cleanNiche.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'xaykenh'}\` \`#kinhnghiemthucchien\` \`#phattrienbanthan\` \`#chiasekienthuc\` \`#xuhuong\`

### 3. Phễu Chuyển đổi & Bình luận Ghim (Pinned Comment Funnel)
- **Nội dung ghim đầu bình luận:** *"Cảm ơn các bạn đã xem hết video! Để nhận bộ tài liệu / bảng mẫu chi tiết về **${cleanTitle}**, bạn chỉ cần để lại bình luận **QUYTRINH** bên dưới, mình sẽ phản hồi kèm link tải ngay lập tức."*
- **Khung giờ vàng xuất bản:** 11:30 - 12:15 (Trưa) hoặc 19:45 - 20:30 (Tối).`;

  const growthReview = `## BIÊN BẢN NGHIỆM THU HỘI ĐỒNG AI — [VIRAL SCORE: ${viralScore}/100]
- **Đánh giá Hook 3 giây đầu:** Đạt chuẩn giữ chân khán giả mục tiêu (${cleanAudience}), đi thẳng vào vấn đề không vòng vo.
- **Cấu trúc Nội dung:** Bố cục rõ ràng, dễ quay dựng ngay bằng điện thoại hoặc máy ảnh kết hợp CapCut.
- **Dự báo Lượng tiếp cận tiềm năng:** **${estViews} lượt xem** nếu duy trì tỷ lệ xem hết (Completion Rate) > 38%.`;

  const discussionLogs = [
    {
      agent_id: 'agt-director',
      agent_name: 'Minh Quân',
      agent_role: 'Giám đốc Chiến lược Kênh',
      dept_code: 'STRAT',
      artifact_type: 'DIRECTIVE',
      content: `Đã tiếp nhận đề bài "${cleanTitle}". Định hướng chiến dịch tập trung vào ngách [${cleanNiche}] với giọng điệu [${cleanTone}]. Yêu cầu các phòng ban triển khai dây chuyền sản xuất.`
    },
    {
      agent_id: 'agt-hook',
      agent_name: 'Tuấn Kiệt',
      agent_role: 'Kỹ sư Tâm lý Học Giữ chân',
      dept_code: 'R&D',
      artifact_type: 'HOOK_LAB',
      content: `Đã thiết kế 5 phương án câu mở đầu (Hook 3s) đánh trực diện vào tâm lý của tệp [${cleanAudience}]. Chuyển giao cho phòng Biên kịch.`
    },
    {
      agent_id: 'agt-short-writer',
      agent_name: isLong ? 'Hoàng Bách' : 'Bảo Ngọc',
      agent_role: isLong ? 'Biên kịch YouTube Dài' : 'Biên kịch Video Ngắn',
      dept_code: 'SCRIPT',
      artifact_type: 'SCRIPT',
      content: `Đã hoàn thành kịch bản phân cảnh 2 cột (Hình ảnh & Lời thoại) cho nền tảng [${platform}]. Đã tối ưu nhịp độ chữ và gài cắm nút thắt giữ chân người xem.`
    },
    {
      agent_id: 'agt-editor',
      agent_name: 'Đức Anh',
      agent_role: 'Đạo diễn Hậu kỳ & Nhịp dựng',
      dept_code: 'STUDIO',
      artifact_type: 'STORYBOARD',
      content: `Đã lên phương án thiết kế Thumbnail tương phản cao và chỉ dẫn dựng phim CapCut (mốc chèn B-Roll, hiệu ứng âm thanh SFX, quy chuẩn phụ đề).`
    },
    {
      agent_id: 'agt-seo',
      agent_name: 'Phương Thảo',
      agent_role: 'Chuyên gia Thuật toán & SEO',
      dept_code: 'GROWTH',
      artifact_type: 'SEO_PACK',
      content: `Đã đóng gói bộ tiêu đề A/B Testing, bộ Hashtag phân tầng và kịch bản ghim bình luận chuyển đổi khách hàng. Điểm thẩm định chiến dịch: ${viralScore}/100.`
    }
  ];

  return {
    viralScore,
    estViews,
    strategyBrief,
    scriptContent,
    visualStoryboard,
    seoPackage,
    growthReview,
    discussionLogs
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  try {
    // API: Get full company overview (departments, agents, campaigns, stats)
    if (pathname === '/api/company' && req.method === 'GET') {
      const departments = db.prepare('SELECT * FROM departments').all();
      const agents = db.prepare('SELECT * FROM agents').all();
      const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY updated_at DESC').all();
      const messages = db.prepare('SELECT * FROM agent_messages ORDER BY created_at DESC LIMIT 60').all();

      return sendJson(res, 200, {
        departments,
        agents,
        campaigns,
        messages
      });
    }

    // API: Run autonomous multi-department content production pipeline
    if (pathname === '/api/campaigns/generate' && req.method === 'POST') {
      const body = await parseBody(req);
      const id = `cmp-${crypto.randomUUID().slice(0, 8)}`;
      const title = (body.title || 'Chiến dịch Nội dung Mới').trim();
      const platform = body.platform || 'TikTok / Reels / Shorts (60s)';
      const niche = body.niche || 'Công nghệ & Kinh doanh';
      const targetAudience = body.targetAudience || 'Khán giả trẻ 22-35 tuổi quan tâm phát triển sự nghiệp';
      const tone = body.tone || 'Thực chiến, tốc độ cao, thuyết phục';
      const keyPoints = body.keyPoints || '';

      const generated = generateAutonomousPipelineArtifacts({
        title,
        platform,
        niche,
        targetAudience,
        tone,
        keyPoints
      });

      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO campaigns (
          id, title, platform, niche, target_audience, tone, stage, viral_score, est_views,
          strategy_brief, script_content, visual_storyboard, seo_package, growth_review, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'READY', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        title,
        platform,
        niche,
        targetAudience,
        tone,
        generated.viralScore,
        generated.estViews,
        generated.strategyBrief,
        generated.scriptContent,
        generated.visualStoryboard,
        generated.seoPackage,
        generated.growthReview,
        now,
        now
      );

      const insertMsg = db.prepare(`
        INSERT INTO agent_messages (id, campaign_id, agent_id, agent_name, agent_role, dept_code, content, artifact_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const log of generated.discussionLogs) {
        insertMsg.run(
          `msg-${crypto.randomUUID().slice(0, 8)}`,
          id,
          log.agent_id,
          log.agent_name,
          log.agent_role,
          log.dept_code,
          log.content,
          log.artifact_type,
          new Date().toISOString()
        );
      }

      // Increment tasks_completed for all agents
      db.prepare('UPDATE agents SET tasks_completed = tasks_completed + 1').run();

      const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(id);
      const campaignMessages = db.prepare('SELECT * FROM agent_messages WHERE campaign_id = ? ORDER BY created_at ASC').all(id);

      return sendJson(res, 201, { campaign, messages: campaignMessages });
    }

    // API: Consult a specific AI Agent directly (1-on-1 War Room consultation)
    if (pathname === '/api/agents/consult' && req.method === 'POST') {
      const body = await parseBody(req);
      const { agentId, campaignId, question } = body;
      const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
      const campaign = campaignId ? db.prepare('SELECT * FROM campaigns WHERE id = ?').get(campaignId) : null;

      if (!agent) return sendJson(res, 404, { error: 'Agent not found' });

      const topic = campaign ? campaign.title : 'kênh của bạn';
      let replyText = '';

      if (agent.code.startsWith('DIR')) {
        replyText = `[Định hướng Chiến lược từ ${agent.name}]: Với câu hỏi "${question}" cho chiến dịch "${topic}", bạn cần tập trung vào điểm khác biệt lớn nhất của mình (Unique Selling Point). Đừng cố chiều lòng tất cả người xem — hãy nói thẳng vào nỗi đau lớn nhất của nhóm khách hàng sẵn sàng chi trả.`;
      } else if (agent.code.startsWith('TRD') || agent.code.startsWith('HOK')) {
        replyText = `[Đề xuất Tối ưu Hook từ ${agent.name}]: Đối với yêu cầu "${question}", hãy mở đầu video bằng một hành động trực quan ngay giây thứ nhất kèm câu hỏi phủ định: "Tại sao 90% người làm đều thất bại ở bước này?". Tuyệt đối không chào hỏi dài dòng trong 3 giây đầu.`;
      } else if (agent.code.startsWith('SCR')) {
        replyText = `[Chỉnh sửa Kịch bản từ ${agent.name}]: Mình đã ghi nhận yêu cầu "${question}". Khi đọc thoại, bạn hãy rút gọn các câu phức xuống dưới 14 từ/câu, đặt từ khóa đắt giá nhất ở cuối câu để tạo nhịp nhấn và giữ người xem nghe tiếp câu sau.`;
      } else if (agent.code.startsWith('VIS') || agent.code.startsWith('EDT')) {
        replyText = `[Chỉ đạo Hậu kỳ & Hình ảnh từ ${agent.name}]: Về vấn đề "${question}", khi dựng trên CapCut bạn hãy cắt sát toàn bộ khoảng nghỉ giữa các câu, thêm hiệu ứng Zoom nhẹ 108% vào các câu kết luận và dùng phụ đề nổi bật tối đa 4 chữ mỗi dòng.`;
      } else {
        replyText = `[Chiến lược Tăng trưởng & SEO từ ${agent.name}]: Về "${question}", sau khi đăng video bạn hãy tự viết ngay 1 bình luận ghim đặt câu hỏi tranh luận hoặc tặng tài liệu miễn phí để kích hoạt chỉ số bình luận (Comment Velocity) trong 30 phút đầu tiên.`;
      }

      const msgId = `msg-${crypto.randomUUID().slice(0, 8)}`;
      const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(agent.dept_id);
      const now = new Date().toISOString();

      if (campaign) {
        db.prepare(`
          INSERT INTO agent_messages (id, campaign_id, agent_id, agent_name, agent_role, dept_code, content, artifact_type, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'CONSULT', ?)
        `).run(msgId, campaign.id, agent.id, agent.name, agent.role, dept ? dept.code : 'AI', replyText, now);
      }

      db.prepare('UPDATE agents SET tasks_completed = tasks_completed + 1 WHERE id = ?').run(agent.id);

      return sendJson(res, 200, {
        reply: {
          id: msgId,
          agentName: agent.name,
          agentRole: agent.role,
          deptCode: dept ? dept.code : 'AI',
          content: replyText,
          createdAt: now
        }
      });
    }

    // API: Update campaign stage or content
    const cmpMatch = pathname.match(/^\/api\/campaigns\/([^/]+)$/);
    if (cmpMatch) {
      const cmpId = decodeURIComponent(cmpMatch[1]);
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const existing = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(cmpId);
        if (!existing) return sendJson(res, 404, { error: 'Campaign not found' });
        const body = await parseBody(req);

        const stage = body.stage !== undefined ? body.stage : existing.stage;
        const scriptContent = body.script_content !== undefined ? body.script_content : existing.script_content;
        const strategyBrief = body.strategy_brief !== undefined ? body.strategy_brief : existing.strategy_brief;
        const visualStoryboard = body.visual_storyboard !== undefined ? body.visual_storyboard : existing.visual_storyboard;
        const seoPackage = body.seo_package !== undefined ? body.seo_package : existing.seo_package;
        const now = new Date().toISOString();

        db.prepare(`
          UPDATE campaigns
          SET stage = ?, script_content = ?, strategy_brief = ?, visual_storyboard = ?, seo_package = ?, updated_at = ?
          WHERE id = ?
        `).run(stage, scriptContent, strategyBrief, visualStoryboard, seoPackage, now, cmpId);

        const updated = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(cmpId);
        return sendJson(res, 200, { campaign: updated });
      }

      if (req.method === 'DELETE') {
        db.prepare('DELETE FROM agent_messages WHERE campaign_id = ?').run(cmpId);
        db.prepare('DELETE FROM campaigns WHERE id = ?').run(cmpId);
        return sendJson(res, 200, { deleted: true });
      }
    }

    // Static files serving
    let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(path.join(PUBLIC_DIR, 'index.html')).pipe(res);
    }
  } catch (err) {
    console.error('[ChannelCorp Error]:', err);
    sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`[CHANNELCORP OS] Autonomous Media Agency Server Ready`);
  console.log(`Local URL : http://localhost:${PORT}`);
  console.log(`Database  : data/channelcorp.sqlite (WAL Mode)`);
  console.log(`======================================================\n`);
});
