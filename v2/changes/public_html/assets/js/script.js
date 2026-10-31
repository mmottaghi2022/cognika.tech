/* Homepage module — the landing cover, the orbit navigator and the wordmark
 * flight.
 *
 * It used to be an IIFE that ran on load and looked elements up immediately.
 * The shell re-inserts this page without reloading the document, so the module
 * is now a factory: mount() binds to whatever <main> is currently in the
 * document, and returns a cleanup function for the shell to call before the
 * page is replaced.
 *
 * It also exposes handOff(): the promise of the landing transition, so the
 * shell can run the flight to completion against the header that is still on
 * the page before swapping anything.
 */
window.CognikaHome = (function () {
  'use strict';

  // ---- Page data ----------------------------------------------------------
  const sections = {
    about: {
      index: '01 — 06', eyebrow: 'COGNIKA / ABOUT', title: 'Cognika', kicker: 'INTELLIGENCE CREATES TOMORROW',
      teaser: 'Creating Cognitive Intelligence for Automated Platforms.',
      description: 'Cognika is a technology startup focused on creating cognitive intelligence through AI, automation, and intelligent systems. We believe the true potential of artificial intelligence lies not merely in generating answers, but in understanding objectives, reasoning through challenges, and transforming ideas into practical, functioning solutions.',
      body: [
        'Cognika is a technology startup focused on creating cognitive intelligence through AI, automation, and intelligent systems. We believe the true potential of artificial intelligence lies not merely in generating answers, but in understanding objectives, reasoning through challenges, and transforming ideas into practical, functioning solutions.',
        'Our approach begins with understanding the problem. Every project has its own goals, constraints, requirements, and risks. We work to bring these elements into a coherent structure, enabling intelligent systems to understand what needs to be achieved, determine how to achieve it, and translate decisions into meaningful actions.',
        'At Cognika, we aim to bridge the gap between human intention and machine execution. By combining AI models, automation, software architecture, and engineering principles, we develop systems that can interpret requirements, coordinate processes, adapt to changing conditions, and support increasingly autonomous operation.',
        'LISTMARK',
        'We see intelligence not as an isolated algorithm, but as a capability that emerges when reasoning, knowledge, tools, and processes work together toward a defined objective. Our focus is on building the technological foundations that allow this capability to become practical, reliable, and scalable.',
        'From specialized platforms to customized engineering projects, Cognika helps transform complex challenges into intelligent, goal-oriented systems. We develop solutions around the objectives they must achieve—not simply around the technologies available.',
        'Our current works include pat-ia, e_os, and srm_p, alongside on-demand intelligent solutions and specialized platforms.',
        '<strong>Cognika — transforming artificial intelligence to cognetive intelligence.</strong>'
      ],
      topics: [],
      minimal: true,
      symbol: '', dialog: 'Cognika is a technology startup creating cognitive intelligence through AI, automation, and intelligent systems — transforming ideas into practical, functioning solutions.'
    },
    eos: {
      index: '02 — 06', eyebrow: 'COGNIKA / PROJECT 01', title: 'Intelligent Elevator Operating System', kicker: 'INTELLIGENT LIFT OPERATING SYSTEM',
      teaser: 'Intelligent elevator operating system.',
      description: 'e_os is an intelligent elevator dispatch and optimization system designed to enhance passenger service through adaptive algorithms, AI-driven analysis, and continuous improvement.',
      body: [
        'e_os is an intelligent elevator dispatch and optimization system designed to enhance passenger service through adaptive algorithms, AI-driven analysis, and continuous improvement.',
        '<strong>AI-Driven Optimization</strong><br>At the heart of e_os is a dedicated AI agent that enters a nightly Dream Phase, analyzing operational data, evaluating dispatch strategies, and optimizing performance. When traffic patterns change or service quality deviates from defined targets, the system can initiate further optimization to adapt.',
        '<strong>Adaptive Traffic Management</strong><br>e_os combines embedded weekly time-pattern memory with local reinforcement learning to recognize passenger traffic throughout the day. By identifying recurring patterns and changing demand, the system dynamically adjusts dispatch strategies to improve elevator service.<br>Through an intelligent chatbot, building managers can issue operational commands and define management scenarios. The system translates these instructions into dispatch policies and applies them to the service plan.',
        'LISTMARK',
        '<strong>Intelligent Parking Management</strong><br>e_os incorporates static and dynamic parking modules, supported by a dedicated database that tracks floor occupancy and parking behavior. By analyzing building activity, the system optimizes elevator parking positions to improve availability and reduce unnecessary travel.',
        '<strong>Passenger Service Optimization</strong><br>The e_os performance engine balances passenger waiting time and time to destination. Rather than optimizing a single metric, it evaluates overall service quality to deliver a more efficient passenger experience.',
        '<strong>Connected Intelligence and Simulation</strong><br>Equipped with Wi-Fi and Bluetooth, e_os supports connectivity with external systems and online AI-assisted optimization where internet access is available.<br>During the Dream Phase, the intelligent agent simulates alternative service strategies using recorded traffic data. By evaluating candidate scenarios across different traffic conditions, the system aims to identify effective dispatch policies for both recurring and changing demand.'
      ],
      topics: [],
      minimal: true,
      symbol: '', dialog: 'e_os is an intelligent elevator dispatch and optimization system built around adaptive algorithms, AI-driven analysis, and continuous improvement.'
    },
    paia: {
      index: '03 — 06', eyebrow: 'COGNIKA / PROJECT 02', title: 'Pat Intelligent Assistant', kicker: 'SELF-DEVELOPING INTELLIGENT ERP',
      teaser: 'Self-developing intelligent ERP.',
      description: 'The failure risk in using a conventional ERP systems is the implementation, hundreds of forms and complications! Pat_ia solves this issue. It creates the current model of the enterprise and implement what is in progress, watches the workflows while acting as a messenger UI through emails and chat_bot assistant.',
      body: [
        'The failure risk in using a conventional ERP systems is the implementation, hundreds of forms and complications! Pat_ia solves this issue. It creates the current model of the enterprise and implement what is in progress, watches the workflows while acting as a messenger UI through emails and chat_bot assistant.',
        'Pat is an intelligent assistant chat agent which sits on communication route between the enterprise employees, management and sectors, with dedicated cognitive approach, it detects objects, events and workflows and through human in loop work flow mechanism identifies the requirements and form repeatable work flows.',
        'LIST',
        'Which all together form a complete ERP system. It is modular and any extra module and dashboard can be added the system on demand.<br>This platform has event driven structure, intelligent ledger design is capable of reproducing the whole data structure with a single ledger backup.'
      ],
      listHeading: 'The system is consisted of:',
      modules: ['Accounting', 'Treasury', 'Warehouse', 'Human resource', 'Project management', 'Vendors data base', 'Embedded mail server', 'Customer relation management', 'Norms and standards data base', 'Scheduler module'],
      topics: [],
      minimal: true,
      symbol: '', dialog: 'pa_ia is a concept for an intelligent ERP system focused on adaptive workflows and AI-assisted business operations.'
    },
    srm: {
      index: '04 — 06', eyebrow: 'COGNIKA / PROJECT 03', title: 'Synchronous Reluctance Motors', kicker: 'SALIENT RELUCTANCE POSITIONING MOTOR',
      teaser: 'Engineered for demanding positioning applications.',
      description: 'Synchronous Reluctance Motors (SynRMs) offer a compelling alternative to asynchronous and permanent-magnet synchronous motors. Their magnet-free rotor reduces material costs, eliminates demagnetization risks, and supports robust, long-life operation in demanding industrial environments.',
      body: [
        'Synchronous Reluctance Motors (SynRMs) offer a compelling alternative to asynchronous and permanent-magnet synchronous motors. Their magnet-free rotor reduces material costs, eliminates demagnetization risks, and supports robust, long-life operation in demanding industrial environments.',
        'SynRMs can deliver higher starting torque than conventional asynchronous motors in suitable designs, although permanent-magnet motors generally offer higher torque density and starting performance. Their simple rotor construction also reduces dependence on rare-earth materials and supports economical manufacturing.',
        '<strong>High Performance Through Intelligent Design</strong><br>Our positioning-motor design has achieved 3% simulated torque ripple and IE5-level energy-efficiency performance in simulations. Through optimized magnetic geometry and intelligent drive control, we aim to combine smooth positioning, reduced energy consumption and reliable operation.',
        'LISTMARK',
        'Without permanent magnets vulnerable to irreversible demagnetization from excessive heat or opposing magnetic fields, our design offers a durable solution for applications requiring frequent starts, controlled movement and long service life.',
        'Our mission is to redefine positioning motors through precision, energy efficiency, robust engineering and cost-effective manufacturing.'
      ],
      topics: [],
      minimal: true,
      symbol: '', dialog: 'Synchronous Reluctance Motors are engineered for demanding positioning applications, combining magnet-free rotor design with precise positioning and energy efficiency.'
    },
    downloads: {
      index: '05 — 06', eyebrow: 'COGNIKA / RESOURCES', title: 'Downloads', kicker: 'DOCUMENTS · SOFTWARE · FIRMWARE',
      teaser: 'Documents, releases and tools.',
      description: 'A single place for project documents, technical resources, release notes, and downloadable tools.',
      topics: [],
      minimal: true,
      symbol: '', dialog: 'The download center can host technical documents, project releases, firmware, and utilities as they become available.'
    },
    contact: {
      index: '06 — 06', eyebrow: 'COGNIKA / CONTACT', title: 'Contact', kicker: 'LET’S BUILD SOMETHING INTELLIGENT',
      teaser: 'Get in touch.',
      description: 'For engineering challenges, collaboration ideas, or questions about a Cognika project, write to us at info@cognika.tech.',
      email: 'info@cognika.tech',
      topics: [],
      minimal: true,
      symbol: '', dialog: 'For general enquiries, project collaboration, and technical discussions, write to Cognika at info@cognika.tech.'
    }
  };

  // ---- Elements -----------------------------------------------------------
  // Bound by mount(), not at load: after a shell navigation this module runs
  // against freshly inserted markup, so every lookup has to happen then.
  let nodes = [];
  let panelIndex, panelEyebrow, panelTitle, panelTeaser, panelSymbol;
  let hoverInfo, hoverEyebrow, hoverIndex, hoverKicker, hoverTitle;
  let hoverDescription, hoverTopics, hoverDetail, hoverAction;
  let dialog, dialogEyebrow, dialogTitle, dialogDescription, dialogClose;
  let mobileToggle;

  function bindElements(main) {
    const root = main || document;
    nodes = [...root.querySelectorAll('.orbit-node')];
    panelIndex = document.getElementById('panelIndex');
    panelEyebrow = document.getElementById('panelEyebrow');
    panelTitle = document.getElementById('panelTitle');
    panelTeaser = document.getElementById('panelTeaser');
    panelSymbol = document.getElementById('panelSymbol');
    hoverInfo = document.getElementById('hoverInfo');
    hoverEyebrow = document.getElementById('hoverEyebrow');
    hoverIndex = document.getElementById('hoverIndex');
    hoverKicker = document.getElementById('hoverKicker');
    hoverTitle = document.getElementById('hoverTitle');
    hoverDescription = document.getElementById('hoverDescription');
    hoverTopics = document.getElementById('hoverTopics');
    hoverDetail = document.getElementById('hoverDetail');
    hoverAction = document.getElementById('hoverAction');
    dialog = document.getElementById('detailDialog');
    dialogEyebrow = document.getElementById('dialogEyebrow');
    dialogTitle = document.getElementById('dialogTitle');
    dialogDescription = document.getElementById('dialogDescription');
    dialogClose = document.getElementById('dialogClose');
    mobileToggle = document.querySelector('.mobile-menu-toggle');
  }
  let activeKey = 'about';

  const symbols = {
    c: '<img class="panel-logo" src="assets/img/favicon.svg" alt="" width="40" height="40">',
    lift: '<svg viewBox="0 0 64 64" fill="none"><path d="M19 9h26v46H19z" stroke="currentColor" stroke-width="1.7"/><path d="M32 17v30" stroke="currentColor" stroke-width="1.7"/><circle cx="32" cy="32" r="2" fill="currentColor"/></svg>',
    brain: '<svg viewBox="0 0 64 64" fill="none"><path d="M31 13c-6-8-17-3-17 5-9 1-10 14-3 18-5 9 2 18 10 17 3 7 11 6 12 0V15c0-2-1-2-2-2Z" stroke="currentColor" stroke-width="1.8"/><path d="M33 13c6-8 17-3 17 5 9 1 10 14 3 18 5 9-2 18-10 17-3 7-11 6-12 0M21 20c6 0 8 5 6 9m-13 6c6-2 10 1 10 6m16-21c-5 0-8 5-6 9m14 6c-6-2-10 1-10 6" stroke="currentColor" stroke-width="1.8"/></svg>',
    motor: '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="1.7"/><circle cx="32" cy="32" r="12" stroke="currentColor" stroke-width="1.7"/><circle cx="32" cy="32" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M32 4v9m0 38v9M4 32h9m38 0h9M12 12l7 7m26 26 7 7m0-40-7 7M19 45l-7 7" stroke="currentColor" stroke-width="1.7"/></svg>',
    download: '<svg viewBox="0 0 64 64" fill="none"><path d="M32 7v34m-12-12 12 12 12-12M10 42v13h44V42" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    mail: '<svg viewBox="0 0 64 64" fill="none"><rect x="7" y="13" width="50" height="38" rx="3" stroke="currentColor" stroke-width="2"/><path d="m9 16 23 19 23-19" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
  };

  // Center circle: compact summary only (symbol, title, one short line).
  // Left-hand card: the full detail for the hovered/focused circle.
  function renderSection(key, { fromHover = false } = {}) {
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
    panelTeaser.textContent = data.teaser;
    panelSymbol.innerHTML = data.symbol ? (symbols[data.symbol] || symbols.lift) : '';
    panelSymbol.hidden = !data.symbol;

    hoverEyebrow.textContent = data.eyebrow;
    hoverIndex.textContent = data.index;
    hoverKicker.textContent = data.kicker;
    hoverTitle.textContent = data.title;
    hoverDescription.textContent = data.description;
    renderBody(data);
    hoverTopics.replaceChildren();
    data.topics.forEach(topic => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.topic = topic;
      button.innerHTML = `${escapeHTML(topic)} <span aria-hidden="true">↗</span>`;
      button.addEventListener('click', () => {
        hoverDetail.textContent = `${topic} — ${topicDescription(key, topic)}`;
      });
      hoverTopics.appendChild(button);
    });
    hoverDetail.textContent = 'Choose a topic to preview this section.';
    hoverInfo.classList.toggle('is-minimal', Boolean(data.minimal));
    document.querySelector('.writing-pane')?.classList.toggle('is-minimal', Boolean(data.minimal));
    renderEmail(data);
    hoverInfo.classList.toggle('is-visible', fromHover);
    hoverInfo.setAttribute('aria-hidden', String(!fromHover));
    document.body.classList.toggle('card-open', fromHover);
  }

  // Full copy for sections that carry a `body` array. The array is split at the
  // sentinel into a left column (intro copy) and a right column, so both columns
  // start at the same height. `LIST` renders the optional module list inside the
  // right column; `LISTMARK` is a plain column break for sections without a list.
  function renderBody(data) {
    if (!data.body) return;
    const marker = data.body.some(b => b === 'LISTMARK') ? 'LISTMARK' : 'LIST';
    const split = data.body.indexOf(marker);
    const cut = split === -1 ? Math.ceil(data.body.length / 2) : split;
    const toMarkup = block => {
      if (block === 'LIST') {
        const heading = data.listHeading ? `<p>${escapeHTML(data.listHeading)}</p>` : '';
        const items = (data.modules || []).map(item => `<li>${escapeHTML(item)}</li>`).join('');
        return `${heading}<ul class="hover-info-list">${items}</ul>`;
      }
      if (block === 'LISTMARK') return '';
      return `<p>${block}</p>`;
    };
    const left = data.body.slice(0, cut).map(toMarkup).join('');
    const right = data.body.slice(cut).map(toMarkup).join('');
    hoverDescription.innerHTML =
      `<div class="col-left">${left}</div><div class="col-right">${right}</div>`;
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

  // Contact panel: the email address replaces the "explore" button, so clicking
  // it opens a message instead of a dialog.
  function renderEmail(data) {
    let link = document.getElementById('hoverEmail');
    if (!data.email) {
      if (link) link.remove();
      hoverAction.hidden = false;
      return;
    }
    hoverAction.hidden = true;
    if (!link) {
      link = document.createElement('a');
      link.id = 'hoverEmail';
      link.className = 'hover-info-email';
      hoverAction.parentNode.insertBefore(link, hoverAction.nextSibling);
    }
    link.href = 'mailto:' + data.email;
    link.textContent = data.email;
  }

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  // Hovering or focusing a circle reveals the detail block on the left.
  // It stays visible afterwards so the user can move over and use its topic
  // links and the explore button — it only changes when another circle is
  // hovered. Nothing auto-hides it.
  const showFor = key => renderSection(key, { fromHover: true });
  const hideCard = () => {
    hoverInfo.classList.remove('is-visible');
    hoverInfo.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('card-open');
  };

  // ---- Landing / first page ---------------------------------------------
  // The navigator stays visible on top of the landing cover. Hovering or
  // focusing a circle flies the big wordmark into the header slot and shows
  // that section's line underneath it.
  let landing, landingLogo, landingCopy, headerLogo;
  let landingFlown = false;
  let pendingSection = null;

  // Resolved when the landing transition is over. The shell waits on this
  // before swapping the header, so the flight always lands on the header that
  // is still in the document.
  let flightDone = null;
  let flightResolve = null;

  const LANDING_LINES = {
    about: 'We bring cognition to AI<br>The next step in agentic intelligence',
    eos: 'Intelligent elevator dispatch and optimisation',
    paia: 'Self-developing intelligent ERP',
    srm: 'Synchronous reluctance positioning motors',
    downloads: 'Documents, releases and tools',
    contact: 'Let\u2019s build something intelligent'
  };

  const SECTION_URLS = {
    about: '/about/',
    eos: '/e-os/',
    paia: '/pat-ia/',
    srm: '/srm-p/',
    downloads: '/projects/',
    contact: '/contact/'
  };

  function settleFlight() {
    if (flightResolve) {
      const resolve = flightResolve;
      flightResolve = null;
      resolve();
    }
  }

  function flyLogo() {
    if (landingFlown || !landing || !landingLogo || !headerLogo) { settleFlight(); return; }
    landingFlown = true;

    // Measure both slots at flight time so the transform is exact.
    const from = landingLogo.getBoundingClientRect();
    const to = headerLogo.getBoundingClientRect();
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    const scale = from.width ? to.width / from.width : 1;

    landingLogo.classList.add('is-flying');
    landing.classList.add('is-flying');
    landingLogo.style.transformOrigin = 'top left';
    landingLogo.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;

    // Keep the header wordmark hidden for the whole flight; it is revealed in
    // `finish()` once the flying one has landed on it.
    document.body.classList.add('landing-flown');

    const finish = () => {
      if (landing.classList.contains('is-done')) { settleFlight(); return; }
      // The flying wordmark has landed: swap it for the real header logo.
      landing.classList.add('is-done');
      landingLogo.style.visibility = 'hidden';
      document.body.classList.remove('landing-active');
      document.body.classList.remove('panel-hidden');
      document.body.classList.add('panel-ready');
      // Drop the first-paint rules in styles.css; from here the plain body
      // classes are the only thing controlling the panel.
      document.documentElement.classList.remove('js', 'cover-up');
      if (pendingSection) {
        renderSection(pendingSection, { fromHover: true });
        pendingSection = null;
      }
      settleFlight();
    };
    landingLogo.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 950);
  }

  function setLandingLine(key) {
    if (!LANDING_LINES[key] || landingFlown || !landingCopy) return;
    landingCopy.classList.add('is-swapping');
    setTimeout(() => {
      landingCopy.innerHTML =
        `<p class="landing-line is-active" data-for="${key}">${LANDING_LINES[key]}</p>`;
      landingCopy.classList.remove('is-swapping');
    }, 180);
  }

  function showSection(key) {
    renderSection(key, { fromHover: true });
  }

  // ---- Mount / unmount ----------------------------------------------------
  let bound = [];
  let mountToken = false;       // has mount() run in this document?
  let mountedMain = null;       // the <main> it was bound to

  function on(target, type, handler, opts) {
    if (!target) return;
    target.addEventListener(type, handler, opts);
    bound.push([target, type, handler, opts]);
  }

  function bindLanding() {
    landing = document.getElementById('landing');
    landingLogo = document.getElementById('landingLogo');
    landingCopy = document.getElementById('landingCopy');
    headerLogo = document.querySelector('.brand-logo');
  }

  function mount(main) {
    // Double-mount guard: a direct load boots this module itself (bottom of
    // this file) and the shell would otherwise mount it a second time when it
    // navigates back to the homepage. Two mounts would mean two sets of
    // listeners on the same nodes.
    if (mountToken && mountedMain === main) return unmount;
    mountToken = true;
    mountedMain = main;

    bound = [];
    landingFlown = false;
    pendingSection = null;
    flightDone = new Promise(resolve => { flightResolve = resolve; });

    bindElements(main);
    bindLanding();

    // Pre-fill the panel with the default section, but keep it hidden until the
    // first page is dismissed — nothing should appear on the landing screen.
    renderSection(activeKey, { fromHover: false });

    // Hide the header wordmark and the left panel while the first page is up.
    // `cover-up` is the switch styles.css uses for this; it is removed in
    // flyLogo()'s finish(), so the panel and header wordmark come back the
    // moment the flying wordmark lands.
    document.body.classList.add('landing-active', 'panel-hidden');
    document.documentElement.classList.add('js', 'cover-up');

    nodes.forEach(node => {
      const key = node.dataset.section;
      on(node, 'mouseenter', () => showFor(key));
      on(node, 'focus', () => showFor(key));
      on(node, 'click', () => showFor(key));
    });

    // Escape hides it for keyboard users; otherwise it persists.
    on(document, 'keydown', event => {
      if (event.key === 'Escape' && hoverInfo && hoverInfo.classList.contains('is-visible')) hideCard();
    });

    // "Explore section" is a navigation to that section's crawlable URL. Under
    // the shell it goes through the router so the sky is preserved.
    on(hoverAction, 'click', () => {
      const target = SECTION_URLS[activeKey];
      if (target) {
        if (window.CognikaShell) {
          window.CognikaShell.go(activeKey === 'downloads' ? '/projects/' : target,
                                 new URL(target, location.href).href,
                                 { push: true, animate: true });
        } else {
          window.location.href = target;
        }
        return;
      }
      // Fallback for any section without a page: keep the old dialog behaviour.
      const data = sections[activeKey];
      dialogEyebrow.textContent = data.eyebrow;
      dialogTitle.textContent = data.title;
      dialogDescription.textContent = data.dialog;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
    on(dialogClose, 'click', () => dialog.close());
    on(dialog, 'click', event => { if (event.target === dialog) dialog.close(); });

    on(mobileToggle, 'click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      document.querySelector('.orbit-stage')?.classList.toggle('mobile-nav-highlight', !isExpanded);
      if (window.matchMedia('(max-width: 460px)').matches) {
        document.querySelector('.orbit-menu')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Hovering a circle starts the flight immediately, but the section panel is
    // only filled and revealed after the wordmark lands.
    nodes.forEach(node => {
      const key = node.dataset.section;
      const begin = () => {
        setLandingLine(key);
        if (!landingFlown) {
          pendingSection = key;
          flyLogo();
        } else {
          showSection(key);
        }
      };
      on(node, 'mouseenter', begin);
      on(node, 'focus', begin);
      on(node, 'click', () => { if (landingFlown) showSection(key); });
    });

    // A refresh can happen with the pointer already resting over a circle, and
    // the browser then never sends a mouseenter: the cover would stay up.
    const hoveredNode = document.querySelector('.orbit-node:hover');
    if (hoveredNode) {
      pendingSection = hoveredNode.dataset.section;
      setLandingLine(pendingSection);
      flyLogo();
    }

    return unmount;
  }

  function unmount() {
    for (const [target, type, handler, opts] of bound) {
      target.removeEventListener(type, handler, opts);
    }
    bound = [];
    mountedMain = null;
    settleFlight();
    document.body.classList.remove('landing-active', 'landing-flown', 'panel-hidden', 'panel-ready', 'card-open');
    document.documentElement.classList.remove('js', 'cover-up');
  }

  // Lets the shell wait for the landing transition before swapping the header.
  function handOff() {
    // Nothing has flown yet (the visitor never hovered a circle): run the same
    // animation now, against the header that is still in the document.
    if (!landingFlown && landing && headerLogo) flyLogo();
    return flightDone || Promise.resolve();
  }

  return { mount: mount, handOff: handOff };
})();

// Direct load of the homepage (a normal page load or a hard refresh): bind now
// against the markup that is already in the document. When the shell navigates
// to this page later it calls mount() itself, so this must only run once.
(function () {
  var main = document.querySelector('body > main');
  if (!main || !main.querySelector('.orbit-menu')) return;
  // index.html already set this in <head> for the first paint; re-assert it so
  // the no-JS rule in styles.css and this boot cannot disagree.
  document.documentElement.classList.add('js');
  window.CognikaHome.mount(main);
})();
