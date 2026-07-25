'use client';

import { useState, useMemo } from 'react';
import { GraduationCap, ExternalLink, Clock, BarChart3, Check, ArrowRight, BookOpen, Video, Code, Award } from 'lucide-react';

const COURSE_DATABASE = {
  'javascript': [
    { title: 'JavaScript: The Complete Guide', platform: 'Udemy', type: 'course', duration: '52 hours', level: 'Beginner-Advanced', url: '#', rating: 4.7, students: '850K' },
    { title: 'Eloquent JavaScript', platform: 'Book', type: 'book', duration: 'Self-paced', level: 'Intermediate', url: '#', rating: 4.5, students: '500K+' },
    { title: 'JavaScript30', platform: 'Wes Bos', type: 'project', duration: '30 days', level: 'Intermediate', url: '#', rating: 4.8, students: '1M+' },
  ],
  'react': [
    { title: 'React - The Complete Guide', platform: 'Udemy', type: 'course', duration: '68 hours', level: 'Beginner-Advanced', url: '#', rating: 4.6, students: '900K' },
    { title: 'Official React Docs', platform: 'react.dev', type: 'docs', duration: 'Self-paced', level: 'All levels', url: '#', rating: 4.9, students: '10M+' },
    { title: 'Reactpatterns.com', platform: 'Community', type: 'patterns', duration: 'Self-paced', level: 'Intermediate', url: '#', rating: 4.7, students: '200K+' },
  ],
  'python': [
    { title: 'Python for Data Science', platform: 'Coursera', type: 'course', duration: '40 hours', level: 'Beginner', url: '#', rating: 4.8, students: '2M' },
    { title: 'Automate the Boring Stuff', platform: 'Book', type: 'book', duration: 'Self-paced', level: 'Beginner', url: '#', rating: 4.7, students: '1M+' },
    { title: 'Real Python Tutorials', platform: 'realpython.com', type: 'tutorials', duration: 'Self-paced', level: 'All levels', url: '#', rating: 4.6, students: '3M+' },
  ],
  'machine learning': [
    { title: 'Machine Learning Specialization', platform: 'Coursera (Andrew Ng)', type: 'course', duration: '60 hours', level: 'Intermediate', url: '#', rating: 4.9, students: '4M' },
    { title: 'Fast.ai Course', platform: 'fast.ai', type: 'course', duration: '7 weeks', level: 'Intermediate-Advanced', url: '#', rating: 4.8, students: '500K+' },
    { title: 'Hands-On ML with Scikit-Learn', platform: 'Book (Geron)', type: 'book', duration: 'Self-paced', level: 'Intermediate', url: '#', rating: 4.7, students: '800K+' },
  ],
  'docker': [
    { title: 'Docker & Kubernetes: The Practical Guide', platform: 'Udemy', type: 'course', duration: '24 hours', level: 'Beginner-Advanced', url: '#', rating: 4.8, students: '600K' },
    { title: 'Docker Official Docs', platform: 'docs.docker.com', type: 'docs', duration: 'Self-paced', level: 'All levels', url: '#', rating: 4.6, students: '5M+' },
    { title: 'Play with Docker', platform: 'labs.play-with-docker.com', type: 'hands-on', duration: 'Self-paced', level: 'Beginner', url: '#', rating: 4.7, students: '2M+' },
  ],
  'aws': [
    { title: 'AWS Cloud Practitioner', platform: 'AWS Training', type: 'certification', duration: '20 hours', level: 'Beginner', url: '#', rating: 4.7, students: '3M' },
    { title: 'AWS Solutions Architect', platform: 'A Cloud Guru', type: 'course', duration: '40 hours', level: 'Intermediate', url: '#', rating: 4.8, students: '1M+' },
    { title: 'AWS Free Tier Hands-On', platform: 'AWS', type: 'hands-on', duration: 'Self-paced', level: 'Beginner', url: '#', rating: 4.6, students: '5M+' },
  ],
  'typescript': [
    { title: 'TypeScript Masterclass', platform: 'Udemy', type: 'course', duration: '15 hours', level: 'Beginner-Advanced', url: '#', rating: 4.7, students: '400K' },
    { title: 'TypeScript Handbook', platform: 'typescriptlang.org', type: 'docs', duration: 'Self-paced', level: 'All levels', url: '#', rating: 4.8, students: '2M+' },
    { title: 'Type Challenges', platform: 'GitHub', type: 'practice', duration: 'Self-paced', level: 'Intermediate-Advanced', url: '#', rating: 4.9, students: '300K+' },
  ],
  'kubernetes': [
    { title: 'Kubernetes for Beginners', platform: 'Udemy', type: 'course', duration: '12 hours', level: 'Beginner', url: '#', rating: 4.7, students: '350K' },
    { title: 'CKAD Preparation', platform: 'KodeKloud', type: 'course', duration: '30 hours', level: 'Intermediate', url: '#', rating: 4.8, students: '200K+' },
    { title: 'Kubernetes The Hard Way', platform: 'GitHub', type: 'tutorial', duration: 'Self-paced', level: 'Advanced', url: '#', rating: 4.6, students: '500K+' },
  ],
  'postgresql': [
    { title: 'PostgreSQL Bootcamp', platform: 'Udemy', type: 'course', duration: '10 hours', level: 'Beginner-Intermediate', url: '#', rating: 4.6, students: '200K' },
    { title: 'PostgreSQL Tutorial', platform: 'postgresqltutorial.com', type: 'docs', duration: 'Self-paced', level: 'Beginner', url: '#', rating: 4.7, students: '1M+' },
  ],
  'pytorch': [
    { title: 'PyTorch Deep Learning', platform: 'Coursera', type: 'course', duration: '45 hours', level: 'Intermediate', url: '#', rating: 4.8, students: '500K' },
    { title: 'PyTorch Official Tutorials', platform: 'pytorch.org', type: 'docs', duration: 'Self-paced', level: 'All levels', url: '#', rating: 4.7, students: '3M+' },
  ],
};

const TYPE_ICONS = { course: BookOpen, book: Award, docs: Code, tutorial: Video, practice: Code, 'hands-on': Code, patterns: Code, certification: Award, project: Code };
const TYPE_COLORS = { course: 'bg-blue-500/10 text-blue-400', book: 'bg-amber-500/10 text-amber-400', docs: 'bg-neutral-500/10 text-neutral-400', tutorial: 'bg-violet-500/10 text-violet-400', practice: 'bg-emerald-500/10 text-emerald-400', 'hands-on': 'bg-cyan-500/10 text-cyan-400', patterns: 'bg-pink-500/10 text-pink-400', certification: 'bg-red-500/10 text-red-400', project: 'bg-indigo-500/10 text-indigo-400' };

export default function SkillLearningRoadmap({ dark }) {
  const [profile, setProfile] = useState(null);
  const [learning, setLearning] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copilot_learning') || '{}'); } catch { return {}; }
  });
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loading, setLoading] = useState(true);

  useState(() => {
    fetch('/api/resume').then(r => r.json()).then(d => {
      if (d.success) setProfile(d.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const userSkills = useMemo(() => {
    if (!profile?.coreStack) return [];
    return profile.coreStack.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  }, [profile]);

  const skillGaps = useMemo(() => {
    const allSkills = Object.keys(COURSE_DATABASE);
    return allSkills.filter(s => !userSkills.some(us => us.includes(s) || s.includes(us)));
  }, [userSkills]);

  const recommendedSkills = skillGaps.slice(0, 8);

  const toggleLearning = (skill, courseIdx) => {
    setLearning(prev => {
      const next = { ...prev };
      const key = `${skill}_${courseIdx}`;
      next[key] = !next[key];
      localStorage.setItem('copilot_learning', JSON.stringify(next));
      return next;
    });
  };

  const saveLearning = (l) => {
    localStorage.setItem('copilot_learning', JSON.stringify(l));
  };

  const coursesToShow = selectedSkill ? COURSE_DATABASE[selectedSkill] || [] : [];

  if (loading) {
    return (
      <div className={`border rounded-lg p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
        <div className="text-center py-12 text-neutral-500 text-sm font-mono">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 sm:p-8 ${dark ? 'border-neutral-900 bg-[#0F0F11]' : 'border-neutral-200 bg-white'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${dark ? 'bg-emerald-500/10' : 'bg-emerald-500/10'}`}>
          <GraduationCap className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Skill Learning Roadmap</h2>
          <p className="text-xs text-neutral-400">Close your skill gaps with curated learning resources</p>
        </div>
      </div>

      {userSkills.length > 0 && (
        <div className={`p-3 rounded border mb-6 ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
          <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2">Your current skills</span>
          <div className="flex flex-wrap gap-1.5">
            {userSkills.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xs font-bold font-mono text-neutral-400 mb-3 uppercase">Recommended Skills to Learn</h3>
        <div className="flex flex-wrap gap-2">
          {recommendedSkills.map(skill => (
            <button key={skill} onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                selectedSkill === skill
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : dark ? 'text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700' : 'text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300'
              }`}>
              {skill}
              {COURSE_DATABASE[skill] && <span className="text-[9px] text-neutral-500">({COURSE_DATABASE[skill].length})</span>}
            </button>
          ))}
        </div>
      </div>

      {selectedSkill && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold capitalize">{selectedSkill} — Learning Resources</h3>
            <span className="text-[10px] font-mono text-neutral-500">{coursesToShow.length} resources</span>
          </div>
          {coursesToShow.map((course, i) => {
            const Icon = TYPE_ICONS[course.type] || BookOpen;
            const isCompleted = learning[`${selectedSkill}_${i}`];
            return (
              <div key={i} className={`p-4 rounded border transition-all ${isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : dark ? 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${TYPE_COLORS[course.type] || TYPE_COLORS.course}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{course.title}</h4>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-1">
                        <span>{course.platform}</span>
                        <span className={`px-1.5 py-0.5 rounded ${TYPE_COLORS[course.type]}`}>{course.type}</span>
                        <span>{course.level}</span>
                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {course.duration}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] mt-1.5">
                        <span className="text-amber-400">★ {course.rating}</span>
                        <span className="text-neutral-500">{course.students} students</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleLearning(selectedSkill, i)}
                      className={`p-2 rounded transition-colors ${isCompleted ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-500 hover:text-emerald-400'}`}>
                      <Check className="w-4 h-4" />
                    </button>
                    <a href={course.url} target="_blank" rel="noopener" className="p-2 rounded text-neutral-500 hover:text-cyan-400 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!selectedSkill && (
        <div className={`text-center py-12 rounded border ${dark ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50'}`}>
          <GraduationCap className="w-8 h-8 mx-auto mb-3 text-neutral-500" />
          <p className="text-sm text-neutral-500">Select a skill above to see curated learning resources.</p>
          <p className="text-xs text-neutral-600 mt-1">{skillGaps.length} skills available to learn</p>
        </div>
      )}
    </div>
  );
}
