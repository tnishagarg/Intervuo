const KNOWN_SKILLS = [
  "React", "Node.js", "Node", "Express", "MySQL", "PostgreSQL", "MongoDB",
  "Python", "Java", "JavaScript", "TypeScript", "AWS", "Azure", "GCP",
  "Docker", "Kubernetes", "System Design", "REST", "GraphQL", "Redux",
  "Next.js", "Vue", "Angular", "Django", "Flask", "Spring Boot", "CI/CD",
  "Git", "Machine Learning", "TensorFlow", "PyTorch",
];

export function extractSkills(resumeText) {
  const found = KNOWN_SKILLS.filter((skill) => {
    const pattern = new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i");
    return pattern.test(resumeText);
  });

  const deduped = [...new Set(found.map((s) => (s === "Node" ? "Node.js" : s)))];

  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?/i);
  const years = yearsMatch ? parseInt(yearsMatch[1], 10) : null;
  const experienceLevel = years
    ? `${years}+ years experience`
    : "Experience level not detected";

  return {
    skills: deduped.slice(0, 8),
    experienceLevel,
  };
}