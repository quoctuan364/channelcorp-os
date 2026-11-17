/* ============================================================================
 * ChannelCorp OS — Autonomous Multi-Agent Media Agency Frontend
 * ============================================================================ */

const state = {
  departments: [],
  agents: [],
  campaigns: [],
  messages: [],
  activeCampaignId: null,
  activeTab: 'script_content', // 'script_content' | 'strategy_brief' | 'visual_storyboard' | 'seo_package'
  activeView: 'warroom'
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseInlineMd(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return out;
}

function renderMarkdown(md) {
  if (!md) return '<p style="color:var(--text-muted)">Chưa có dữ liệu bàn giao.</p>';
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  const flushTable = () => {
    if (!inTable || tableRows.length === 0) return;
    html += '<table>';
    tableRows.forEach((row, rIdx) => {
      if (rIdx === 1 && row.every(c => /^[:-\s]+$/.test(c))) return;
      const tag = rIdx === 0 ? 'th' : 'td';
      html += '<tr>' + row.map(c => `<${tag}>${parseInlineMd(c.trim())}</${tag}>`).join('') + '</tr>';
    });
    html += '</table>';
    inTable = false;
    tableRows = [];
  };

  lines.forEach(raw => {
    const line = raw.replace(/\r$/, '');
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList();
      inTable = true;
      tableRows.push(line.trim().slice(1, -1).split('|'));
      return;
    } else if (inTable) {
      flushTable();
    }

    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      flushList();
      const lvl = hMatch[1].length;
      html += `<h${lvl}>${parseInlineMd(hMatch[2])}</h${lvl}>`;
      return;
    }

    if (line.trim().startsWith('>')) {
      flushList();
      html += `<blockquote>${parseInlineMd(line.replace(/^\s*>\s?/, ''))}</blockquote>`;
      return;
    }

    const listMatch = line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${parseInlineMd(listMatch[2])}</li>`;
      return;
    }

    if (!line.trim()) {
      flushList();
      return;
    }

    flushList();
    html += `<p>${parseInlineMd(line)}</p>`;
  });

  flushList();
  flushTable();
  return html;
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadCompanyData(selectFirst = false) {
  const data = await apiFetch('/api/company');
  state.departments = data.departments || [];
  state.agents = data.agents || [];
  state.campaigns = data.campaigns || [];
  state.messages = data.messages || [];

  if (selectFirst && state.campaigns.length > 0 && !state.activeCampaignId) {
    state.activeCampaignId = state.campaigns[0].id;
  } else if (state.activeCampaignId && !state.campaigns.some(c => c.id === state.activeCampaignId)) {
    state.activeCampaignId = state.campaigns[0] ? state.campaigns[0].id : null;
  }

  renderSidebar();
  renderWarRoom();
  renderOrgChart();
  renderKanbanBoard();
  populateConsultAgentSelect();
}

function getActiveCampaign() {
  return state.campaigns.find(c => c.id === state.activeCampaignId) || null;
}

function renderSidebar() {
  document.getElementById('badgeCampaignCount').textContent = state.campaigns.length;
  document.getElementById('badgeAgentCount').textContent = state.agents.length;

  const listEl = document.getElementById('campaignSidebarList');
  listEl.innerHTML = state.campaigns
    .map(c => {
      const active = c.id === state.activeCampaignId;
      return `
      <div class="campaign-card ${active ? 'active' : ''}" data-cmpid="${c.id}">
        <div class="cmp-card-top">
          <span class="cmp-stage-badge">${escapeHtml(c.stage)}</span>
          <span class="cmp-score">SCORE: ${c.viral_score}/100</span>
        </div>
        <div class="cmp-title">${escapeHtml(c.title)}</div>
        <div class="cmp-meta">${escapeHtml(c.platform)}</div>
      </div>
    `;
    })
    .join('');
}

function renderWarRoom() {
  const cmp = getActiveCampaign();
  if (!cmp) return;

  document.getElementById('topActiveStage').textContent = `STAGE: ${cmp.stage}`;
  document.getElementById('topActiveTitle').textContent = cmp.title;
  document.getElementById('topViralScore').textContent = `${cmp.viral_score}/100`;
  document.getElementById('topEstViews').textContent = `${cmp.est_views} views`;

  // Render active deliverable tab
  const content = cmp[state.activeTab] || '';
  const extraReview = state.activeTab === 'seo_package' && cmp.growth_review ? `\n\n${cmp.growth_review}` : '';
  document.getElementById('artifactRenderedView').innerHTML = renderMarkdown(content + extraReview);

  // Render Agent discussion logs for this campaign
  const cmpLogs = state.messages
    .filter(m => m.campaign_id === cmp.id)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const logsEl = document.getElementById('agentLogsContainer');
  logsEl.innerHTML = cmpLogs
    .map(
      m => `
    <div class="agent-msg-card">
      <div class="agent-msg-head">
        <div>
          <span class="agent-badge">[${escapeHtml(m.dept_code)}] ${escapeHtml(m.agent_name)}</span>
        </div>
        <span class="agent-role-label">${escapeHtml(m.agent_role)}</span>
      </div>
      <div class="agent-msg-body">${escapeHtml(m.content)}</div>
    </div>
  `
    )
    .join('');

  logsEl.scrollTop = logsEl.scrollHeight;
}

function renderOrgChart() {
  const grid = document.getElementById('orgDepartmentsGrid');
  grid.innerHTML = state.departments
    .map(dept => {
      const deptAgents = state.agents.filter(a => a.dept_id === dept.id);
      return `
      <div class="dept-card">
        <div class="dept-card-header">
          <span class="dept-tag" style="border-color:${dept.color}; color:#fff;">PHÒNG BAN: ${escapeHtml(dept.code)}</span>
          <h3>${escapeHtml(dept.name)}</h3>
          <p class="dept-mission">${escapeHtml(dept.mission)}</p>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${deptAgents
            .map(
              a => `
            <div class="agent-roster-item">
              <div class="agent-roster-top">
                <strong>${escapeHtml(a.name)} — ${escapeHtml(a.role)}</strong>
                <span class="agent-code-pill">${escapeHtml(a.code)}</span>
              </div>
              <div style="font-size:11.5px; color:var(--accent-emerald);">Chuyên môn: ${escapeHtml(a.specialty)}</div>
              <div class="agent-Prompt-desc">Nhiệm vụ: ${escapeHtml(a.system_prompt)}</div>
              <div style="font-family:var(--font-mono); font-size:10.5px; color:var(--text-muted); margin-top:6px;">
                TRẠNG THÁI: ${escapeHtml(a.status)} · ĐÃ XỬ LÝ: ${a.tasks_completed} CHIẾN DỊCH
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    })
    .join('');
}

function renderKanbanBoard() {
  const stages = [
    { code: 'SCRIPTING', title: '01 · ĐANG LÊN KỊCH BẢN (SCRIPTING)' },
    { code: 'VISUAL', title: '02 · QUAY & DỰNG HẬU KỲ (STUDIO)' },
    { code: 'READY', title: '03 · ĐÃ DUYỆT & SẴN SÀNG ĐĂNG (READY)' }
  ];

  const grid = document.getElementById('kanbanBoardGrid');
  grid.innerHTML = stages
    .map(st => {
      const items = state.campaigns.filter(c => c.stage === st.code);
      return `
      <div class="kanban-col">
        <h3>${st.title} (${items.length})</h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${items
            .map(
              c => `
            <div class="campaign-card" data-open-cmp="${c.id}">
              <div class="cmp-card-top">
                <span class="cmp-stage-badge">${escapeHtml(c.niche)}</span>
                <span class="cmp-score">${c.viral_score}/100</span>
              </div>
              <div class="cmp-title">${escapeHtml(c.title)}</div>
              <div class="cmp-meta" style="margin-bottom:8px;">${escapeHtml(c.platform)} · Dự báo: ${escapeHtml(c.est_views)}</div>
              <div style="display:flex; gap:6px;">
                <button class="btn-outline" style="font-size:10.5px; padding:3px 8px;" data-move-cmp="${c.id}" data-next-stage="SCRIPTING">Kịch bản</button>
                <button class="btn-outline" style="font-size:10.5px; padding:3px 8px;" data-move-cmp="${c.id}" data-next-stage="VISUAL">Dựng phim</button>
                <button class="btn-outline" style="font-size:10.5px; padding:3px 8px;" data-move-cmp="${c.id}" data-next-stage="READY">Sẵn sàng</button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
    })
    .join('');
}

function populateConsultAgentSelect() {
  const sel = document.getElementById('selectConsultAgent');
  if (!sel || sel.options.length > 0) return;
  sel.innerHTML = state.agents
    .map(a => `<option value="${a.id}">[${escapeHtml(a.code)}] ${escapeHtml(a.name)} — ${escapeHtml(a.role)}</option>`)
    .join('');
}

function switchView(viewName) {
  state.activeView = viewName;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  document.getElementById('viewWarroom').classList.toggle('active', viewName === 'warroom');
  document.getElementById('viewOrgchart').classList.toggle('active', viewName === 'orgchart');
  document.getElementById('viewBoard').classList.toggle('active', viewName === 'board');
}

function setupEvents() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.getElementById('campaignSidebarList').addEventListener('click', e => {
    const card = e.target.closest('[data-cmpid]');
    if (!card) return;
    state.activeCampaignId = card.dataset.cmpid;
    switchView('warroom');
    renderSidebar();
    renderWarRoom();
  });

  document.querySelectorAll('.artifact-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.artifact-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeTab = tab.dataset.tab;
      renderWarRoom();
    });
  });

  // Consult specific AI agent
  const sendConsult = async () => {
    const input = document.getElementById('inputConsultQuestion');
    const q = input.value.trim();
    if (!q) return;
    const agentId = document.getElementById('selectConsultAgent').value;
    const cmp = getActiveCampaign();
    input.value = '';

    await apiFetch('/api/agents/consult', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        campaignId: cmp ? cmp.id : null,
        question: q
      })
    });
    await loadCompanyData(false);
  };

  document.getElementById('btnSendConsult').addEventListener('click', sendConsult);
  document.getElementById('inputConsultQuestion').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendConsult();
  });

  // Modal New Campaign Brief
  const modal = document.getElementById('modalNewBrief');
  document.getElementById('btnOpenBriefModal').addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.getElementById('briefTitle').focus();
  });

  document.getElementById('btnCloseModal').addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('formCreateCampaign').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitBrief');
    btn.textContent = '5 PHÒNG BAN ĐANG XỬ LÝ...';
    btn.disabled = true;

    try {
      const payload = {
        title: document.getElementById('briefTitle').value,
        platform: document.getElementById('briefPlatform').value,
        niche: document.getElementById('briefNiche').value,
        targetAudience: document.getElementById('briefAudience').value,
        tone: document.getElementById('briefTone').value,
        keyPoints: document.getElementById('briefKeyPoints').value
      };

      const { campaign } = await apiFetch('/api/campaigns/generate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      state.activeCampaignId = campaign.id;
      modal.classList.add('hidden');
      document.getElementById('briefTitle').value = '';
      document.getElementById('briefKeyPoints').value = '';
      await loadCompanyData(false);
      switchView('warroom');
    } finally {
      btn.textContent = 'KÍCH HOẠT 5 PHÒNG BAN SẢN XUẤT NGAY →';
      btn.disabled = false;
    }
  });

  // Export full production dossier as Markdown
  document.getElementById('btnExportPackage').addEventListener('click', () => {
    const cmp = getActiveCampaign();
    if (!cmp) return;
    const fullDoc = `# HỒ SƠ SẢN XUẤT VIDEO — ${cmp.title}\n\n- **Nền tảng:** ${cmp.platform}\n- **Ngách:** ${cmp.niche}\n- **Viral Score:** ${cmp.viral_score}/100 (${cmp.est_views})\n\n---\n\n${cmp.strategy_brief}\n\n---\n\n${cmp.script_content}\n\n---\n\n${cmp.visual_storyboard}\n\n---\n\n${cmp.seo_package}\n\n---\n\n${cmp.growth_review}\n`;
    const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ChannelCorp-Brief-${cmp.id}.md`;
    a.click();
  });

  // Kanban stage move
  document.getElementById('kanbanBoardGrid').addEventListener('click', async e => {
    const moveBtn = e.target.closest('[data-move-cmp]');
    if (moveBtn) {
      e.stopPropagation();
      const id = moveBtn.getAttribute('data-move-cmp');
      const nextStage = moveBtn.getAttribute('data-next-stage');
      await apiFetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stage: nextStage })
      });
      await loadCompanyData(false);
      return;
    }

    const openCard = e.target.closest('[data-open-cmp]');
    if (openCard) {
      state.activeCampaignId = openCard.getAttribute('data-open-cmp');
      switchView('warroom');
      renderSidebar();
      renderWarRoom();
    }
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  setupEvents();
  await loadCompanyData(true);
});
