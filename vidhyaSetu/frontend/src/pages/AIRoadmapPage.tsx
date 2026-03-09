import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Language } from '../translations';
import type { ModuleSummary } from '../services/api';
import type { TestResult } from '../App';

interface AIRoadmapPageProps {
  subject: string;
  modules: ModuleSummary[];
  completedModules: number[];
  testResults: TestResult[];
  onStartModule: (id: number) => void;
  onGenerateCourse: (topic: string, notes: string) => void;
  isLoading: boolean;
  language: Language;
  t: any;
  studentProfile: { name: string; age: number; grade: string } | null;
}

const EXAM_PRESETS = [
  { label: 'JEE Main 2026', value: 'jee_main', icon: '⚡' },
  { label: 'NEET 2026', value: 'neet', icon: '🔬' },
  { label: 'CBSE Board Exam', value: 'cbse', icon: '📚' },
  { label: 'ICSE Board Exam', value: 'icse', icon: '📖' },
  { label: 'GATE 2026', value: 'gate', icon: '🔧' },
  { label: 'UPSC Prelims', value: 'upsc', icon: '🏛️' },
  { label: 'SSC CGL', value: 'ssc', icon: '📝' },
  { label: 'Custom Goal', value: 'custom', icon: '🎯' },
];

const PHASE_META = [
  { label: 'Foundation', accent: '#00f0ff', bg: 'rgba(0,240,255,0.07)', border: 'rgba(0,240,255,0.22)' },
  { label: 'Core Concepts', accent: '#00ffaa', bg: 'rgba(0,255,170,0.07)', border: 'rgba(0,255,170,0.22)' },
  { label: 'Intermediate', accent: '#b400ff', bg: 'rgba(180,0,255,0.07)', border: 'rgba(180,0,255,0.22)' },
  { label: 'Advanced', accent: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.22)' },
  { label: 'Mastery', accent: '#ef4444', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.22)' },
];

export function AIRoadmapPage({
  subject,
  modules,
  completedModules,
  testResults,
  onStartModule,
  onGenerateCourse,
  isLoading,
  language,
  studentProfile,
}: AIRoadmapPageProps) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState(subject || '');
  const [selectedExam, setSelectedExam] = useState('custom');
  const [customExamName, setCustomExamName] = useState('');
  const [targetDate, setTargetDate] = useState(() => localStorage.getItem('vidya_roadmap_target_date') || '');
  const [hoursPerDay, setHoursPerDay] = useState(() => localStorage.getItem('vidya_roadmap_hours') || '2');
  const [showForm, setShowForm] = useState(modules.length === 0);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (subject && !topic) setTopic(subject);
  }, [subject]);

  useEffect(() => {
    if (targetDate) localStorage.setItem('vidya_roadmap_target_date', targetDate);
    if (hoursPerDay) localStorage.setItem('vidya_roadmap_hours', hoursPerDay);
  }, [targetDate, hoursPerDay]);

  const daysRemaining = targetDate
    ? Math.max(0, Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000))
    : null;

  const examLabel = selectedExam === 'custom'
    ? (customExamName || 'Your Goal')
    : EXAM_PRESETS.find(e => e.value === selectedExam)?.label || 'Exam';

  // Split modules into weekly phases (3 per week)
  const MODS_PER_WEEK = 3;
  const phases: ModuleSummary[][] = [];
  for (let i = 0; i < modules.length; i += MODS_PER_WEEK) {
    phases.push(modules.slice(i, i + MODS_PER_WEEK));
  }

  const totalComplete = completedModules.length;
  const totalModules = modules.length;
  const progressPct = totalModules > 0 ? Math.round((totalComplete / totalModules) * 100) : 0;
  const firstActiveId = modules.find(m => !completedModules.includes(m.id))?.id;

  const getBestScore = (moduleId: number) => {
    const results = testResults.filter(r => r.moduleId === moduleId);
    if (!results.length) return null;
    return Math.round(Math.max(...results.map(r => (r.score / r.total) * 100)));
  };

  const avgScore = testResults.length
    ? Math.round(testResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / testResults.length)
    : null;

  const handleGenerate = () => {
    if (!topic.trim() || isLoading) return;
    const notes = selectedExam !== 'custom'
      ? `Target: ${examLabel}. ${parseFloat(hoursPerDay)} hours/day available. Focus on exam-relevant, high-priority topics.`
      : `${parseFloat(hoursPerDay)} hours/day available.`;
    onGenerateCourse(topic.trim(), notes);
    setShowForm(false);
  };

  // ─── Shared card style ────────────────────────────────────────────────────
  const glassCard: React.CSSProperties = {
    background: 'rgba(10,17,30,0.65)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: 'rgba(0,0,0,0.45)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  return (
    <div
      style={{
        padding: 'clamp(16px, 3vw, 36px) clamp(12px, 3vw, 28px)',
        maxWidth: '1080px',
        margin: '0 auto',
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? 'none' : 'translateY(16px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
      }}
    >
      <button onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0 0 16px 0', transition: 'color 0.2s', width: 'max-content' }} onMouseOver={e => e.currentTarget.style.color = '#00f0ff'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 5-7 7 7 7" /></svg>
        Back to Dashboard
      </button>

      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '2.1rem', lineHeight: 1 }}>🗺️</span>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 900, background: 'linear-gradient(135deg, #00f0ff 0%, #b400ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI Study Roadmap
            </h1>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Personalized exam prep path · Powered by{' '}
            <span style={{ color: '#ff9900', fontWeight: 700 }}>AWS Bedrock</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.3)', color: '#ff9900', borderRadius: '999px', padding: '5px 14px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em' }}>
            ⚡ AWS BEDROCK
          </span>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ background: showForm ? 'rgba(255,255,255,0.05)' : 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', color: '#00f0ff', borderRadius: '10px', padding: '8px 18px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, transition: 'all 0.2s' }}
          >
            {showForm ? '✕ Close' : '＋ New Roadmap'}
          </button>
        </div>
      </div>

      {/* ── STAT CARDS (only when course exists) ────────────────────────── */}
      {modules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { icon: '📊', label: 'Progress', val: `${progressPct}%`, sub: `${totalComplete} / ${totalModules} modules`, color: '#00f0ff' },
            { icon: '📅', label: daysRemaining !== null ? 'Days Left' : 'Target', val: daysRemaining !== null ? `${daysRemaining}d` : 'Set Date', sub: daysRemaining !== null ? `Until ${examLabel}` : 'Click New Roadmap', color: daysRemaining !== null && daysRemaining < 14 ? '#ef4444' : '#f59e0b' },
            { icon: '⏱️', label: 'Daily Goal', val: `${hoursPerDay}h`, sub: `≈ ${Math.round(parseFloat(hoursPerDay) * (daysRemaining ?? 30))}h total`, color: '#00ffaa' },
            { icon: '🎯', label: 'Avg Score', val: avgScore !== null ? `${avgScore}%` : '—', sub: `${testResults.length} tests taken`, color: '#b400ff' },
          ].map((s, i) => (
            <div key={i} style={{ ...glassCard, padding: '18px 16px' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '3px' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── OVERALL PROGRESS BAR ─────────────────────────────────────────── */}
      {modules.length > 0 && (
        <div style={{ ...glassCard, padding: '18px 22px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem' }}>
              📚 {subject || 'Your Course'} — Overall Progress
            </span>
            <span style={{ color: '#00f0ff', fontWeight: 900, fontSize: '1.05rem' }}>{progressPct}%</span>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #00f0ff, #b400ff)', borderRadius: '999px', boxShadow: '0 0 12px rgba(0,240,255,0.4)', transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#475569', fontSize: '0.76rem' }}>
            <span>✓ {totalComplete} completed</span>
            <span>{totalModules - totalComplete} remaining{daysRemaining !== null ? ` · ${daysRemaining} days left` : ''}</span>
          </div>
        </div>
      )}

      {/* ── GENERATE FORM ────────────────────────────────────────────────── */}
      {showForm && (
        <div style={{ ...glassCard, padding: '26px', marginBottom: '32px', border: '1px solid rgba(0,240,255,0.18)', boxShadow: '0 0 40px rgba(0,240,255,0.04)' }}>
          <h3 style={{ margin: '0 0 22px 0', color: '#f1f5f9', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎯 Generate Your AI Study Roadmap
            <span style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', color: '#00f0ff', fontSize: '0.7rem', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
              AI-POWERED
            </span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            {/* Topic — full width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                What do you want to learn? *
              </label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Physics – Mechanics, Python, Organic Chemistry, Indian History…"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Exam selector */}
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                Target Exam / Goal
              </label>
              <select
                value={selectedExam}
                onChange={e => setSelectedExam(e.target.value)}
                style={{ ...inputStyle, background: 'rgba(0,0,0,0.55)', cursor: 'pointer', colorScheme: 'dark' }}
              >
                {EXAM_PRESETS.map(e => (
                  <option key={e.value} value={e.value}>{e.icon}  {e.label}</option>
                ))}
              </select>
            </div>

            {/* Custom goal name */}
            {selectedExam === 'custom' && (
              <div>
                <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                  Goal Name
                </label>
                <input
                  value={customExamName}
                  onChange={e => setCustomExamName(e.target.value)}
                  placeholder="e.g. College Interview, Project Demo…"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            )}

            {/* Target date */}
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                Target / Exam Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,240,255,0.45)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Hours per day */}
            <div>
              <label style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '7px' }}>
                Study Hours Per Day
              </label>
              <select
                value={hoursPerDay}
                onChange={e => setHoursPerDay(e.target.value)}
                style={{ ...inputStyle, background: 'rgba(0,0,0,0.55)', cursor: 'pointer', colorScheme: 'dark' }}
              >
                {['1', '2', '3', '4', '5', '6', '8'].map(h => (
                  <option key={h} value={h}>{h} hour{h !== '1' ? 's' : ''} / day</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student context hint */}
          {studentProfile && (
            <div style={{ marginTop: '14px', background: 'rgba(0,240,255,0.04)', border: '1px solid rgba(0,240,255,0.1)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1rem' }}>🎓</span>
              <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                AI will personalize this roadmap for <strong style={{ color: '#e2e8f0' }}>{studentProfile.name}</strong>, {studentProfile.grade}
              </span>
            </div>
          )}

          <div style={{ marginTop: '22px' }}>
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isLoading}
              style={{
                background: topic.trim() && !isLoading
                  ? 'linear-gradient(135deg, #00f0ff 0%, #b400ff 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem',
                padding: '14px 32px', borderRadius: '12px',
                cursor: topic.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                boxShadow: topic.trim() && !isLoading ? '0 4px 24px rgba(0,240,255,0.25)' : 'none',
                transition: 'all 0.3s ease',
                opacity: !topic.trim() ? 0.5 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'roadmapSpin 0.9s linear infinite' }}>⟳</span>
                  Generating with AI…
                </>
              ) : (
                <>🗺️ Generate My Study Roadmap</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
      {modules.length === 0 && !showForm && (
        <div style={{ ...glassCard, textAlign: 'center', padding: '72px 24px', border: '1px dashed rgba(255,255,255,0.09)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '18px' }}>🗺️</div>
          <h3 style={{ color: '#f1f5f9', margin: '0 0 10px 0', fontSize: '1.35rem', fontWeight: 800 }}>No Roadmap Yet</h3>
          <p style={{ color: '#475569', margin: '0 0 24px 0', lineHeight: 1.6 }}>
            Generate your AI-personalized study roadmap to visualize<br />your path to exam success
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: 'linear-gradient(135deg, #00f0ff, #b400ff)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem', padding: '13px 28px', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,240,255,0.25)' }}
          >
            🚀 Create My Roadmap
          </button>
        </div>
      )}

      {/* ── ROADMAP TIMELINE ─────────────────────────────────────────────── */}
      {modules.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800 }}>
              📍 Your Study Roadmap
            </h2>
            {subject && <span style={{ color: '#475569', fontSize: '0.875rem' }}>— {subject}</span>}
            {targetDate && daysRemaining !== null && (
              <span style={{ marginLeft: 'auto', background: daysRemaining < 14 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${daysRemaining < 14 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, color: daysRemaining < 14 ? '#ef4444' : '#f59e0b', borderRadius: '999px', padding: '4px 14px', fontSize: '0.78rem', fontWeight: 700 }}>
                📅 {daysRemaining} days until {examLabel}
              </span>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            {/* Vertical spine */}
            <div style={{ position: 'absolute', left: '27px', top: '28px', bottom: '28px', width: '2px', background: 'linear-gradient(180deg, rgba(0,240,255,0.3) 0%, rgba(180,0,255,0.1) 100%)', zIndex: 0, borderRadius: '2px' }} />

            {phases.map((phaseModules, pi) => {
              const meta = PHASE_META[pi % PHASE_META.length];
              const phaseDone = phaseModules.filter(m => completedModules.includes(m.id)).length;
              const isCurrent = phaseModules.some(m => m.id === firstActiveId);
              const phasePct = Math.round((phaseDone / phaseModules.length) * 100);

              return (
                <div key={pi} style={{ marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                  {/* Phase header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    {/* Week bubble */}
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: meta.bg, border: `2px solid ${meta.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: meta.accent, fontSize: '1.05rem', flexShrink: 0, boxShadow: isCurrent ? `0 0 22px ${meta.accent}35` : 'none', position: 'relative', zIndex: 2 }}>
                      W{pi + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1rem' }}>Week {pi + 1}: {meta.label}</span>
                        {isCurrent && (
                          <span style={{ background: meta.bg, border: `1px solid ${meta.accent}`, color: meta.accent, fontSize: '0.65rem', padding: '2px 10px', borderRadius: '999px', fontWeight: 800, letterSpacing: '0.05em' }}>▶ CURRENT</span>
                        )}
                        {phasePct === 100 && (
                          <span style={{ background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.3)', color: '#00ffaa', fontSize: '0.65rem', padding: '2px 10px', borderRadius: '999px', fontWeight: 800 }}>✓ DONE</span>
                        )}
                      </div>
                      <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '2px' }}>
                        {phaseDone}/{phaseModules.length} modules{hoursPerDay ? ` · ~${Math.round(parseFloat(hoursPerDay) * 7)}h this week` : ''}
                      </div>
                    </div>

                    {/* Phase mini progress */}
                    <div style={{ width: '72px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div style={{ height: '5px', width: '100%', background: 'rgba(0,0,0,0.4)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${phasePct}%`, background: meta.accent, borderRadius: '999px', transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ color: '#475569', fontSize: '0.7rem' }}>{phasePct}%</span>
                    </div>
                  </div>

                  {/* Module cards */}
                  <div style={{ marginLeft: '70px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {phaseModules.map((mod, mi) => {
                      const done = completedModules.includes(mod.id);
                      const active = mod.id === firstActiveId;
                      const score = getBestScore(mod.id);
                      const overallIdx = pi * MODS_PER_WEEK + mi + 1;

                      return (
                        <div
                          key={mod.id}
                          onClick={() => onStartModule(mod.id)}
                          style={{
                            background: done ? 'rgba(0,255,170,0.05)' : active ? meta.bg : 'rgba(10,17,30,0.65)',
                            border: `1px solid ${done ? 'rgba(0,255,170,0.28)' : active ? meta.accent : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '14px', padding: '16px 18px', cursor: 'pointer',
                            transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
                            boxShadow: active ? `0 0 18px ${meta.accent}18` : 'none',
                            position: 'relative', overflow: 'hidden',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                            (e.currentTarget as HTMLElement).style.borderColor = done ? 'rgba(0,255,170,0.5)' : meta.accent;
                            (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 24px ${meta.accent}20`;
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.transform = '';
                            (e.currentTarget as HTMLElement).style.borderColor = done ? 'rgba(0,255,170,0.28)' : active ? meta.accent : 'rgba(255,255,255,0.06)';
                            (e.currentTarget as HTMLElement).style.boxShadow = active ? `0 0 18px ${meta.accent}18` : 'none';
                          }}
                        >
                          {/* Completed side stripe */}
                          {done && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#00ffaa', borderRadius: '14px 0 0 14px' }} />}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                            <span style={{ color: done ? '#00ffaa' : meta.accent, fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                              Module {overallIdx}
                            </span>
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {done && <span style={{ background: 'rgba(0,255,170,0.12)', color: '#00ffaa', borderRadius: '999px', padding: '1px 8px', fontSize: '0.67rem', fontWeight: 800 }}>✓ Done</span>}
                              {active && !done && <span style={{ background: meta.bg, color: meta.accent, borderRadius: '999px', padding: '1px 8px', fontSize: '0.67rem', fontWeight: 800 }}>▶ Now</span>}
                              {score !== null && (
                                <span style={{ background: score >= 80 ? 'rgba(0,255,170,0.1)' : score >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', color: score >= 80 ? '#00ffaa' : score >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '999px', padding: '1px 8px', fontSize: '0.67rem', fontWeight: 800 }}>
                                  {score}%
                                </span>
                              )}
                            </div>
                          </div>

                          <h4 style={{ margin: '0 0 5px 0', color: '#f1f5f9', fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.35 }}>
                            {mod.title}
                          </h4>
                          <p style={{ margin: 0, color: '#475569', fontSize: '0.78rem', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {mod.description}
                          </p>

                          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#334155', fontSize: '0.72rem' }}>
                              ~{Math.round(parseFloat(hoursPerDay) * 30)} min
                            </span>
                            <span style={{ color: done ? '#00ffaa' : active ? meta.accent : '#475569', fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {done ? 'Review' : active ? 'Start' : 'Open'} →
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* ── Finish line ── */}
            <div style={{ marginLeft: '70px', marginTop: '8px' }}>
              <div style={{
                ...glassCard,
                padding: '22px 24px',
                border: progressPct === 100 ? '1px solid rgba(0,255,170,0.35)' : '1px solid rgba(255,255,255,0.06)',
                background: progressPct === 100 ? 'rgba(0,255,170,0.06)' : 'rgba(10,17,30,0.5)',
                textAlign: 'center',
              }}>
                {progressPct === 100 ? (
                  <>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                    <div style={{ color: '#00ffaa', fontWeight: 800, fontSize: '1.15rem' }}>Roadmap Complete!</div>
                    <div style={{ color: '#475569', fontSize: '0.875rem', marginTop: '5px' }}>
                      You've mastered {subject} — well done! 🎉
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '1.75rem', marginBottom: '8px' }}>🎯</div>
                    <div style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem' }}>
                      {totalModules - totalComplete} module{totalModules - totalComplete !== 1 ? 's' : ''} to go — keep pushing!
                    </div>
                    {daysRemaining !== null && (
                      <div style={{ color: '#475569', fontSize: '0.8rem', marginTop: '4px' }}>
                        {daysRemaining} days remaining until {examLabel}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spin animation keyframe */}
      <style>{`
        @keyframes roadmapSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
