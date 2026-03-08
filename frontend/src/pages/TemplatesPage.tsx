import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, TrendingUp, ChevronRight, Loader2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { dashboardApi } from '../lib/services'
import type { Template } from '../types'
import clsx from 'clsx'

export function TemplatesPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.templates().then(res => {
      const mapped: Template[] = (res.data as any[]).map(t => ({
        id: t.id.toLowerCase().replace(/_/g, '-') as import('../types').TemplateType,
        title: t.title,
        subtitle: t.subtitle,
        description: t.description,
        color: t.color,
        icon: t.icon,
        sessionCount: t.sessionCount ?? 0,
        bestFor: t.bestFor ?? [],
        steps: (t.steps ?? []).map((s: any) => ({
          order: s.order,
          title: s.title,
          description: s.description,
          duration: s.duration,
          tip: s.tip,
        })),
      }))
      setTemplates(mapped)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const activeTemplate = templates.find(t => t.id === selected) || templates[0]

  if (loading) return <Layout><div className="flex items-center justify-center py-40"><Loader2 size={32} className="animate-spin text-brand-500" /></div></Layout>

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-900 mb-4">
            <BookOpen size={14} className="text-brand-500" />
            <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Teaching Templates</span>
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Structure that
            <span className="text-gradient"> produces outcomes</span>
          </h1>
          <p className="section-subtitle mx-auto">
            Every great micro-session starts with a proven framework.
            Choose the template that fits your skill and your learner's goal.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelected(template.id)}
                className={clsx(
                  'w-full text-left card p-4 transition-all',
                  (selected === template.id || (!selected && template.id === templates[0]?.id))
                    ? 'border-2 shadow-soft-md'
                    : 'hover:shadow-soft-md'
                )}
                style={{
                  borderColor: (selected === template.id || (!selected && template.id === templates[0]?.id))
                    ? template.color
                    : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${template.color}18` }}
                  >
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-sm text-[var(--text-primary)]">{template.title}</h3>
                      <ChevronRight size={14} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{template.subtitle}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Users size={11} className="text-[var(--text-muted)]" />
                        <span className="text-xs text-[var(--text-muted)]">{template.sessionCount.toLocaleString()} sessions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <TemplateDetail template={activeTemplate} />
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-3">
            Ready to create your first session?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xl mx-auto">
            Pick a template, define your outcome, and start teaching. SkillBridge guides you through the entire setup.
          </p>
          <Link to="/onboarding?role=guide" className="btn-primary text-base px-8 py-3.5">
            Start building your session
          </Link>
        </div>
      </div>
    </Layout>
  )
}

function TemplateDetail({ template }: { template: import("../types").Template }) {
  return (
    <div className="card p-6 h-full">
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ backgroundColor: `${template.color}18` }}
        >
          {template.icon}
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">{template.title}</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{template.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <p className="w-full text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Best for</p>
        {template.bestFor.map(b => (
          <span key={b} className="badge-neutral">{b}</span>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2">
          <TrendingUp size={15} style={{ color: template.color }} />
          Session framework ({template.steps.length} steps)
        </h3>
        {template.steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${template.color}18`, color: template.color }}
            >
              {step.order}
            </div>
            <div className="flex-1 card p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-xs text-[var(--text-primary)]">{step.title}</h4>
                <span className="text-xs text-[var(--text-muted)]">{step.duration}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{step.description}</p>
              <div
                className="text-xs leading-relaxed italic px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: `${template.color}0D`, color: template.color }}
              >
                Tip: {step.tip}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="divider pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {template.sessionCount.toLocaleString()} guides use this template
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Avg. 4.91 outcome rating across all sessions
            </p>
          </div>
          <Link to="/onboarding?role=guide" className="btn-primary text-sm">
            Use this template
          </Link>
        </div>
      </div>
    </div>
  )
}
