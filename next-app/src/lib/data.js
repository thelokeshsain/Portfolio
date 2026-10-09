/**
 * Static fallback data — used when the backend API is unavailable.
 * SECURITY: No PII (phone numbers) in this file.
 * Phone is intentionally omitted — it lives only in the DB.
 */
export const PORTFOLIO = {
  hero: {
    name: 'Lokesh Sain',
    role: 'Software Engineer',
    description: 'I build responsive web applications with React.js, integrate LLM APIs into product features, and enjoy solving real-world problems with clean, scalable and user-friendly solutions.',
    email: 'iamlokeshsain@gmail.com',
    // phone: intentionally omitted from frontend bundle — stored in DB only
    location: 'Jaipur, Rajasthan',
    github: 'https://github.com/thelokeshsain',
    linkedin: 'https://www.linkedin.com/in/thelokeshsain/',
    instagram: 'https://www.instagram.com/thelokeshsain/',
    x: 'https://x.com/thelokeshsain',
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
    "I'm Lokesh Sain, a full-stack software engineer based in Jaipur, India. I enjoy building web applications that are reliable, user-friendly and solve real problems. I'm especially interested in modern web technologies, scalable architectures and practical use cases of AI/LLM APIs in everyday products.",
  ],
  education: [
    { abbr: 'MCA', name: 'DY Patil Institute of MCA & Management', period: '2023–2025', grade: 'CGPA 8.29/10', bg: 'var(--yellow)', color: '#000' },
    { abbr: 'BCA', name: 'S.S. Jain Subodh PG College',           period: '2020–2023', grade: '81.64%',      bg: 'var(--pink)',   color: '#000' },
  ],
  achievements: [
    { icon: '', title: 'Codeathon Hackathon',     sub: 'MIT-WPU · Apr 2024' },
    { icon: '', title: 'Python Programming',       sub: 'IIT Bombay — Spoken Tutorial' },
    { icon: '', title: 'HTML Web Development',     sub: 'IIT Bombay — Spoken Tutorial' },
  ],
  experience: [
    {
      id: 1, role: 'Software Engineer', company: '3Handshake Techsoft Private Limited',
      location: 'Jaipur, Rajasthan', period: 'Jul 2025 – Present', current: true, type: 'Full-time',
      points: [
        'Building and maintaining web applications in React.js.',
        'Integrated LLM-powered image generation using OpenRouter API with Gemini.',
        'Used AI-assisted development tools (OpenAI Codex, Google Antigravity).',
        'Reduced page load time through lazy loading and improved user experience.',
      ],
    },
    {
      id: 2, role: 'Web Developer Intern', company: '3Handshake Techsoft Private Limited',
      location: 'Jaipur, Rajasthan', period: 'Jan 2025 – Jul 2025', current: false, type: 'Internship',
      points: [
        'Built responsive web interfaces using React.js, HTML5, CSS3 and JavaScript.',
        'Integrated RESTful APIs with error handling.',
        'Used React Hooks and Context API for state management.',
        'Developed reusable components and resolved production bugs.',
      ],
    },
  ],
  projects: [
    { id: 1, title: 'Apna Backup', category: 'Web App', period: 'Jan 2025–Now', desc: 'Online backup platform with real-time synchronization and secure file storage.', tags: ['React.js', 'REST APIs', 'Responsive'], link: 'https://www.apnabackup.com/', github: 'https://github.com/thelokeshsain/Apna-Backup', image: '/images/project_apna_backup.webp', featured: true },
    { id: 2, title: 'FoodCourt Mobile App', category: 'Android', period: 'Oct–Dec 2024', desc: 'Android app for cafeteria food ordering with real-time tracking.', tags: ['Android', 'Java', 'XML'], link: 'https://github.com/thelokeshsain/FoodCourt', github: 'https://github.com/thelokeshsain/FoodCourt', image: '/images/project_foodcourt.webp' },
    { id: 3, title: 'Sizzling Hair Salon Platform', category: 'Full Stack', period: 'Feb–Apr 2024', desc: 'Full-stack salon management platform with appointment booking.', tags: ['HTML5', 'CSS3', 'JavaScript'], link: 'https://github.com/thelokeshsain/Sizzling', github: 'https://github.com/thelokeshsain/Sizzling', image: '/images/project_sizzling.webp' },
    { id: 4, title: 'Weather App', category: 'Web App', period: '2024', desc: 'Real-time weather application with location search, beautiful weather visuals, and live 7-day forecast data.', tags: ['JavaScript', 'Weather API', 'CSS'], link: 'https://weatherappbylokesh.netlify.app/', github: null },
    { id: 5, title: 'GitHub Finder', category: 'Web App', period: '2024', desc: 'Search and explore any GitHub user — repos, followers, bio, and contribution stats in a clean, fast interface.', tags: ['JavaScript', 'GitHub API', 'CSS'], link: 'https://githubuserbylokesh.netlify.app/', github: null },
  ],
  skills: {
    Frontend: ['React.js', 'HTML5', 'CSS3', 'JavaScript', 'Tailwind CSS', 'React Hooks', 'Context API', 'Responsive Design'],
    Backend:  ['Node.js', 'Express.js', 'REST APIs', 'PHP', 'Python', 'API Integration'],
    Database: ['MongoDB', 'MySQL', 'SQL'],
    Tools:    ['Git', 'GitHub', 'VS Code', 'OpenAI', 'Postman', 'Figma', 'Android Studio', 'Chrome DevTools'],
  },
  coreStack: ['React.js', 'Node.js', 'MongoDB', 'MySQL', 'JavaScript', 'Git', 'REST APIs', 'OpenAI'],
  sections: { hero: true, about: true, experience: true, projects: true, skills: true, contact: true },
}
