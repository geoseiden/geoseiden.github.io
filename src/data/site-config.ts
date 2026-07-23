import type { IconType } from "react-icons";
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiNestjs,
  SiFastapi,
  SiMysql,
  SiPostman,
  SiJsonwebtokens,
  SiScikitlearn,
  SiHtml5,
  SiFlutter,
  SiKalilinux,
  SiEspressif,
  SiGit,
} from "react-icons/si";

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Skill {
  name: string;
  icon: IconType;
}

export interface AboutCard {
  title: string;
  body: string;
}

export interface TimelineEntry {
  type: "work" | "education";
  role: string;
  organisation: string;
  date: string;
  location: string;
  description: string;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  codeUrl: string;
  liveUrl?: string;
}

export const siteConfig = {
  name: "George Sebastian",
  initials: "GS",
  role: "Software Engineer",
  location: "Thrissur, Kerala, India",
  email: "contact@thegeorge.in",
  bio: "Backend developer and application-security enthusiast from Kerala, India. I build secure APIs with NestJS, FastAPI and Python — OAuth, JWT and RBAC are my home turf — and I like breaking things ethically to learn how to build them better.",

  urls: {
    site: "https://thegeorge.in",
    github: "https://github.com/geoseiden",
    linkedin: "https://linkedin.com/in/georgesebastian-",
    resume: "/resume.pdf",
    mailto: "mailto:contact@thegeorge.in",
  },

  seo: {
    title: "George Sebastian - Software Engineer",
    description:
      "George Sebastian is a software engineer from Thrissur, Kerala, India, specialising in backend development with NestJS, FastAPI and Python, and application security: OAuth, JWT, RBAC and ethical hacking.",
    keywords: [
      "George Sebastian",
      "Software Engineer",
      "Backend Developer",
      "NestJS",
      "FastAPI",
      "Python",
      "Application Security",
      "OAuth",
      "JWT",
      "RBAC",
      "Ethical Hacking",
      "Kerala",
      "India",
      "geoseiden",
    ],
  },

  sectionTitles: {
    about: "About Me 🙋",
    journey: "My Journey 🧭",
    skills: "Skills and Technologies 🛠️",
    projects: "Projects I've Worked On 🚀",
  },

  heroGreetings: [
    "Hello!",
    "നമസ്കാരം!",
    "Bonjour!",
    "Hola!",
    "नमस्ते!",
    "Ciao!",
    "こんにちは!",
  ],

  navLinks: [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Journey", href: "#journey" },
    { label: "Projects", href: "#projects" },
    { label: "Résumé", href: "/resume.pdf", external: true },
  ] satisfies NavLink[],

  skills: [
    { name: "Python", icon: SiPython },
    { name: "JavaScript", icon: SiJavascript },
    { name: "TypeScript", icon: SiTypescript },
    { name: "NestJS", icon: SiNestjs },
    { name: "FastAPI", icon: SiFastapi },
    { name: "MySQL", icon: SiMysql },
    { name: "Postman", icon: SiPostman },
    { name: "JWT", icon: SiJsonwebtokens },
    { name: "Scikit-learn", icon: SiScikitlearn },
    { name: "HTML5", icon: SiHtml5 },
    { name: "Flutter", icon: SiFlutter },
    { name: "Kali Linux", icon: SiKalilinux },
    { name: "ESP32", icon: SiEspressif },
    { name: "Git", icon: SiGit },
  ] satisfies Skill[],

  aboutCards: [
    {
      title: "Who I Am 🙋‍♂️",
      body: "I'm George, a Computer Science student at Karunya Institute of Technology and Sciences, originally from Thrissur, Kerala. I spend most of my time on the backend — designing APIs, wiring up databases and making sure the whole thing doesn't fall over when real users show up.",
    },
    {
      title: "Backend & Auth 🔐",
      body: "My speciality is authentication and authorization. As a Software Engineer Intern at FirstMeridian Business Services I implemented OAuth-based third-party login and a role-based authorization system, and built migration tooling between ticketing systems while coordinating with external vendor teams.",
    },
    {
      title: "Security Background 🛡️",
      body: "I founded and led the Cyber Security Club at Karunya, running events and competitions to grow the campus security community. Before that, an ethical hacking internship at Tech By Heart had me working on client-side malware execution and privilege escalation — the offensive side that informs how I defend.",
    },
    {
      title: "ML & IoT Tinkering 🤖",
      body: "Away from pure backend work I like building odd things: an AI intrusion detection system using Random Forest classifiers, and an ESP32 + MPU6050 fall-detection device with Blynk-powered smartphone alerts. If it has a sensor or a dataset, I'll probably poke at it.",
    },
  ] satisfies AboutCard[],

  timeline: [
    {
      type: "work",
      role: "Software Engineer Intern",
      organisation: "FirstMeridian Business Services",
      date: "Feb 2025 – Aug 2025",
      location: "Bangalore, India",
      description:
        "Implemented OAuth-based authentication for secure third-party login, developed a role-based authorization system to manage user access, and built a migration script to transfer data between ticketing systems — resolving naming and value discrepancies with an external vendor team in real time.",
    },
    {
      type: "work",
      role: "Head & Founder",
      organisation: "Cyber Security Club, Karunya Institute",
      date: "Aug 2022 – Oct 2024",
      location: "Coimbatore, India",
      description:
        "Founded and led the campus Cyber Security Club, elevating its presence through events and competitions and fostering a vibrant cybersecurity community.",
    },
    {
      type: "education",
      role: "B.Tech in Computer Science and Technology",
      organisation: "Karunya Institute of Technology and Sciences",
      date: "2021 – Present",
      location: "Coimbatore, India",
      description:
        "Undergraduate degree in Computer Science and Technology, with a focus on backend engineering, security and machine learning.",
    },
    {
      type: "work",
      role: "Ethical Hacking Intern",
      organisation: "Tech By Heart",
      date: "Apr 2020 – May 2020",
      location: "Kochi, India",
      description:
        "One-month remote cybersecurity internship focused on client-side malware execution and privilege escalation.",
    },
    {
      type: "education",
      role: "Grade 12",
      organisation: "Devamatha CMI Public School",
      date: "2019 – 2021",
      location: "Thrissur, India",
      description: "Higher secondary education, graduating with 80%.",
    },
  ] satisfies TimelineEntry[],

  projects: [
    {
      title: "NestJS-Oauth",
      description:
        "NestJS application implementing JWT-based authentication and authorization, featuring a Role-Based Access Control (RBAC) system and a comprehensive user management module.",
      tech: ["NestJS", "TypeScript", "JWT", "RBAC"],
      codeUrl: "https://github.com/geoseiden/NestJS-Oauth",
    },
    {
      title: "FastAPI-SSO",
      description:
        "Secure single sign-on in FastAPI using Auth0 and a custom OAuth 2.0 flow with Google Cloud Console — cookie-based sessions, a microservices architecture and enhanced logging with timestamp mixins.",
      tech: ["FastAPI", "Python", "OAuth 2.0", "Auth0"],
      codeUrl: "https://github.com/geoseiden/FastAPI-SSO",
    },
    {
      title: "AI-Intrusion-Detection-System",
      description:
        "AI-based network intrusion detection system built on a Random Forest classifier, with data preprocessing tuned to improve detection accuracy.",
      tech: ["Python", "Scikit-learn", "Machine Learning"],
      codeUrl: "https://github.com/geoseiden/AI-Intrusion-Detection-System",
    },
    {
      title: "IoT Fall Detection with Blynk",
      description:
        "ESP32 + MPU6050 fall-detection system with customizable thresholds and Blynk-based smartphone alerts for real-time monitoring.",
      tech: ["ESP32", "C++", "MPU6050", "Blynk"],
      codeUrl: "https://github.com/geoseiden/fall-detection-blynk",
    },
    {
      title: "AntiScrape FastAPI Defender",
      description:
        "Anti-webscraping defence layer for FastAPI applications, detecting and blocking automated scraping traffic before it reaches your endpoints.",
      tech: ["FastAPI", "Python", "Security"],
      codeUrl: "https://github.com/geoseiden/AntiScrape-FastAPI-Defender",
    },
    {
      title: "BarQR to Excel",
      description:
        "Flutter application that scans barcodes and QR codes, stores the scanned data and exports it to Excel spreadsheets.",
      tech: ["Flutter", "Dart", "Mobile"],
      codeUrl: "https://github.com/geoseiden/barqr-to-excel",
    },
  ] as Project[],
} as const;

export type SiteConfig = typeof siteConfig;
