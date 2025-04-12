export interface Project {
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
}

export const projects: Project[] = [
  {
    title: "Selfistan",
    description: "App for ranking selfies uploaded from the users. Implemented real-time voting system and user engagement features.",
    technologies: ["React Native", "Node.js", "MongoDB", "AWS (EC2, SNS, SES)", "Nginx"],
    githubUrl: "https://github.com/yourusername/selfistan",
  },
  {
    title: "Portfolio Website",
    description: "A modern, responsive portfolio website built with Next.js and Tailwind CSS. Features smooth animations and SEO optimization.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "React Icons"],
    githubUrl: "https://github.com/yourusername/portfolio",
    liveUrl: "https://yourportfolio.com"
  },
  {
    title: "E-commerce Platform",
    description: "Full-stack e-commerce platform with payment integration, inventory management, and admin dashboard.",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe"],
    githubUrl: "https://github.com/yourusername/ecommerce"
  }
]; 