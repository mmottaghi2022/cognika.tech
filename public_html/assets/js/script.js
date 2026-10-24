(() => {
  const sections = {
    about: {
      index: '01 — 06', eyebrow: 'COGNIKA / ABOUT', title: 'Cognika', kicker: 'INTELLIGENCE CREATES TOMORROW',
      description: 'We explore how intelligent models can help design, develop, and improve the systems people rely on.',
      topics: ['Our vision', 'Engineering philosophy', 'Research & development'],
      symbol: 'c', dialog: 'Cognika brings AI, software, electronics, and automation together around one idea: make complex systems more capable.'
    },
    eos: {
      index: '02 — 06', eyebrow: 'COGNIKA / PROJECT 01', title: 'e_OS', kicker: 'INTELLIGENT LIFT OPERATING SYSTEM',
      description: 'A smarter control layer for lift systems—built around data, adaptive optimization, and dependable local operation.',
      topics: ['System overview', 'Controller integration', 'Optimization research'],
      symbol: 'lift', dialog: 'e_OS is the Cognika concept for an intelligent lift operating system. The design direction combines controller data, constrained optimization, and local-first operation.'
    },
    paia: {
      index: '03 — 06', eyebrow: 'COGNIKA / PROJECT 02', title: 'pa_ia', kicker: 'SELF-DEVELOPING INTELLIGENT ERP',
      description: 'A new approach to business software: connected events, adaptive workflows, and AI-assisted operations.',
      topics: ['Intelligent ERP', 'Workflow automation', 'Adaptive operations'],
      symbol: 'brain', dialog: 'pa_ia is a concept for an intelligent ERP system focused on adaptive workflows and AI-assisted business operations.'
    },
    srm: {
      index: '04 — 06', eyebrow: 'COGNIKA / PROJECT 03', title: 'Srm_p', kicker: 'SALIENT RELUCTANCE POSITIONING MOTOR',
      description: 'Motor-design research focused on electromagnetic performance, precise positioning, and practical control.',
      topics: ['Motor concept', 'Electromagnetic design', 'Positioning control'],
      symbol: 'motor', dialog: 'Srm_p represents Cognika’s motor engineering research direction, including electromagnetic design, positioning performance, and motor control.'
    },
    downloads: {
      index: '05 — 06', eyebrow: 'COGNIKA / RESOURCES', title: 'Downloads', kicker: 'DOCUMENTS · SOFTWARE · FIRMWARE',
      description: 'A single place for project documents, technical resources, release notes, and downloadable tools.',
      topics: ['Technical documents', 'Software releases', 'Firmware & utilities'],
      symbol: 'download', dialog: 'The download center can host technical documents, project releases, firmware, and utilities as they become available.'
    },
    contact: {
      index: '06 — 06', eyebrow: 'COGNIKA / CONTACT', title: 'Connect', kicker: 'LET’S BUILD SOMETHING INTELLIGENT',
      description: 'Have an engineering challenge, collaboration idea, or question about a Cognika project? Start a conversation.',
      topics: ['General enquiries', 'Project collaboration', 'Technical discussions'],
      symbol: 'mail', dialog: 'Use this section for general enquiries, project collaboration, and technical discussions. Add your official contact channels before launch.'
    }
  };

  const nodes = [...document.querySelectorAll('.orbit-node')];
  const panelIndex = document.getElementById('panelIndex');
  const panelEyebrow = document.getElementById('panelEyebrow');
  const panelTitle = document.getElementById('panelTitle');
  const panelKicker = document.getElementById('panelKicker');
  const panelDescription = document.getElementById('panelDescription');
  const panelLinks = document.getElementById('panelLinks');
  const panelDetail = document.getElementById('panelDetail');
  const panelSymbol = document.getElementById('panelSymbol');
  const exploreButton = document.getElementById('exploreButton');
  const dialog = document.getElementById('detailDialog');
  const dialogEyebrow = document.getElementById('dialogEyebrow');
  const dialogTitle = document.getElementById('dialogTitle');
  const dialogDescription = document.getElementById('dialogDescription');
  const dialogClose = document.getElementById('dialogClose');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  let activeKey = 'eos';

  const symbols = {
    c: '<span class="dialog-c-mark">C</span>',
    lift: '<svg viewBox="0 0 64 64" fill="none"><path d="M19 9h26v46H19z" stroke="currentColor" stroke-width="1.7"/><path d="M32 17v30" stroke="currentColor" stroke-width="1.7"/><circle cx="32" cy="32" r="2" fill="currentColor"/></svg>',
    brain: '<svg viewBox="0 0 64 64" fill="none"><path d="M31 13c-6-8-17-3-17 5-9 1-10 14-3 18-5 9 2 18 10 17 3 7 11 6 12 0V15c0-2-1-2-2-2Z" stroke="currentColor" stroke-width="1.8"/><path d="M33 13c6-8 17-3 17 5 9 1 10 14 3 18 5 9-2 18-10 17-3 7-11 6-12 0M21 20c6 0 8 5 6 9m-13 6c6-2 10 1 10 6m16-21c-5 0-8 5-6 9m14 6c-6-2-10 1-10 6" stroke="currentColor" stroke-width="1.8"/></svg>',
    motor: '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="1.7"/><circle cx="32" cy="32" r="12" stroke="currentColor" stroke-width="1.7"/><circle cx="32" cy="32" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M32 4v9m0 38v9M4 32h9m38 0h9M12 12l7 7m26 26 7 7m0-40-7 7M19 45l-7 7" stroke="currentColor" stroke-width="1.7"/></svg>',
    download: '<svg viewBox="0 0 64 64" fill="none"><path d="M32 7v34m-12-12 12 12 12-12M10 42v13h44V42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mail: '<svg viewBox="0 0 64 64" fill="none"><rect x="7" y="13" width="50" height="38" rx="3" stroke="currentColor" stroke-width="2"/><path d="m9 16 23 19 23-19" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  };

  function renderSection(key) {
    const data = sections[key];
    if (!data) return;
    activeKey = key;
    nodes.forEach(node => {
      const active = node.dataset.section === key;
      node.classList.toggle('is-active', active);
      node.setAttribute('aria-pressed', String(active));
    });
    panelIndex.textContent = data.index;
    panelEyebrow.textContent = data.eyebrow;
    panelTitle.textContent = data.title;
    panelKicker.textContent = data.kicker;
    panelDescription.textContent = data.description;
    panelSymbol.innerHTML = symbols[data.symbol] || symbols.lift;
    panelLinks.replaceChildren();
    data.topics.forEach(topic => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.topic = topic;
      button.innerHTML = `${escapeHTML(topic)} <span aria-hidden="true">↗</span>`;
      button.addEventListener('click', () => {
        panelDetail.textContent = `${topic} — ${topicDescription(key, topic)}`;
      });
      panelLinks.appendChild(button);
    });
    panelDetail.textContent = 'Choose a topic to preview this section.';
  }

  function topicDescription(key, topic) {
    const descriptions = {
      about: {
        'Our vision': 'Develop practical intelligence for complex real-world systems.',
        'Engineering philosophy': 'Combine models, clear constraints, and engineering validation.',
        'Research & development': 'Explore ideas across software, electronics, and automation.'
      },
      eos: {
        'System overview': 'An overview of the intelligent lift operating system concept.',
        'Controller integration': 'Explore how controller data and bounded settings could connect.',
        'Optimization research': 'Investigate data-driven optimization within validated limits.'
      },
      paia: {
        'Intelligent ERP': 'Connect business objects, events, and operational data.',
        'Workflow automation': 'Coordinate repeatable business processes with AI assistance.',
        'Adaptive operations': 'Support continuous improvement with traceable changes.'
      },
      srm: {
        'Motor concept': 'Review the motor concept and its engineering goals.',
        'Electromagnetic design': 'Explore magnetic design, torque, and ripple considerations.',
        'Positioning control': 'Explore feedback and positioning-control approaches.'
      },
      downloads: {
        'Technical documents': 'Technical documentation can be added here.',
        'Software releases': 'Release packages can be published here when available.',
        'Firmware & utilities': 'Firmware and utility downloads can be linked here.'
      },
      contact: {
        'General enquiries': 'For general questions about Cognika and its projects.',
        'Project collaboration': 'For potential research, engineering, or product collaborations.',
        'Technical discussions': 'For technical questions and engineering discussions.'
      }
    };
    return descriptions[key]?.[topic] || 'More information will be added here.';
  }

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  nodes.forEach(node => {
    const key = node.dataset.section;
    node.addEventListener('mouseenter', () => renderSection(key));
    node.addEventListener('focus', () => renderSection(key));
    node.addEventListener('click', () => renderSection(key));
  });

  exploreButton.addEventListener('click', () => {
    const data = sections[activeKey];
    dialogEyebrow.textContent = data.eyebrow;
    dialogTitle.textContent = data.title;
    dialogDescription.textContent = data.dialog;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  });
  dialogClose.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  mobileToggle?.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
    document.querySelector('.orbit-stage')?.classList.toggle('mobile-nav-highlight', !isExpanded);
    if (window.matchMedia('(max-width: 460px)').matches) {
      document.querySelector('.orbit-menu')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  renderSection(activeKey);
})();
