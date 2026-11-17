const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'channelcorp.sqlite');
const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    mission TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    dept_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    specialty TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    status TEXT DEFAULT 'ONLINE',
    tasks_completed INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    niche TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    tone TEXT NOT NULL,
    stage TEXT DEFAULT 'SCRIPTING',
    viral_score INTEGER DEFAULT 88,
    est_views TEXT DEFAULT '150K - 320K',
    strategy_brief TEXT DEFAULT '',
    script_content TEXT DEFAULT '',
    visual_storyboard TEXT DEFAULT '',
    seo_package TEXT DEFAULT '',
    growth_review TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agent_messages (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    agent_role TEXT NOT NULL,
    dept_code TEXT NOT NULL,
    content TEXT NOT NULL,
    artifact_type TEXT DEFAULT 'LOG',
    created_at TEXT NOT NULL
  );
`);

function seedCompanyData() {
  const deptCount = db.prepare('SELECT COUNT(*) as c FROM departments').get().c;
  if (deptCount > 0) return;

  const depts = [
    {
      id: 'dept-strategy',
      code: 'STRAT',
      name: 'Ban Chiến lược & Điều hành (Executive & Positioning)',
      mission: 'Định vị ngách nội dung, phân tích đối thủ, kiểm duyệt thông điệp cốt lõi và phê duyệt chiến dịch.',
      color: '#6366f1'
    },
    {
      id: 'dept-research',
      code: 'R&D',
      name: 'Phòng Nghiên cứu Xu hướng (Trend & Viral Lab)',
      mission: 'Quét tín hiệu xu hướng trên TikTok/YouTube/Reels, giải phẫu cấu trúc Hook giữ chân 3 giây đầu.',
      color: '#06b6d4'
    },
    {
      id: 'dept-editorial',
      code: 'SCRIPT',
      name: 'Phòng Biên kịch & Nội dung (Scriptwriting Studio)',
      mission: 'Chuyển hóa ý tưởng thành kịch bản phân cảnh chi tiết theo nhịp độ Storytelling và tâm lý học hành vi.',
      color: '#10b981'
    },
    {
      id: 'dept-visual',
      code: 'STUDIO',
      name: 'Phòng Đạo diễn Hình ảnh & Hậu kỳ (Visual & CapCut Studio)',
      mission: 'Thiết kế bố cục Thumbnail CTR cao, lên danh sách cảnh quay B-Roll, hiệu ứng âm thanh (SFX) và nhịp dựng.',
      color: '#f59e0b'
    },
    {
      id: 'dept-growth',
      code: 'GROWTH',
      name: 'Phòng Tăng trưởng, SEO & Kiếm tiền (Growth & Monetization)',
      mission: 'Tối ưu từ khóa tìm kiếm, lịch đăng vàng, thử nghiệm A/B tiêu đề và chèn phễu chuyển đổi doanh thu.',
      color: '#ec4899'
    }
  ];

  const insertDept = db.prepare('INSERT INTO departments (id, code, name, mission, color) VALUES (?, ?, ?, ?, ?)');
  for (const d of depts) {
    insertDept.run(d.id, d.code, d.name, d.mission, d.color);
  }

  const agents = [
    {
      id: 'agt-director',
      dept_id: 'dept-strategy',
      code: 'DIR-01',
      name: 'Minh Quân',
      role: 'Giám đốc Chiến lược Kênh (Chief Channel Architect)',
      specialty: 'Định vị thương hiệu cá nhân, Content Pillar & Phễu chuyển đổi',
      system_prompt: 'Xây dựng góc nhìn độc bản (Unique Angle), xác định nỗi đau (Pain Point) và khao khát của tệp khán giả mục tiêu.',
      status: 'ONLINE',
      tasks_completed: 42
    },
    {
      id: 'agt-trend',
      dept_id: 'dept-research',
      code: 'TRD-02',
      name: 'Hải Yến',
      role: 'Chuyên gia Săn Trend & Phân tích Đối thủ (Trend Intelligence)',
      specialty: 'Khai thác từ khóa ngách, phân tích khoảng trống nội dung (Content Gap)',
      system_prompt: 'Tìm ra 3 góc tiếp cận gây tranh luận hoặc kích thích tò mò mạnh nhất từ xu hướng hiện tại.',
      status: 'ONLINE',
      tasks_completed: 68
    },
    {
      id: 'agt-hook',
      dept_id: 'dept-research',
      code: 'HOK-03',
      name: 'Tuấn Kiệt',
      role: 'Kỹ sư Tâm lý Học Giữ chân (Hook & Retention Specialist)',
      specialty: 'Tối ưu 3 giây đầu (Visual/Verbal Hook) & điểm giữ chân giữa video',
      system_prompt: 'Thiết kế 5 biến thể Hook đánh trực diện vào sự tò mò, nỗi sợ bỏ lỡ (FOMO) hoặc phá vỡ niềm tin cũ.',
      status: 'ONLINE',
      tasks_completed: 54
    },
    {
      id: 'agt-short-writer',
      dept_id: 'dept-editorial',
      code: 'SCR-04',
      name: 'Bảo Ngọc',
      role: 'Biên kịch Video Ngắn (TikTok / Reels / Shorts Lead Writer)',
      specialty: 'Kịch bản tốc độ cao 45-90s, thoại súc tích, nhịp cắt dồn dập',
      system_prompt: 'Viết kịch bản theo công thức Hook (0-3s) - Agitate (3-15s) - Value Delivery (15-50s) - Payoff & CTA (50-60s).',
      status: 'ONLINE',
      tasks_completed: 89
    },
    {
      id: 'agt-long-writer',
      dept_id: 'dept-editorial',
      code: 'SCR-05',
      name: 'Hoàng Bách',
      role: 'Biên kịch YouTube Dài & Storytelling (Deep-Dive Writer)',
      specialty: 'Cấu trúc phim tài liệu ngắn, phân tích chuyên sâu 8-15 phút',
      system_prompt: 'Xây dựng kịch bản nhiều chương hồi, cài cắm Open Loops để duy trì Average View Duration (AVD) trên 65%.',
      status: 'ONLINE',
      tasks_completed: 37
    },
    {
      id: 'agt-art',
      dept_id: 'dept-visual',
      code: 'VIS-06',
      name: 'Khánh Linh',
      role: 'Đạo diễn Hình ảnh & Thumbnail (Visual & Thumbnail Director)',
      specialty: 'Thiết kế bố cục Thumbnail CTR > 9%, Prompt tạo ảnh minh họa',
      system_prompt: 'Đề xuất 3 concept Thumbnail tương phản mạnh, giới hạn dưới 4 từ trên ảnh và hướng dẫn góc máy.',
      status: 'ONLINE',
      tasks_completed: 61
    },
    {
      id: 'agt-editor',
      dept_id: 'dept-visual',
      code: 'EDT-07',
      name: 'Đức Anh',
      role: 'Đạo diễn Hậu kỳ & Nhịp dựng (CapCut / Premiere Lead Editor)',
      specialty: 'Chỉ đạo B-Roll, Keyframe, Sound Design (SFX) & Text Animation',
      system_prompt: 'Lập bảng phân cảnh dựng phim chi tiết từng mốc giây: cảnh chèn B-roll, hiệu ứng Whoosh/Riser, nhịp zoom.',
      status: 'ONLINE',
      tasks_completed: 73
    },
    {
      id: 'agt-seo',
      dept_id: 'dept-growth',
      code: 'SEO-08',
      name: 'Phương Thảo',
      role: 'Chuyên gia Thuật toán & SEO Đa nền tảng (Algorithm Specialist)',
      specialty: 'Tối ưu Title, Description, Hashtag phân tầng & khung giờ đăng',
      system_prompt: 'Tạo bộ siêu dữ liệu chuẩn thuật toán đề xuất của YouTube/TikTok kèm bộ từ khóa tìm kiếm lượng truy cập cao.',
      status: 'ONLINE',
      tasks_completed: 59
    },
    {
      id: 'agt-monetize',
      dept_id: 'dept-growth',
      code: 'BIZ-09',
      name: 'Gia Huy',
      role: 'Quản lý Tăng trưởng & Chuyển đổi (Monetization Strategist)',
      specialty: 'Kịch bản ghim bình luận, điều hướng Bio Link, Affiliate & Booking',
      system_prompt: 'Thiết kế lời kêu gọi hành động (CTA) tự nhiên không gây phản cảm và kịch bản seeding bình luận đầu tiên.',
      status: 'ONLINE',
      tasks_completed: 45
    }
  ];

  const insertAgent = db.prepare(`
    INSERT INTO agents (id, dept_id, code, name, role, specialty, system_prompt, status, tasks_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const a of agents) {
    insertAgent.run(a.id, a.dept_id, a.code, a.name, a.role, a.specialty, a.system_prompt, a.status, a.tasks_completed);
  }

  const now = new Date();
  const iso = (hoursAgo = 0) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();

  const sampleCampaigns = [
    {
      id: 'cmp-ai-automation',
      title: 'Cách 1 người vận hành cả công ty truyền thông nhờ hệ thống AI Agent',
      platform: 'TikTok / Reels / Shorts (60s)',
      niche: 'Công nghệ & Tự động hóa (AI Productivity)',
      target_audience: 'Creator độc lập, Solopreneur, Chủ doanh nghiệp nhỏ muốn xây kênh nhưng thiếu nhân sự',
      tone: 'Thực chiến, tốc độ cao, sắc bén, chứng minh bằng kết quả thật',
      stage: 'READY',
      viral_score: 94,
      est_views: '250K - 600K',
      created_at: iso(18),
      updated_at: iso(1),
      strategy_brief: `## PHÊ DUYỆT CHIẾN LƯỢC — [DIR-01 Minh Quân] & [TRD-02 Hải Yến]

- **Góc tiếp cận độc bản (Unique Angle):** Thay vì nói lý thuyết chung chung về ChatGPT, video mở màn trực tiếp bằng màn hình điều hành một công ty gồm 5 phòng ban AI đang tự động tranh luận và viết kịch bản.
- **Nỗi đau mục tiêu (Core Pain Point):** 90% người xây kênh bỏ cuộc sau 2 tuần vì phải tự làm tất cả: nghĩ ý tưởng, viết kịch bản, dựng CapCut, tối ưu SEO.
- **5 Phương án Câu mở đầu (Hook 3 Giây đầu) — [HOK-03 Tuấn Kiệt]:**
  1. *[Visual Hook - Cận cảnh màn hình]*: "Đừng thuê đội media 30 triệu/tháng nữa nếu bạn chưa biết cách dựng 5 phòng ban AI này trên máy tính."
  2. *[Phá vỡ niềm tin]*: "Dùng ChatGPT để viết kịch bản là lý do khiến kênh của bạn mãi lẹt đẹt 200 view."
  3. *[Con số đối lập]*: "1 người, 0 nhân viên, nhưng sản xuất 30 video chất lượng cao mỗi tuần nhờ quy trình Studio 5 bước này."`,
      script_content: `## KỊCH BẢN PHÂN CẢNH CHI TIẾT (60 GIÂY) — [SCR-04 Bảo Ngọc]

| Thời lượng | Hình ảnh / Hành động trên màn hình | Lời thoại (Voiceover - Nhịp nhanh 1.15x) |
| :--- | :--- | :--- |
| **00:00 - 00:04** *(Hook)* | Quay cận cảnh màn hình **ChannelCorp OS** đang chạy dây chuyền 5 phòng ban. Zoom nhanh vào bảng kịch bản. | "Đừng tự mình gồng gánh cả việc nghĩ ý tưởng, viết kịch bản lẫn dựng video nữa. Đây là cách mình vận hành cả một công ty Media 9 nhân sự AI ngay trên máy tính." |
| **00:04 - 00:15** *(Nỗi đau)* | Cảnh ngồi trước trang giấy trắng / timeline CapCut trống trơn. Chuyển cảnh nhanh bằng tiếng *Glitch*. | "Sai lầm của hầu hết người mới xây kênh là hỏi AI một câu chung chung, rồi nhận về một bài văn mẫu nhạt nhẽo không ai xem quá 3 giây." |
| **00:15 - 00:42** *(Giải pháp)* | Quay màn hình thực tế từng phòng ban: Phòng Săn Trend -> Phòng Biên kịch -> Phòng Đạo diễn Hậu kỳ CapCut. | "Thay vào đó, mình chia hệ thống thành 5 phòng ban chuyên biệt: Phòng R&D chuyên mổ xẻ câu Hook giữ chân 3 giây đầu; Phòng Biên kịch viết thoại theo nhịp tâm lý; và Phòng Hậu kỳ lên sẵn từng cảnh B-Roll, tiếng động SFX cho CapCut." |
| **00:42 - 00:52** *(Bằng chứng)* | Hiển thị bảng chấm điểm Viral Score 94/100 và bộ từ khóa SEO tự động xuất ra. | "Chỉ cần nhập 1 chủ đề, sau 10 giây bạn có trọn bộ từ kịch bản phân cảnh, bố cục Thumbnail cho tới bình luận ghim điều hướng khách hàng." |
| **00:52 - 01:00** *(CTA)* | Cầm máy nhìn thẳng camera, chỉ tay xuống phần bình luận. | "Mình đã đóng gói toàn bộ mã nguồn hệ thống này trên GitHub. Bình luận chữ **STUDIO** mình gửi ngay quy trình để bạn áp dụng cho kênh của mình nhé!"`,
      visual_storyboard: `## CHỈ ĐẠO HÌNH ẢNH & DỰNG PHIM CAPCUT — [VIS-06 Khánh Linh] & [EDT-07 Đức Anh]

### 1. Thiết kế Thumbnail (CTR mục tiêu > 11%)
- **Bố cục:** Chia đôi màn hình (Split-Screen). Bên trái: Khuôn mặt mệt mỏi trước 10 tab công việc (Tông xám lạnh). Bên phải: Giao diện Dashboard 5 Phòng Ban AI rực sáng (Tông Indigo/Emerald).
- **Chữ trên Thumbnail (Tối đa 4 chữ):** \`CÔNG TY 1 NGƯỜI\` (Font Montserrat ExtraBold, màu vàng #F59E0B viền đen).

### 2. Chỉ dẫn Dựng phim & Âm thanh (CapCut Timeline)
- **00:00 - 00:03:** Chèn hiệu ứng âm thanh \`Whoosh Hit\` + \`Keyboard Typing\`. Zoom-in từ 100% lên 118% vào dòng chữ tiêu đề.
- **00:15 - 00:35:** Nhạc nền chuyển sang beat *Synthwave Driving (95 BPM)* tạo cảm giác công nghệ tốc độ cao. Mỗi 3.5 giây phải thay đổi góc nhìn hoặc chèn B-Roll quay màn hình.
- **Phụ đề (Captions):** Hiển thị từng cụm 3-4 từ ở 1/3 dưới màn hình, tô màu nổi bật các từ khóa: **5 phòng ban AI**, **giữ chân 3 giây**, **CapCut**.`,
      seo_package: `## GÓI TỐI ƯU THUẬT TOÁN & CHUYỂN ĐỔI — [SEO-08 Phương Thảo] & [BIZ-09 Gia Huy]

### 1. Bộ Tiêu đề A/B Testing
- **Phương án A (Tò mò & Kết quả):** Cách mình dựng cả công ty Media 9 nhân sự AI để xây kênh tự động
- **Phương án B (Đánh vào nỗi đau):** Tại sao bạn viết kịch bản bằng AI mãi không lên xu hướng? (Giải pháp 5 Phòng Ban)

### 2. Mô tả & Hashtags chuẩn SEO
> Quy trình vận hành hệ thống Multi-Agent giúp tự động hóa từ khâu nghiên cứu xu hướng, viết kịch bản phân cảnh đến chỉ đạo hậu kỳ CapCut.
> \`#xaykenh\` \`#aitools\` \`#contentcreator\` \`#tudonghoa\` \`#kiemtienonline\` \`#capcut\`

### 3. Kịch bản Seeding Bình luận Ghim (Pinned Comment)
- **Bình luận ghim của chủ kênh:** *"Mình để sẵn link mã nguồn mở của bộ công cụ 5 Phòng Ban AI tại trang cá nhân (hoặc gõ **STUDIO** ở dưới mình gửi trực tiếp nhé). Bạn đang gặp khó khăn nhất ở khâu nghĩ ý tưởng hay dựng video?"*`,
      growth_review: `## ĐÁNH GIÁ TRƯỚC XUẤT BẢN — HỘI ĐỒNG DUYỆT (SCORE: 94/100)
- **Sức hút 3 giây đầu (Hook Power):** 96/100 — Đánh trúng tâm lý muốn tiết kiệm thời gian và chi phí nhân sự.
- **Nhịp độ giữ chân (Retention Pacing):** 92/100 — Có sự chuyển đổi liên tục giữa màn hình phần mềm thực tế và lời giải thích.
- **Tiềm năng chuyển đổi (Conversion):** 95/100 — CTA dùng từ khóa bình luận giúp kích hoạt thuật toán tương tác tự nhiên.`
    },
    {
      id: 'cmp-construction-design',
      title: '3 Sai lầm chí mạng khi cải tạo nhà phố khiến chi phí đội lên gấp đôi',
      platform: 'YouTube Shorts / TikTok (75s)',
      niche: 'Kiến trúc, Nội thất & Xây dựng trọn gói',
      target_audience: 'Chủ nhà 28-50 tuổi chuẩn bị xây nhà hoặc cải tạo không gian sống',
      tone: 'Chuyên gia thực tế, đáng tin cậy, cảnh báo trực diện',
      stage: 'VISUAL',
      viral_score: 91,
      est_views: '180K - 450K',
      created_at: iso(36),
      updated_at: iso(4),
      strategy_brief: `## PHÊ DUYỆT CHIẾN LƯỢC — [DIR-01 Minh Quân] & [HOK-03 Tuấn Kiệt]

- **Insight khách hàng:** Chủ nhà rất sợ phát sinh chi phí ngầm và đập đi xây lại do thiếu bản vẽ kỹ thuật ngay từ đầu.
- **Câu Hook 3 giây đầu:** "Đừng đặt búa đập bất kỳ bức tường nào trong nhà nếu bạn chưa kiểm tra 3 vị trí này — kẻo mất oan 200 triệu tiền gia cố!"`,
      script_content: `## KỊCH BẢN PHÂN CẢNH (75 GIÂY) — [SCR-04 Bảo Ngọc]

| Thời lượng | Hình ảnh / B-Roll thực tế công trình | Lời thoại chuyên gia |
| :--- | :--- | :--- |
| **00:00 - 00:04** | Đứng trực tiếp tại công trình đang thi công phần thô, chỉ thẳng vào dầm/cột. | "Đừng vội đập thông phòng khách nếu chưa kiểm tra 3 hạng mục ngầm này, rất nhiều chủ nhà đã phải trả giá bằng cả trăm triệu tiền phát sinh." |
| **00:04 - 00:25** | Cận cảnh bản vẽ kết cấu và hệ thống ống nước âm tường cũ. | "Sai lầm số 1: Thay đổi công năng khu vệ sinh nhưng không tính độ dốc thoát sàn, dẫn tới thấm ngược xuống trần tầng dưới chỉ sau 6 tháng sử dụng." |
| **00:25 - 00:50** | So sánh cảnh 3D nội thất lung linh và thực tế ổ cắm bị tủ che khuất. | "Sai lầm số 2: Làm điện nước trước khi chốt bản vẽ bố trí nội thất 3D. Kết quả là kê giường xong che mất ổ cắm, phải đục tường đi lại dây." |
| **00:50 - 01:15** | Cảnh bàn giao nhà hoàn thiện chuẩn chỉnh + Bảng dự toán chi tiết. | "Muốn kiểm soát 100% ngân sách không phát sinh, bạn bắt buộc phải có bảng bóc tách khối lượng vật tư ngay từ đầu. Nhắn ngay diện tích nhà bạn ở dưới để đội ngũ kỹ sư gửi mẫu dự toán chuẩn nhé!"`,
      visual_storyboard: `## CHỈ ĐẠO HÌNH ẢNH & HẬU KỲ — [VIS-06 Khánh Linh] & [EDT-07 Đức Anh]

- **Màu sắc chủ đạo:** Tông ấm hiện đại (Warm Contrast), làm nổi bật chi tiết vật liệu thật tại công trường.
- **Đồ họa chèn trên video (Motion Callout):** Dùng khung khoanh đỏ có mũi tên chỉ trực tiếp vào vị trí thấm cổ ống và đường điện âm tường để người xem dễ hình dung.`,
      seo_package: `## TỐI ƯU TÌM KIẾM & CHUYỂN ĐỔI — [SEO-08 Phương Thảo]
- **Từ khóa chính:** xây nhà trọn gói, cải tạo nhà phố, kinh nghiệm xây nhà không phát sinh, thiết kế nội thất.
- **Khung giờ đăng đề xuất:** 11:45 trưa hoặc 19:30 tối (khung giờ gia đình cùng xem và bàn bạc).`,
      growth_review: `## ĐÁNH GIÁ TRƯỚC XUẤT BẢN — HỘI ĐỒNG DUYỆT (SCORE: 91/100)
- Nội dung mang tính giáo dục thị trường cao, dễ dàng lưu vào mục Yêu thích (Save/Bookmark) của người xem, giúp tăng tỷ lệ đề xuất dài hạn.`
    }
  ];

  const insertCamp = db.prepare(`
    INSERT INTO campaigns (
      id, title, platform, niche, target_audience, tone, stage, viral_score, est_views,
      strategy_brief, script_content, visual_storyboard, seo_package, growth_review, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of sampleCampaigns) {
    insertCamp.run(
      c.id, c.title, c.platform, c.niche, c.target_audience, c.tone, c.stage,
      c.viral_score, c.est_views, c.strategy_brief, c.script_content,
      c.visual_storyboard, c.seo_package, c.growth_review, c.created_at, c.updated_at
    );
  }

  const sampleMessages = [
    {
      id: 'msg-1',
      campaign_id: 'cmp-ai-automation',
      agent_id: 'agt-director',
      agent_name: 'Minh Quân',
      agent_role: 'Giám đốc Chiến lược Kênh',
      dept_code: 'STRAT',
      content: 'Đã phê duyệt đề bài chiến dịch. Yêu cầu phòng R&D tập trung khai thác góc nhìn "Công ty 1 người vận hành bằng 5 phòng ban AI" thay vì giới thiệu công cụ rời rạc.',
      artifact_type: 'DIRECTIVE',
      created_at: iso(17)
    },
    {
      id: 'msg-2',
      campaign_id: 'cmp-ai-automation',
      agent_id: 'agt-hook',
      agent_name: 'Tuấn Kiệt',
      agent_role: 'Kỹ sư Tâm lý Học Giữ chân',
      dept_code: 'R&D',
      content: 'Đã hoàn thành 3 biến thể Hook 3 giây đầu. Đề xuất chọn Hook số 1 kết hợp cảnh quay cận màn hình điều hành để giữ chân người xem qua mốc 5 giây đầu tiên.',
      artifact_type: 'HOOK_LAB',
      created_at: iso(16)
    },
    {
      id: 'msg-3',
      campaign_id: 'cmp-ai-automation',
      agent_id: 'agt-short-writer',
      agent_name: 'Bảo Ngọc',
      agent_role: 'Biên kịch Video Ngắn',
      dept_code: 'SCRIPT',
      content: 'Đã bàn giao kịch bản phân cảnh 60 giây chia theo 2 cột Hình ảnh & Lời thoại. Tốc độ đọc tiêu chuẩn 165 từ/phút.',
      artifact_type: 'SCRIPT',
      created_at: iso(15)
    },
    {
      id: 'msg-4',
      campaign_id: 'cmp-ai-automation',
      agent_id: 'agt-editor',
      agent_name: 'Đức Anh',
      agent_role: 'Đạo diễn Hậu kỳ & Nhịp dựng',
      dept_code: 'STUDIO',
      content: 'Đã bổ sung chỉ dẫn âm thanh SFX (Whoosh, Glitch), nhịp zoom keyframe và quy chuẩn phụ đề CapCut vào hồ sơ chiến dịch.',
      artifact_type: 'STORYBOARD',
      created_at: iso(14)
    },
    {
      id: 'msg-5',
      campaign_id: 'cmp-ai-automation',
      agent_id: 'agt-seo',
      agent_name: 'Phương Thảo',
      agent_role: 'Chuyên gia Thuật toán & SEO',
      dept_code: 'GROWTH',
      content: 'Hoàn tất bộ tiêu đề A/B Testing, cụm hashtag phân tầng và kịch bản bình luận ghim điều hướng khách hàng. Điểm dự báo Viral Score: 94/100.',
      artifact_type: 'SEO_PACK',
      created_at: iso(13)
    }
  ];

  const insertMsg = db.prepare(`
    INSERT INTO agent_messages (id, campaign_id, agent_id, agent_name, agent_role, dept_code, content, artifact_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of sampleMessages) {
    insertMsg.run(m.id, m.campaign_id, m.agent_id, m.agent_name, m.agent_role, m.dept_code, m.content, m.artifact_type, m.created_at);
  }
}

seedCompanyData();

module.exports = { db };
