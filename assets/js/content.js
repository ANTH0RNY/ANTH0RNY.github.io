/* =====================================================================
   CONTENT — everything the magazine says lives in this file.
   Edit text here; layout and page numbers update themselves.

   Confidentiality rules (see README): no phone number, no current
   employer name, no client/site/product names beyond the ones allowed,
   no invented links, metrics or screenshots.
   ===================================================================== */

window.SITE = {
  masthead: 'NJERU',
  name: 'Anthony Njeru',
  altName: 'Anthony Nyaga',            // the name on LinkedIn
  role: 'Software & Monitoring Engineer',
  location: 'Nairobi, Kenya',
  issue: 'No. 01',
  date: '2026',
  email: 'nyaganthony@gmail.com',
  website: 'anth0rny.github.io',
  github: { label: 'github.com/ANTH0RNY', url: 'https://github.com/ANTH0RNY' },
  linkedin: { label: 'in/anthony-nyaga-4137a6234', url: 'https://www.linkedin.com/in/anthony-nyaga-4137a6234' },
  // Path to the downloadable CV (e.g. 'cv/anthony-njeru-cv.pdf').
  // Leave null to hide every CV button. Only link a PDF that passes the
  // confidentiality rules.
  cv: null
};

/* Project text. Every project is laid out as one `single` page. */
const P = {
  m365: {
    n: '01', title: 'Microsoft 365 <em>Collector</em>', plain: 'Microsoft 365 monitoring collector',
    eyebrow: 'Monitoring · Backend service', plate: 'metrics', kanji: '監視',
    cap: 'Metric ridgelines, one per tenant',
    deck: 'A Python service that collects Microsoft 365 data from many client tenants through Microsoft Graph and publishes it as Prometheus metrics. It replaced an older Zabbix setup.',
    specs: [['Period', '2026'], ['Built at', 'Managed service provider'], ['Role', 'Monitoring & automation engineer'], ['Type', 'Backend service']],
    highlights: [
      'Watches licences, sign-ins, mailbox and OneDrive storage, mail traffic, service health, Secure Score and expiring app credentials.',
      'An async scheduler runs each collector per tenant. The Graph client handles retries, throttling, pagination and concurrency, and config changes apply live.',
      'Checks each tenant’s real permissions first: missing ones are skipped and reported, not fatal. Health signals separate auth failures from permission gaps and stale data.',
      'Secrets are encrypted at rest and scrubbed from logs. Typed with mypy, tested against mocked Graph responses, shipped by CI/CD to staging and production.'
    ],
    stack: ['Python 3.12', 'asyncio', 'httpx', 'FastAPI', 'Pydantic', 'Prometheus', 'SQLite', 'Docker', 'Gitea Actions', 'Portainer', 'Microsoft Graph', 'Entra ID']
  },
  ot: {
    n: '02', title: 'OT/PLC <em>Monitoring</em>', plain: 'OT/PLC monitoring pilot',
    eyebrow: 'Monitoring · Industrial', plate: 'network', kanji: '制御',
    cap: 'Discovery from the switch side',
    deck: 'A passive asset-discovery and health-monitoring agent for industrial controllers (PLCs). It never actively scans the control network, so it can’t put a live process at risk.',
    specs: [['Period', '2026 – present'], ['Built at', 'Managed service provider'], ['Role', 'Monitoring & automation engineer'], ['Status', 'Pilot, in progress']],
    highlights: [
      'Discovers devices from the switch side (SNMPv3 MAC/ARP tables, LLDP/CDP neighbours and a passive listener) instead of port-scanning.',
      'Identifies controllers and modules over EtherNet/IP/CIP, strictly read-only: catalog number, hardware series and firmware revision.',
      'Maps status to healthy, degraded, faulted or unknown, and records changes such as a firmware update as events, separate from alarms.',
      'Matches devices against vendor CSAF advisories and the CISA KEV list, down to hardware series. Runs in hardened, read-only containers.'
    ],
    stack: ['Python', 'FastAPI', 'SQLite + Alembic', 'Docker Compose', 'Netdisco', 'SNMPv3', 'LLDP/CDP', 'EtherNet/IP · CIP (pylogix)', 'CSAF', 'CISA KEV']
  },
  vmware: {
    n: '03', title: 'vmware-<em>automation</em>', plain: 'vmware-automation',
    eyebrow: 'Infrastructure · Internal tool', plate: 'clones', kanji: '仮想',
    cap: 'One golden template, many clones',
    deck: 'An internal tool that provisions client VMs on VMware vSphere from a Linux template, then patches the OS and installs the software each client needs.',
    specs: [['Period', '2026'], ['Built at', 'Managed service provider'], ['Role', 'Monitoring & automation engineer'], ['Scope', 'Internal tooling']],
    highlights: [
      'Clones VMs from a hardened Linux golden template through the vCenter API; SSH host keys and machine-id are regenerated per clone.',
      'Updates the OS on first build, so new VMs start fully patched.',
      'Installs each client’s software from that client’s requirements, so builds are repeatable.',
      'Walks the vCenter inventory (datacenters, clusters, hosts, folders) to place each VM correctly.'
    ],
    stack: ['Python', 'pyVmomi', 'uv', 'VMware vSphere / vCenter', 'Linux']
  },
  cms: {
    n: '04', title: 'Construction <em>Management</em>', plain: 'Construction Management System',
    eyebrow: 'Full-stack · Multi-tenant platform', plate: 'contour', kanji: '建設',
    cap: 'Site boundaries as polygons',
    deck: 'A multi-tenant platform for construction companies to run their sites, workforce, permits, safety and documents, with each company’s data kept apart.',
    specs: [['Period', 'Oct 2025 – Jan 2026'], ['Built at', 'Regional Business Connection'], ['Role', 'Software developer'], ['Status', 'Project paused']],
    highlights: [
      'Access scoped to the company or to individual sites, through role-based access control and custom authorization policies.',
      'Licence and permit lifecycle tracking with full change history and expiry monitoring.',
      'Workforce management, an HSE risk register, site inspections and Gantt-style scheduling, with site boundaries stored as PostGIS polygons.',
      'Documents in S3-compatible object storage with GraphQL uploads, and sign-in through OpenID Connect.'
    ],
    stack: ['C#', 'ASP.NET Core', 'EF Core', 'HotChocolate GraphQL', 'PostgreSQL + PostGIS', 'MinIO', 'OpenIddict', 'React', 'TypeScript', 'Docker']
  },
  edms: {
    n: '05', title: 'Document <em>Management</em>', plain: 'Electronic Document Management System',
    eyebrow: 'Full-stack · EDMS', plate: 'tree', kanji: '文書',
    cap: 'A folder tree as ltree paths',
    deck: 'A multi-tenant document management system with a folder hierarchy, tags, versioning and access control.',
    specs: [['Period', 'Oct 2025 – Feb 2026'], ['Built at', 'Regional Business Connection'], ['Role', 'Software developer'], ['Scope', 'Backend & frontend']],
    highlights: [
      'Folders stored as PostgreSQL ltree paths: subtree queries are fast, and a rename updates every descendant in one go.',
      'Tagging, file versioning and per-tenant access control, with files in S3-compatible object storage (MinIO/RustFS).',
      'In-browser preview of Word and Excel files, server-side conversion to PDF, and streamed downloads of large files.',
      'React frontend with OIDC login. GraphQL runs in a Web Worker so the UI stays responsive.'
    ],
    stack: ['C#', 'ASP.NET Core', 'EF Core', 'HotChocolate GraphQL', 'PostgreSQL (ltree)', 'MinIO / RustFS', 'React', 'Vite', 'TypeScript', 'urql', 'oidc-client-ts']
  },
  county: {
    n: '06', title: 'County <em>Management</em>', plain: 'County management system',
    eyebrow: 'Frontend · Trans Nzoia County', plate: 'ledger', kanji: '歳入',
    cap: 'Revenue streams, month by month',
    deck: 'A unified platform for Trans Nzoia County’s revenue collection and employee management. I built the Vue frontend; the backend was built by another team.',
    specs: [['Period', 'Oct 2025 – Jan 2026'], ['Built at', 'Regional Business Connection'], ['Role', 'Frontend developer'], ['Backend', 'Laravel, by another team']],
    highlights: [
      'Built the Vue frontend for revenue collection and employee management.',
      'Screens for configuring revenue streams (schedules, sections, classes and items), so the county defines and prices its own fees and charges.',
      'Revenue collection and reporting views, plus the employee management module.'
    ],
    stack: ['Vue (my part)', 'Laravel backend by another team']
  },
  sacco: {
    n: '07', title: 'SACCO <em>Management</em>', plain: 'SACCO management system',
    eyebrow: 'Frontend · Finance', plate: 'coins', kanji: '貯蓄',
    cap: 'Contributions, stacked',
    deck: 'A full management system for a savings and credit cooperative (SACCO). I built the React frontend for the whole system; the backend was built by another team.',
    specs: [['Period', 'Nov 2025 – Jan 2026'], ['Built at', 'Regional Business Connection'], ['Role', 'Frontend developer'], ['Backend', 'Laravel, by another team']],
    highlights: [
      'Member contribution screens across several contribution types, with reports.',
      'Loan products, loan applications, guarantors and repayment tracking.',
      'Staff management with role-based views, plus financial accounts and accounting reports.'
    ],
    stack: ['React', 'TypeScript (my part)', 'Laravel backend by another team']
  },
  property: {
    n: '08', title: 'Property <em>Management</em>', plain: 'Property management system',
    eyebrow: 'Frontend · Real estate', plate: 'blocks', kanji: '住',
    cap: 'Units, lit by occupancy',
    deck: 'A property management platform for landlords and property managers. I built the React frontend for the whole platform; the backend was built by another team.',
    specs: [['Period', 'Oct – Nov 2025'], ['Built at', 'Regional Business Connection'], ['Role', 'Frontend developer'], ['Backend', 'Django, by another team']],
    highlights: [
      'Tenant and landlord management, rent tracking and landlord payments.',
      'Occupancy tracking and property analytics dashboards.',
      'Visitor logs, and maintenance requests with reports.'
    ],
    stack: ['React', 'TypeScript (my part)', 'Django backend by another team']
  },
  nakuru: {
    n: '09', title: 'Physical <em>Planning</em>', plain: 'Physical planning system',
    eyebrow: 'Frontend · Nakuru County', plate: 'plan', kanji: '計画',
    cap: 'A plan, waiting for approval',
    deck: 'A system for submitting, reviewing and approving building and development permit applications for Nakuru County. I built the React frontend; the backend was built by another team.',
    specs: [['Period', '2025'], ['Built at', 'Regional Business Connection'], ['Role', 'Frontend developer'], ['Backend', 'Django, by another team']],
    highlights: [
      'Built the React frontend for the permit application and approval workflow.',
      'Screens for each stage of a multi-stage approval, with role-based review by different departments.',
      'Tracking of applications, documents and statuses.'
    ],
    stack: ['React (my part)', 'Django backend by another team']
  },
  events: {
    n: '10', title: 'Event <em>Management</em>', plain: 'Event Management System',
    eyebrow: 'Backend · Built from scratch', plate: 'seats', kanji: '催',
    cap: 'Seats, tickets, attendees',
    deck: 'A full event management platform covering events, ticketing and attendees, built from scratch during my attachment. I also mentored the junior attachés.',
    specs: [['Period', 'Jun – Aug 2024'], ['Built at', 'MCB Technologies'], ['Role', 'Software developer attaché'], ['Scope', 'Full platform']],
    highlights: [
      'Data model for events, tickets, attendees, users and roles, with versioned FluentMigrator migrations and auto-updated timestamps.',
      'Authentication with ASP.NET Core Identity and JWT access tokens.',
      'Permission-based authorization through custom policy handlers.',
      'GraphQL API with structured error handling.'
    ],
    stack: ['C#', 'ASP.NET Core', 'ASP.NET Core Identity', 'JWT', 'FluentMigrator', 'SQL Server', 'HotChocolate GraphQL', 'React', 'TypeScript']
  },
  plant: {
    n: '11', title: 'Plant Disease <em>Detection</em>', plain: 'AI plant disease detection',
    eyebrow: 'Capstone · Computer vision', plate: 'leaf', kanji: '葉',
    photo: 'assets/img/plant-segmentation.jpg',
    alt: 'A greenhouse photo of tomato rows. The model has masked individual leaves in blue and labelled each one: most are healthy, a few show bacterial spot, leaf mould or yellow leaf curl virus.',
    cap: 'Leaves segmented and labelled in the greenhouse',
    inset: {
      src: 'assets/img/plant-greenhouse-display.jpg',
      alt: 'The greenhouse unit’s touchscreen, lit green on the bench, showing temperature and humidity bars, a 50% reading, a ring gauge and a photo of tomato plants.',
      cap: 'The greenhouse display'
    },
    deck: 'My final-year capstone: spotting tomato leaf diseases and pests from photos inside a smart greenhouse platform, and telling the grower how to manage each one.',
    specs: [['Period', 'Oct 2024 – May 2025'], ['Built at', 'JKUAT'], ['Role', 'Final-year capstone'], ['Degree', 'B.Sc. Electronics & Computer Eng.']],
    highlights: [
      'Trained a CNN on PlantVillage with TensorFlow/Keras, de-duplicating across train and test sets and evaluating with a confusion matrix; converted it to TF Lite for on-device use.',
      'Used YOLOv5 and Segment Anything (SAM) to isolate individual leaves in real greenhouse photos, as in Fig. 11.',
      'A Flask API returns predictions with segmentation masks and class labels drawn over the image.',
      'Looks up a description and management practices for each detected disease or pest.'
    ],
    stack: ['Python', 'TensorFlow', 'Keras', 'TF Lite', 'YOLOv5', 'Segment Anything', 'OpenCV', 'NumPy', 'Flask']
  },
  agri: {
    n: '12', title: 'Smart <em>Irrigation</em>', plain: 'Smart irrigation system',
    eyebrow: 'Embedded · University project', plate: 'drip', kanji: '灌漑',
    cap: 'Soil moisture against the threshold',
    deck: 'An Arduino-based system that monitors soil conditions and automates irrigation, with SMS alerts and Bluetooth control.',
    specs: [['Period', 'Apr – May 2025'], ['Built at', 'JKUAT'], ['Role', 'University embedded-systems project'], ['Type', 'Two-board system']],
    highlights: [
      'Two Arduinos talking over serial: a field unit runs soil-moisture sensing and the pump, and a hub drives the LCD, Bluetooth and GSM.',
      'Irrigates automatically on soil-moisture thresholds.',
      'SMS alerts over GSM (SIM800L), and monitoring and manual control from a phone over Bluetooth (HC-05).',
      'Temperature sensing and ventilation control modelled and simulated alongside the hardware.'
    ],
    stack: ['Arduino (C/C++)', 'SIM800L GSM', 'HC-05 Bluetooth', '16×2 I2C LCD', 'Soil-moisture sensor', 'Relay-driven pump']
  },
  gearbox: {
    n: '13', title: 'Hardware <em>Prototypes</em>', plain: 'Hardware prototypes',
    eyebrow: 'Prototyping · Gearbox Industries', plate: 'wire', kanji: '試作',
    cap: 'An enclosure in wireframe',
    deck: 'Hardware prototyping across mechanical design, embedded systems and the web, during my engineering attachment.',
    specs: [['Period', 'May – Aug 2022'], ['Built at', 'Gearbox Industries'], ['Role', 'Engineering attaché'], ['Scope', 'Mechanical, embedded, web']],
    highlights: [
      '3D modelling of prototype parts and enclosures in Fusion 360.',
      'Embedded system design with Arduino and ESP32.',
      'Flask web application development.'
    ],
    stack: ['Fusion 360', 'Arduino', 'ESP32', 'C/C++', 'Python', 'Flask']
  },
  habit: {
    n: '14', title: 'Habit <em>Tracker</em>', plain: 'Habit tracker',
    eyebrow: 'Personal · Full-stack', plate: 'habits', kanji: '習慣',
    cap: 'Seven rows, one per weekday',
    deck: 'A goal-based habit tracker where each goal has measurable habits that are logged and charted over time.',
    specs: [['Period', 'Jun – Jul 2026'], ['Type', 'Personal project'], ['Built with', 'Nuxt 4, PostgreSQL']],
    highlights: [
      'Goals with a start month and duration, each with habits typed as yes/no, number or duration, and a chart type to match.',
      'Weekly habit schedules stored as a 7-bit day mask.',
      'One typed schema and validation shared between server and client (Drizzle ORM and Zod), with seed tasks for demo data.',
      'Query-string validation on server routes.'
    ],
    stack: ['Nuxt 4', 'Vue 3', 'TypeScript', 'Nuxt UI', 'Tailwind CSS', 'Drizzle ORM', 'PostgreSQL', 'Zod', 'NuxtHub', 'pnpm']
  },
  mpesa: {
    n: '15', title: 'M-Pesa <em>Paybill</em>', plain: 'M-Pesa Daraja Paybill integration',
    eyebrow: 'Personal · Payments', plate: 'ticker', kanji: '決済',
    cap: 'Receipts from the callback',
    deck: 'A Python service that takes M-Pesa payments through Safaricom’s Daraja API and records each transaction.',
    specs: [['Period', 'Mar 2026'], ['Type', 'Personal project'], ['Built with', 'Python, Flask']],
    highlights: [
      'OAuth token handling and STK Push (Lipa na M-Pesa Online) requests.',
      'A callback endpoint that parses payment results and captures the M-Pesa receipt ID, amount and phone number.',
      'Handles successful, failed and cancelled payments; tested against the Daraja sandbox.'
    ],
    stack: ['Python', 'Flask', 'Safaricom Daraja API', 'ngrok for local testing']
  },
  homelab: {
    n: '16', title: 'Raspberry Pi <em>Homelab</em>', plain: 'Raspberry Pi homelab',
    eyebrow: 'Personal · Self-hosting', plate: 'board', kanji: '自宅',
    cap: 'Traces, vias and a 40-pin header',
    deck: 'A self-hosted homelab on a Raspberry Pi that runs several services on the local network under friendly names.',
    specs: [['Period', '2025 – present'], ['Type', 'Personal project'], ['Runs on', 'Raspberry Pi, Docker']],
    highlights: [
      'Wildcard local DNS, so each service gets its own subdomain.',
      'Caddy reverse proxy that routes by hostname and serves TLS from an internal CA.',
      'Docker-hosted services, including a self-hosted project management tool (Plane).',
      'Headless remote desktop (VNC on Wayland), and USB-camera photo and video capture over SSH with ffmpeg.'
    ],
    stack: ['Raspberry Pi OS', 'Docker', 'Caddy', 'dnsmasq / Pi-hole', 'VNC', 'ffmpeg', 'Linux']
  },
  cvmaker: {
    n: '17', title: 'CV <em>Maker</em>', plain: 'CV Maker app',
    eyebrow: 'Personal · Frontend', plate: 'pages', kanji: '履歴書',
    cap: 'Editor on the left, preview on the right',
    deck: 'A React app for creating and editing CVs with a live preview.',
    specs: [['Period', 'Apr – May 2024'], ['Type', 'Personal project'], ['Built with', 'React']],
    highlights: [],
    stack: ['React', 'JavaScript', 'CSS']
  }
};
window.PROJECTS = P;

/* Chapters of the Work section, in order. `first` is the page id each starts on. */
window.CHAPTERS = [
  { n: '01', id: 'ch-monitoring', name: 'Monitoring & Infrastructure', short: 'Monitoring', first: 'm365', items: ['m365', 'ot', 'vmware'] },
  { n: '02', id: 'ch-web', name: 'Web & Backend Systems', short: 'Systems', first: 'ch-web', items: ['cms', 'edms', 'county', 'sacco', 'property', 'nakuru', 'events'] },
  { n: '03', id: 'ch-bench', name: 'Academic & Hardware', short: 'Bench', first: 'ch-bench', items: ['plant', 'agri', 'gearbox'] },
  { n: '04', id: 'ch-personal', name: 'Personal', short: 'Personal', first: 'ch-personal', items: ['habit', 'mpesa', 'homelab', 'cvmaker'] }
];

/* Bottom-bar sections. A page belongs to the section named in its `section`. */
window.SECTIONS = ['Cover', 'Profile', 'Career', 'Work', 'Contact'];

/* =====================================================================
   PAGES — in reading order. The count must stay even, so the back cover
   lands alone on the last leaf. Every project fits on one page.
   ===================================================================== */
window.PAGES = [
  { id: 'cover', type: 'cover', theme: 'red', section: 'Cover' },
  { id: 'contents', type: 'contents', theme: 'paper', section: 'Cover' },
  { id: 'preface', type: 'letter', theme: 'paper', section: 'Profile' },
  { id: 'portrait', type: 'portrait', theme: 'dark', section: 'Profile' },
  { id: 'profile', type: 'profile', theme: 'paper', section: 'Profile' },
  { id: 'experience', type: 'experience', theme: 'dark', section: 'Career' },
  { id: 'languages', type: 'languages', theme: 'paper', section: 'Career' },
  { id: 'skills', type: 'skills', theme: 'dark', section: 'Career' },
  { id: 'education', type: 'education', theme: 'paper', section: 'Career' },
  { id: 'work', type: 'opener', theme: 'red', section: 'Work' },
  { id: 'm365', type: 'single', project: 'm365', theme: 'dark', section: 'Work' },
  { id: 'ot', type: 'single', project: 'ot', theme: 'paper', section: 'Work', alt: true },
  { id: 'vmware', type: 'single', project: 'vmware', theme: 'dark', section: 'Work' },
  { id: 'ch-web', type: 'chapter', chapter: 1, theme: 'deep', section: 'Work', word: 'SYSTEMS' },
  { id: 'cms', type: 'single', project: 'cms', theme: 'paper', section: 'Work' },
  { id: 'edms', type: 'single', project: 'edms', theme: 'dark', section: 'Work', alt: true },
  { id: 'county', type: 'single', project: 'county', theme: 'paper', section: 'Work' },
  { id: 'sacco', type: 'single', project: 'sacco', theme: 'dark', section: 'Work' },
  { id: 'property', type: 'single', project: 'property', theme: 'paper', section: 'Work', alt: true },
  { id: 'nakuru', type: 'single', project: 'nakuru', theme: 'dark', section: 'Work' },
  { id: 'events', type: 'single', project: 'events', theme: 'paper', section: 'Work', alt: true },
  { id: 'ch-bench', type: 'chapter', chapter: 2, theme: 'deep', section: 'Work', word: 'BENCH' },
  { id: 'plant', type: 'single', project: 'plant', theme: 'dark', section: 'Work' },
  { id: 'agri', type: 'single', project: 'agri', theme: 'paper', section: 'Work', alt: true },
  { id: 'gearbox', type: 'single', project: 'gearbox', theme: 'dark', section: 'Work' },
  { id: 'ch-personal', type: 'chapter', chapter: 3, theme: 'deep', section: 'Work', word: 'PERSONAL', deck: 'Built on my own time' },
  { id: 'habit', type: 'single', project: 'habit', theme: 'paper', section: 'Work' },
  { id: 'mpesa', type: 'single', project: 'mpesa', theme: 'dark', section: 'Work', alt: true },
  { id: 'homelab', type: 'single', project: 'homelab', theme: 'paper', section: 'Work' },
  { id: 'cvmaker', type: 'single', project: 'cvmaker', theme: 'dark', section: 'Work', alt: true },
  { id: 'quote', type: 'quote', theme: 'red', section: 'Work' },
  { id: 'contact', type: 'contact', theme: 'red', section: 'Contact' },
  { id: 'colophon', type: 'colophon', theme: 'paper', section: 'Contact' },
  { id: 'back', type: 'back', theme: 'dark', section: 'Contact' }
];

/* ----- page copy ----- */
window.COPY = {
  cover: {
    top: ['The Portfolio Issue', 'Nairobi'],
    lineBig: '<em>Watching</em><br>the wires',
    line: 'Anthony Njeru on software that is safe to run, from Microsoft 365 tenants to industrial controllers',
    inside: 'M365 Collector · OT/PLC Pilot · Construction Platform · Plant Disease AI'
  },
  letter: {
    head: 'Preface', kanji: '序',
    title: 'From circuits <em>to systems</em>',
    body: [
      'I’m a software engineer in Nairobi with an education in Electronics & Computer Engineering. I started with circuit boards, Arduino sketches and Fusion 360 designs, and kept moving up the stack.',
      'I’ve designed and built full-stack and backend systems with .NET, Python, Vue and React for construction, local government, finance and real estate.',
      'These days I work on infrastructure and operational-technology monitoring: collecting Microsoft 365 data across many tenants, passively monitoring industrial controllers, and automating VM provisioning. I care about clean architecture, systems that are safe to run, and engineering that solves the real problem. To me, innovation is a better design that survives production.'
    ]
  },
  portrait: {
    meta: [['Based in', 'Nairobi, Kenya'], ['Practice', 'Full-stack, monitoring, OT'], ['Trained', 'Electronics & Computer Eng.']]
  },
  profile: {
    head: 'The Profile', kanji: '未来',
    title: 'Systems that are <em>safe to run</em>',
    deck: 'I design and build backends, frontends and the monitoring that watches them, and I still know my way around a breadboard.',
    pull: 'Engineering that solves the real problem.',
    themes: [
      ['Full-stack', '.NET and Python on the backend, Vue and React on the front. Multi-tenant platforms for construction, local government, finance and real estate.'],
      ['Monitoring', 'Zabbix, Prometheus and Grafana: collectors, templates, dashboards and the alert rules that make them useful.'],
      ['OT / ICS', 'Passive discovery and health monitoring for industrial controllers, built on one rule: never put the control network at risk.'],
      ['Hardware', 'Arduino, ESP32, GSM and Bluetooth modules, and 3D design in Fusion 360. It is where I started, and where I still try new ideas.'],
      ['Off the clock', 'Cooking, gardening, football and anime.']
    ]
  },
  experience: {
    head: 'Experience', kanji: '経歴',
    title: 'Four roles, <em>one direction</em>',
    roles: [
      { period: 'Sep 2026 – present', role: 'Monitoring & Automation Engineer', org: 'Managed service provider (MSP)', where: 'Nairobi',
        points: [
          'Built a multi-tenant Microsoft 365 monitoring collector (Python, Microsoft Graph, Prometheus) to replace an older Zabbix setup.',
          'Building a passive OT/PLC asset-discovery and health-monitoring pilot for an industrial control network.',
          'Built a tool that provisions client VMs on vSphere from a Linux template and installs each client’s software.',
          'Built a white-labelled Zabbix Windows agent and MSI installer, custom templates and VMware dashboards; automated Zabbix deployment and upgrades.'
        ] },
      { period: 'Aug 2025 – Jan 2026', role: 'Software Developer', org: 'Regional Business Connection', where: 'Westlands, Nairobi',
        points: [
          'Built a multi-tenant Construction Management System and an Electronic Document Management System (.NET, GraphQL, PostgreSQL, React).',
          'Frontend developer on county systems for Trans Nzoia (Vue) and Nakuru (React), a SACCO system and a property management system (React).'
        ] },
      { period: 'Jun – Aug 2024', role: 'Software Developer Attaché', org: 'MCB Technologies', where: 'Nairobi',
        points: ['Built a full Event Management System from scratch (ASP.NET Core, GraphQL) and mentored junior attachés.'] },
      { period: 'May – Aug 2022', role: 'Engineering Attaché', org: 'Gearbox Industries', where: 'Industrial Area, Nairobi',
        points: ['Hardware prototyping: Fusion 360 modelling, Arduino/ESP32 embedded systems and a Flask web app.'] }
    ]
  },
  languages: {
    head: 'Languages', kanji: '言語',
    title: 'Spoken and <em>compiled</em>',
    // [Simple Icons slug (see logos.js) or null, name, where I use it]
    code: [
      ['python', 'Python', 'Collectors, automation and ML'],
      ['csharp', 'C#', 'ASP.NET Core backends'],
      ['typescript', 'TypeScript', 'React, Vue and Nuxt frontends'],
      ['javascript', 'JavaScript', 'The browser and Node.js'],
      ['cplusplus', 'C / C++', 'Arduino and ESP32 firmware'],
      ['gnubash', 'Bash', 'Linux automation'],
      [null, 'SQL', 'PostgreSQL, SQL Server, SQLite']
    ],
    tools: [
      ['dotnet', 'ASP.NET'], ['react', 'React'], ['vuedotjs', 'Vue'], ['nuxt', 'Nuxt'], ['fastapi', 'FastAPI'],
      ['flask', 'Flask'], ['django', 'Django'], ['graphql', 'GraphQL'], ['postgresql', 'PostgreSQL'], ['sqlite', 'SQLite'],
      ['docker', 'Docker'], ['kubernetes', 'Kubernetes'], ['prometheus', 'Prometheus'], ['grafana', 'Grafana'], ['linux', 'Linux'],
      ['gitea', 'Gitea'], ['tensorflow', 'TensorFlow'], ['opencv', 'OpenCV'], ['arduino', 'Arduino'], ['espressif', 'ESP32']
    ],
    spoken: [['English', 'Fluent, professional'], ['Kiswahili', 'Native']]
  },
  skills: {
    head: 'Skills', kanji: '技術',
    title: 'Tools of <em>the trade</em>',
    groups: [
      ['Backend', 'ASP.NET Core · Entity Framework Core · HotChocolate GraphQL · FastAPI · Flask · Django · Node.js'],
      ['Frontend', 'React · Vue · Nuxt · Vite · Tailwind CSS'],
      ['Data & storage', 'PostgreSQL (PostGIS, ltree) · SQL Server · SQLite · MinIO / S3-compatible storage'],
      ['Monitoring', 'Zabbix · Prometheus · Grafana · SNMP · Microsoft Graph'],
      ['Infra & DevOps', 'Docker · Docker Compose · Kubernetes (KCNA) · Linux · VMware vSphere · Gitea Actions CI/CD · Portainer · Caddy'],
      ['Identity & security', 'OpenID Connect (OpenIddict, oidc-client-ts) · JWT · Entra ID / Azure AD · RBAC'],
      ['OT / industrial', 'EtherNet/IP & CIP · PLC asset discovery · CSAF advisories · CISA KEV'],
      ['Design', 'System and API design · Database schema design · Multi-tenant architecture · 3D design (Fusion 360)'],
      ['ML & vision', 'TensorFlow · Keras · TF Lite · YOLOv5 · Segment Anything (SAM) · OpenCV'],
      ['Hardware', 'Arduino · ESP32 · GSM & Bluetooth modules · Fusion 360']
    ]
  },
  education: {
    head: 'Education', kanji: '学歴',
    title: 'Education & <em>certification</em>',
    items: [
      { period: '2020 – 2025', title: 'B.Sc. Electronics & Computer Engineering', org: 'Jomo Kenyatta University of Agriculture and Technology (JKUAT)',
        note: 'Programme accredited by the Engineers Board of Kenya (EBK). Capstone: automated plant disease detection in a smart greenhouse management platform.', goto: 'plant' },
      { period: '2016 – 2020', title: 'Kenya Certificate of Secondary Education', org: 'Lenana School, Nairobi', note: 'Grade A− (minus).' }
    ],
    certs: [{ title: 'Kubernetes and Cloud Native Associate', abbr: 'KCNA', org: 'CNCF / Linux Foundation' }]
  },
  opener: {
    small: 'Selected',
    word: 'WORK',
    deck: '<em>Seventeen projects</em> in four chapters: monitoring, systems, the bench, and things built for myself.'
  },
  contact: {
    head: 'Contact', kanji: '連絡',
    title: 'Get in <em>touch</em>',
    lead: 'Whether you have a question or a project, or just want to say hello, my inbox is open and I’ll do my best to reply.'
  },
  colophon: {
    head: 'Colophon', kanji: '奥付',
    rows: [
      ['Publisher', 'Anthony Njeru, Nairobi'],
      ['Issue', 'No. 01, 2026'],
      ['Type', 'Bodoni Moda, Archivo and Noto Serif JP'],
      ['Built with', 'HTML, CSS, a little JavaScript and your scroll wheel'],
      ['Hosted on', 'GitHub Pages'],
      ['Plates', 'Drawn by code on every visit, except Figs. 11 and 11b: real photos from the capstone'],
      ['Logos', 'Simple Icons (CC0); the marks belong to their owners'],
      ['Okuzuke', 'The Japanese colophon, traditionally on the last page']
    ]
  },
  quote: {
    text: 'Clean architecture, systems that are <em>safe to run</em>, and engineering that solves the <em>real problem</em>.',
    by: 'Anthony Njeru'
  },
  back: { tag: 'Software that is safe to run.' }
};
