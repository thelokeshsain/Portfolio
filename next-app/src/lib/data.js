/**
 * Static fallback data — used when the backend API is unavailable.
 * SECURITY: No PII (phone numbers) in this file.
 * Phone is intentionally omitted — it lives only in the DB.
 */
export const PORTFOLIO = {
  hero: {
    name: 'Lokesh Sain',
    role: 'Software Engineer',
    description: 'I build scalable, performant web applications with React.js and the MERN stack. Currently crafting great user experiences at 3Handshake Techsoft.',
    email: 'iamlokeshsain@gmail.com',
    // phone: intentionally omitted from frontend bundle — stored in DB only
    location: 'Jaipur, Rajasthan',
    github: 'https://github.com/thelokeshsain',
    linkedin: 'https://linkedin.com/in/thelokeshsain',
    available: true,
    image: null,
  },
  stats: [
    { num: '2+',  label: 'Years Exp.',   bg: 'var(--yellow)', color: '#000' },
    { num: '5',   label: 'Projects',     bg: 'var(--pink)',   color: '#000' },
    { num: '8.29',label: 'CGPA',         bg: 'var(--green)',  color: '#000' },
    { num: '10+', label: 'Technologies', bg: 'var(--blue)',   color: '#fff' },
  ],
  about: [
    "I'm a Software Engineer at 3Handshake Techsoft, promoted from intern to full-time after shipping features that directly improved user experience at scale.",
    "MCA from DY Patil Institute (CGPA 8.29) · BCA from S.S. Jain Subodh PG College (81.64%). I thrive in Agile teams where design and engineering converge.",
  ],
  education: [
    { abbr: 'MCA', name: 'DY Patil Institute of MCA & Management', period: '2023–2025', grade: 'CGPA 8.29/10', bg: 'var(--yellow)', color: '#000' },
    { abbr: 'BCA', name: 'S.S. Jain Subodh PG College',           period: '2020–2023', grade: '81.64%',      bg: 'var(--pink)',   color: '#000' },
  ],
  achievements: [
    { icon: '🏆', title: 'Codeathon Hackathon',     sub: 'MIT-WPU · Apr 2024' },
    { icon: '📜', title: 'Python Programming',       sub: 'IIT Bombay — Spoken Tutorial' },
    { icon: '📜', title: 'HTML Web Development',     sub: 'IIT Bombay — Spoken Tutorial' },
  ],
  experience: [
    {
      id: 1, role: 'Software Engineer', company: '3Handshake Techsoft Pvt. Ltd.',
      location: 'Jaipur, Rajasthan', period: 'Jul 2025 — Present', current: true,
      points: [
        'Promoted to full-time after exceptional internship performance',
        'Architected scalable React.js apps with component-driven design patterns',
        'Improved Core Web Vitals via code splitting, lazy loading & state optimization',
        'Collaborated cross-functionally in Agile/Scrum with backend and design teams',
      ],
    },
    {
      id: 2, role: 'Web Developer Intern', company: '3Handshake Techsoft Pvt. Ltd.',
      location: 'Jaipur, Rajasthan', period: 'Jan 2025 — Jul 2025', current: false,
      points: [
        'Built responsive, accessible interfaces with React.js, HTML5, CSS3, JavaScript',
        'Integrated RESTful APIs with efficient data-fetching and error-handling patterns',
        'Developed atomic component library, reducing new feature dev time by ~30%',
        'Resolved critical production bugs, improving stability and user retention',
      ],
    },
  ],
  projects: [
    { id: 1, title: 'Apna Backup',   file: 'apna-backup/App.jsx',         category: 'Web App',   accentBg: 'var(--yellow)', accentColor: '#000', tagClass: 'tag-y',  period: 'Jan 2025–Now', desc: 'Full-stack secure online backup solution with real-time data sync, intuitive dashboard, and seamless RESTful API integration.', tags: ['React.js', 'REST APIs', 'Responsive'], link: 'https://www.apnabackup.com/', github: null },
    { id: 2, title: 'FoodCourt App', file: 'FoodCourt/MainActivity.java', category: 'Android',   accentBg: 'var(--green)',  accentColor: '#000', tagClass: 'tag-g',  period: 'Oct–Dec 2024', desc: 'Android app streamlining cafeteria food ordering with real-time order tracking, Firebase auth, and Material Design UI.', tags: ['Android', 'Java', 'Firebase'], link: 'https://github.com/thelokeshsain/FoodCourt', github: 'https://github.com/thelokeshsain/FoodCourt' },
    { id: 3, title: 'Sizzling Salon', file: 'Sizzling/index.php',         category: 'Full Stack', accentBg: 'var(--pink)',   accentColor: '#000', tagClass: 'tag-pk', period: 'Feb–Apr 2024', desc: 'Salon management platform with appointment booking, service dashboard, PHP authentication, and normalized MySQL schema.', tags: ['PHP', 'MySQL', 'Full Stack'], link: 'https://github.com/thelokeshsain/Sizzling', github: 'https://github.com/thelokeshsain/Sizzling' },
    { id: 4, title: 'Weather App',    file: 'weather-app/index.js',        category: 'Web App',   accentBg: 'var(--blue)',   accentColor: '#fff', tagClass: 'tag-bl', period: '2024', desc: 'Real-time weather application with location search, beautiful weather visuals, and live 7-day forecast data.', tags: ['JavaScript', 'Weather API', 'CSS'], link: 'https://weatherappbylokesh.netlify.app/', github: null },
    { id: 5, title: 'GitHub Finder',  file: 'github-finder/app.js',        category: 'Web App',   accentBg: 'var(--purple)', accentColor: '#fff', tagClass: 'tag-pu', period: '2024', desc: 'Search and explore any GitHub user — repos, followers, bio, and contribution stats in a clean, fast interface.', tags: ['JavaScript', 'GitHub API', 'CSS'], link: 'https://githubuserbylokesh.netlify.app/', github: null },
  ],
  skills: {
    Frontend: ['React.js', 'HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS', 'React Hooks', 'Context API', 'Responsive Design'],
    Backend:  ['Node.js', 'Express.js', 'REST APIs', 'PHP', 'Python', 'API Integration'],
    Database: ['MongoDB', 'MySQL', 'SQL'],
    Tools:    ['Git', 'GitHub', 'VS Code', 'Postman', 'Figma', 'Android Studio', 'Chrome DevTools'],
  },
  coreStack: ['React.js', 'Node.js', 'MongoDB', 'MySQL', 'JavaScript', 'Git', 'REST APIs'],
  sections: { hero: true, about: true, experience: true, projects: true, skills: true, contact: true },
}
