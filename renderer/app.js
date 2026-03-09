(function () {
  const $ = (id) => document.getElementById(id);
  const targetInput = $('target');
  const navCategories = $('nav-categories');
  const toolCards = $('tool-cards');
  const placeholder = $('placeholder');
  const searchInput = $('search');
  const toolCountEl = $('tool-count');
  const terminalOutput = $('terminal-output');
  const terminalStatus = $('terminal-status');
  const clearBtn = $('clear-terminal');
  const modalSetup = $('modal-setup');
  const setupList = $('setup-list');
  const setupSearch = $('setup-search');
  const modalClose = $('modal-close');
  const linkSetup = $('link-setup');
  const modalUpdate = $('modal-update');
  const updateMessage = $('update-message');
  const updateDownload = $('update-download');
  const updateRestart = $('update-restart');
  const updateLater = $('update-later');

  let config = { categories: [], tools: [] };
  let currentCategory = null;
  let searchQuery = '';
  let outputUnsubscribe = null;

  function normalizeTarget(raw) {
    const t = (raw || '').trim();
    if (!t) return { domain: '', url: '' };
    const hasProtocol = /^https?:\/\//i.test(t);
    const domain = hasProtocol ? t.replace(/^https?:\/\//i, '').split('/')[0] : t.split('/')[0];
    const url = hasProtocol ? t : 'https://' + t;
    return { domain, url };
  }

  function substituteCommand(cmd, targetRaw) {
    const { domain, url } = normalizeTarget(targetRaw);
    return cmd
      .replace(/\{\{target\}\}/g, domain)
      .replace(/\{\{target_url\}\}/g, url);
  }

  function getToolsForCategory(catId) {
    return config.tools.filter((t) => t.category === catId);
  }

  function renderNav() {
    navCategories.innerHTML = config.categories
      .map((c) => {
        const count = getToolsForCategory(c.id).length;
        return `<a href="#" class="nav-item" data-category="${c.id}">${c.icon} ${c.name}<span class="cat-count">${count}</span></a>`;
      })
      .join('');

    navCategories.querySelectorAll('.nav-item').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        navCategories.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
        el.classList.add('active');
        currentCategory = el.dataset.category;
        renderTools();
      });
    });
  }

  function matchesSearch(tool, q) {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (tool.name && tool.name.toLowerCase().includes(s)) ||
      (tool.description && tool.description.toLowerCase().includes(s)) ||
      (tool.id && tool.id.toLowerCase().includes(s))
    );
  }

  function renderTools() {
    let tools = currentCategory
      ? config.tools.filter((t) => t.category === currentCategory)
      : config.tools;
    if (searchQuery) tools = tools.filter((t) => matchesSearch(t, searchQuery));

    toolCountEl.textContent = tools.length === 0 ? '' : `${tools.length} tool${tools.length !== 1 ? 's' : ''}`;
    placeholder.hidden = tools.length > 0;
    placeholder.textContent = searchQuery ? 'No tools match your search.' : 'Select a category or run a tool.';
    toolCards.innerHTML = tools
      .map(
        (t) => `
        <button type="button" class="btn btn-tool" data-tool-id="${t.id}" title="${(t.command || '').replace(/"/g, '&quot;')}">
          <span class="tool-name">${escapeHtml(t.name)}</span>
          <span class="tool-desc">${escapeHtml(t.description)}</span>
        </button>
      `
      )
      .join('');

    toolCards.querySelectorAll('.btn-tool').forEach((btn) => {
      btn.addEventListener('click', () => runTool(config.tools.find((x) => x.id === btn.dataset.toolId)));
    });
  }

  function escapeHtml(s) {
    if (!s) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function setStatus(text, className = '') {
    terminalStatus.textContent = text;
    terminalStatus.className = 'terminal-status ' + className;
  }

  function appendTerminal(data, isStderr = false) {
    const pre = terminalOutput;
    const span = document.createElement('span');
    span.className = isStderr ? 'stderr' : '';
    span.textContent = data;
    pre.appendChild(span);
    pre.parentElement.scrollTop = pre.parentElement.scrollHeight;
  }

  function clearTerminal() {
    terminalOutput.innerHTML = '';
    setStatus('');
  }

  async function runTool(tool) {
    const targetRaw = targetInput.value.trim();
    const { domain } = normalizeTarget(targetRaw);

    if (!domain && (tool.command.includes('{{target}}') || tool.command.includes('{{target_url}}'))) {
      appendTerminal('\n[Error] Enter a target domain or URL first.\n', true);
      setStatus('Error: no target', 'error');
      targetInput.focus();
      return;
    }

    const command = substituteCommand(tool.command, targetRaw);
    appendTerminal(`\n$ ${command}\n`);
    setStatus('Running…', 'running');

    toolCards.querySelectorAll('.btn-tool').forEach((b) => (b.disabled = true));

    // Subscribe BEFORE starting the command so we never miss stdout/stderr or "done"
    if (outputUnsubscribe) outputUnsubscribe();
    outputUnsubscribe = window.api.onCommandOutput((payload) => {
      if (payload.type === 'stdout') appendTerminal(payload.data);
      if (payload.type === 'stderr') appendTerminal(payload.data, true);
      if (payload.type === 'done') {
        setStatus(payload.code === 0 ? 'Done' : `Exit ${payload.code}`, payload.code === 0 ? '' : 'error');
        toolCards.querySelectorAll('.btn-tool').forEach((b) => (b.disabled = false));
        if (outputUnsubscribe) {
          outputUnsubscribe();
          outputUnsubscribe = null;
        }
      }
    });

    try {
      await window.api.runCommandStream({
        command,
        cwd: undefined,
        env: {},
      });
    } catch (err) {
      appendTerminal(err.message + '\n', true);
      setStatus('Error', 'error');
      toolCards.querySelectorAll('.btn-tool').forEach((b) => (b.disabled = false));
      if (outputUnsubscribe) {
        outputUnsubscribe();
        outputUnsubscribe = null;
      }
    }
  }

  clearBtn.addEventListener('click', clearTerminal);

  function renderSetupList(filter) {
    let list = config.tools;
    if (filter) {
      const q = filter.toLowerCase();
      list = list.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.install && String(t.install).toLowerCase().includes(q))
      );
    }
    setupList.innerHTML = list
      .map(
        (t) => `
        <div class="setup-item">
          <strong>${escapeHtml(t.name)}</strong>
          <code>${escapeHtml(t.install || '—')}</code>
        </div>
      `
      )
      .join('');
  }

  linkSetup.addEventListener('click', (e) => {
    e.preventDefault();
    setupSearch.value = '';
    renderSetupList('');
    modalSetup.hidden = false;
  });

  setupSearch.addEventListener('input', () => renderSetupList(setupSearch.value.trim()));

  modalClose.addEventListener('click', () => {
    modalSetup.hidden = true;
  });

  modalSetup.addEventListener('click', (e) => {
    if (e.target === modalSetup) modalSetup.hidden = true;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modalSetup.hidden) modalSetup.hidden = true;
    if (!modalUpdate.hidden) modalUpdate.hidden = true;
  });

  function showUpdateAvailable(version) {
    updateMessage.textContent = `A new version (v${version}) is available. Download and install now?`;
    updateDownload.textContent = 'Download';
    updateDownload.style.display = '';
    updateDownload.disabled = false;
    updateRestart.style.display = 'none';
    modalUpdate.hidden = false;
  }
  function showUpdateDownloading(percent) {
    updateMessage.textContent = `Downloading update… ${Math.round(percent || 0)}%`;
    updateDownload.disabled = true;
  }
  function showUpdateReady(version) {
    updateMessage.textContent = `Update v${version} ready. Restart now to install.`;
    updateDownload.style.display = 'none';
    updateRestart.style.display = '';
  }

  window.api.onUpdateAvailable((info) => {
    showUpdateAvailable(info.version || '');
  });
  window.api.onUpdateDownloaded((info) => {
    showUpdateReady(info.version || '');
  });
  window.api.onUpdateProgress((p) => {
    showUpdateDownloading(p.percent);
  });
  window.api.onUpdateError(() => {
    updateMessage.textContent = 'Update failed. You can download the latest version from the releases page.';
    updateDownload.style.display = 'none';
    updateRestart.style.display = 'none';
  });

  updateDownload.addEventListener('click', () => {
    window.api.downloadUpdate();
  });
  updateRestart.addEventListener('click', () => {
    window.api.quitAndInstall();
  });
  updateLater.addEventListener('click', () => {
    modalUpdate.hidden = true;
  });
  modalUpdate.addEventListener('click', (e) => {
    if (e.target === modalUpdate) modalUpdate.hidden = true;
  });

  async function init() {
    try {
      config = await window.api.getToolsConfig();
      if (!config.categories || !config.categories.length) {
        config = {
          categories: [
            { id: 'recon', name: 'Recon', icon: '🔍', description: '' },
            { id: 'scan', name: 'Scan', icon: '🛡️', description: '' },
            { id: 'exploit', name: 'Exploit', icon: '⚡', description: '' },
          ],
          tools: [],
        };
      }
    } catch (e) {
      config = { categories: [], tools: [] };
    }

    renderNav();
    if (config.categories.length) {
      const firstNav = navCategories.querySelector('.nav-item');
      if (firstNav) {
        firstNav.classList.add('active');
        currentCategory = firstNav.dataset.category;
      }
    }
    renderTools();
    if (!config.categories.length && !config.tools.length) {
      placeholder.textContent = 'Could not load tools. Check that tools-config/tools.json exists.';
      placeholder.hidden = false;
    }

    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      renderTools();
    });
  }

  init();
})();
