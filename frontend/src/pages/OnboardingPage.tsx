import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Check, Zap, BookOpen, ChevronRight } from 'lucide-react'

import { Layout } from '../components/layout/Layout'

type Step = 'role' | 'goal' | 'skills' | 'availability' | 'done'

export function OnboardingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const defaultRole = searchParams.get('role') as 'learner' | 'guide' | null

  const [step, setStep] = useState<Step>(defaultRole ? 'goal' : 'role')
  const [role, setRole] = useState<'learner' | 'guide' | 'dual'>(defaultRole || 'learner')
  const [goal, setGoal] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [availability, setAvailability] = useState<string[]>([])
  const [customGoal, setCustomGoal] = useState('')

  const steps: Step[] = ['role', 'goal', 'skills', 'availability', 'done']
  const currentIndex = steps.indexOf(step)
  const progress = ((currentIndex) / (steps.length - 1)) * 100

  const goalOptions = [
    { id: 'finance', label: 'Understand personal finance', icon: '💰' },
    { id: 'career', label: 'Advance my career', icon: '📈' },
    { id: 'language', label: 'Learn a new language', icon: '🌍' },
    { id: 'tech', label: 'Build tech skills', icon: '💻' },
    { id: 'creative', label: 'Explore creative skills', icon: '🎨' },
    { id: 'fitness', label: 'Improve my fitness', icon: '🏋️' },
    { id: 'business', label: 'Start or grow a business', icon: '🚀' },
    { id: 'custom', label: 'Something else...', icon: '✨' },
  ]

  const availabilityOptions = [
    'Weekday mornings', 'Weekday afternoons', 'Weekday evenings',
    'Weekend mornings', 'Weekend afternoons', 'Weekend evenings', 'Flexible',
  ]

  const next = () => {
    const idx = steps.indexOf(step)
    if (idx < steps.length - 1) setStep(steps[idx + 1])
    if (step === 'done') navigate('/discover')
  }

  const back = () => {
    const idx = steps.indexOf(step)
    if (idx > 0) setStep(steps[idx - 1])
  }

  return (
    <Layout noFooter>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {step !== 'done' && (
            <div className="mb-8">
              <div className="progress-bar mb-2">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-[var(--text-muted)] text-center">
                Step {currentIndex + 1} of {steps.length - 1}
              </p>
            </div>
          )}

          <div className="card p-8">
            {step === 'role' && (
              <RoleStep role={role} setRole={setRole} onNext={next} />
            )}

            {step === 'goal' && (
              <GoalStep
                role={role}
                goal={goal}
                setGoal={setGoal}
                customGoal={customGoal}
                setCustomGoal={setCustomGoal}
                goalOptions={goalOptions}
                onNext={next}
                onBack={back}
              />
            )}

            {step === 'skills' && (
              <SkillsStep
                role={role}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                onNext={next}
                onBack={back}
              />
            )}

            {step === 'availability' && (
              <AvailabilityStep
                availability={availability}
                setAvailability={setAvailability}
                options={availabilityOptions}
                onNext={next}
                onBack={back}
              />
            )}

            {step === 'done' && (
              <DoneStep role={role} onNext={() => navigate('/discover')} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

function RoleStep({ role, setRole, onNext }: {
  role: string
  setRole: (r: 'learner' | 'guide' | 'dual') => void
  onNext: () => void
}) {
  const options = [
    {
      value: 'learner',
      icon: <BookOpen size={24} className="text-brand-500" />,
      title: 'I want to learn',
      description: 'Find structured micro-sessions to build practical skills fast.',
      color: 'brand',
    },
    {
      value: 'guide',
      icon: <Zap size={24} className="text-amber-500" />,
      title: 'I want to teach',
      description: 'Turn your expertise into income with structured micro-sessions.',
      color: 'amber',
    },
    {
      value: 'dual',
      icon: <ChevronRight size={24} className="text-sage-500" />,
      title: 'Both — I\'ll do both',
      description: 'Learn from others and teach what you know. Switch roles anytime.',
      color: 'sage',
    },
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-2xl mx-auto mb-4">
          🌉
        </div>
        <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">
          Welcome to SkillBridge
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          How do you want to use SkillBridge?
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => setRole(opt.value as 'learner' | 'guide' | 'dual')}
            className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
              role === opt.value
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-950'
                : 'border-[var(--border)] hover:border-[var(--text-muted)]'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              role === opt.value ? 'bg-white dark:bg-[var(--bg)]' : 'bg-[var(--bg-muted)]'
            }`}>
              {opt.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[var(--text-primary)] mb-0.5">{opt.title}</p>
              <p className="text-xs text-[var(--text-secondary)]">{opt.description}</p>
            </div>
            {role === opt.value && (
              <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-1">
                <Check size={12} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <button className="btn-primary w-full justify-center" onClick={onNext}>
        Continue <ArrowRight size={16} />
      </button>
    </div>
  )
}

function GoalStep({ role, goal, setGoal, customGoal, setCustomGoal, goalOptions, onNext, onBack }: {
  role: string
  goal: string
  setGoal: (g: string) => void
  customGoal: string
  setCustomGoal: (g: string) => void
  goalOptions: { id: string; label: string; icon: string }[]
  onNext: () => void
  onBack: () => void
}) {
  const title = role === 'guide'
    ? 'What do you want to teach?'
    : 'What do you want to learn?'

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">{title}</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          We'll personalize your experience around your goals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {goalOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setGoal(opt.id)}
            className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 text-left transition-all ${
              goal === opt.id
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-950'
                : 'border-[var(--border)] hover:border-[var(--text-muted)]'
            }`}
          >
            <span className="text-xl">{opt.icon}</span>
            <span className="text-xs font-medium text-[var(--text-primary)] leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>

      {goal === 'custom' && (
        <div className="mb-5">
          <input
            className="input"
            placeholder="Tell us your goal..."
            value={customGoal}
            onChange={e => setCustomGoal(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-3">
        <button className="btn-outline flex-1 justify-center" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          className="btn-primary flex-1 justify-center"
          onClick={onNext}
          disabled={!goal && !customGoal}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function SkillsStep({ role, selectedSkills, setSelectedSkills, onNext, onBack }: {
  role: string
  selectedSkills: string[]
  setSelectedSkills: (s: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const toggle = (id: string) => {
    setSelectedSkills(
      selectedSkills.includes(id)
        ? selectedSkills.filter(s => s !== id)
        : [...selectedSkills, id]
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">
          {role === 'guide' ? 'What skills will you teach?' : 'Which areas interest you?'}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">Select all that apply.</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-6">
        {[
          { id: 'finance', label: 'Finance', icon: '💰' },
          { id: 'communication', label: 'Communication', icon: '🗣️' },
          { id: 'fitness', label: 'Fitness', icon: '🏋️' },
          { id: 'tech', label: 'Tech', icon: '💻' },
          { id: 'language', label: 'Language', icon: '🌍' },
          { id: 'creative', label: 'Creative', icon: '🎨' },
          { id: 'business', label: 'Business', icon: '📊' },
          { id: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
          { id: 'cooking', label: 'Cooking', icon: '👨‍🍳' },
          { id: 'music', label: 'Music', icon: '🎵' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => toggle(cat.id)}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
              selectedSkills.includes(cat.id)
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-950'
                : 'border-[var(--border)] hover:border-[var(--text-muted)]'
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)]">{cat.label}</p>
            </div>
            {selectedSkills.includes(cat.id) && (
              <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                <Check size={10} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-outline flex-1 justify-center" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn-primary flex-1 justify-center" onClick={onNext}>
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function AvailabilityStep({ availability, setAvailability, options, onNext, onBack }: {
  availability: string[]
  setAvailability: (a: string[]) => void
  options: string[]
  onNext: () => void
  onBack: () => void
}) {
  const toggle = (opt: string) => {
    setAvailability(
      availability.includes(opt)
        ? availability.filter(a => a !== opt)
        : [...availability, opt]
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">
          When are you usually available?
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          We'll show you sessions and guides that match your schedule.
        </p>
      </div>

      <div className="space-y-2.5 mb-6">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 text-sm font-medium transition-all ${
              availability.includes(opt)
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300'
                : 'border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--text-muted)]'
            }`}
          >
            {opt}
            {availability.includes(opt) && (
              <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button className="btn-outline flex-1 justify-center" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn-primary flex-1 justify-center" onClick={onNext}>
          Finish setup <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

function DoneStep({ role, onNext }: { role: string; onNext: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="w-20 h-20 rounded-full bg-sage-50 dark:bg-sage-950 flex items-center justify-center text-4xl mx-auto mb-6">
        🎉
      </div>
      <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-3">
        You're all set!
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed max-w-sm mx-auto">
        {role === 'guide'
          ? 'Your guide profile is being set up. You can start creating your first session right away.'
          : 'We\'ve personalized your discovery feed based on your goals. Your first session is one click away.'}
      </p>

      <div className="space-y-3">
        <button className="btn-primary w-full justify-center text-base" onClick={onNext}>
          {role === 'guide' ? 'Create my first session' : 'Discover sessions'}
          <ArrowRight size={18} />
        </button>
        <p className="text-xs text-[var(--text-muted)]">You can update your preferences anytime in settings.</p>
      </div>
    </div>
  )
}
