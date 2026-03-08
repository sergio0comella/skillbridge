import { PrismaClient, Role, SessionLevel, TemplateType, BadgeType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Categories ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'finance' }, update: {}, create: { slug: 'finance', label: 'Finance', icon: '💰', color: '#368e52' } }),
    prisma.category.upsert({ where: { slug: 'communication' }, update: {}, create: { slug: 'communication', label: 'Communication', icon: '🗣️', color: '#1a6aff' } }),
    prisma.category.upsert({ where: { slug: 'fitness' }, update: {}, create: { slug: 'fitness', label: 'Fitness', icon: '🏋️', color: '#e05c2a' } }),
    prisma.category.upsert({ where: { slug: 'tech' }, update: {}, create: { slug: 'tech', label: 'Tech', icon: '💻', color: '#7c3aed' } }),
    prisma.category.upsert({ where: { slug: 'language' }, update: {}, create: { slug: 'language', label: 'Language', icon: '🌍', color: '#0891b2' } }),
    prisma.category.upsert({ where: { slug: 'creative' }, update: {}, create: { slug: 'creative', label: 'Creative', icon: '🎨', color: '#db2777' } }),
    prisma.category.upsert({ where: { slug: 'business' }, update: {}, create: { slug: 'business', label: 'Business', icon: '📊', color: '#d97706' } }),
    prisma.category.upsert({ where: { slug: 'mindfulness' }, update: {}, create: { slug: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: '#059669' } }),
    prisma.category.upsert({ where: { slug: 'cooking' }, update: {}, create: { slug: 'cooking', label: 'Cooking', icon: '👨‍🍳', color: '#dc2626' } }),
    prisma.category.upsert({ where: { slug: 'music' }, update: {}, create: { slug: 'music', label: 'Music', icon: '🎵', color: '#7c3aed' } }),
  ])
  console.log('✅ Categories seeded')

  // ── Templates ───────────────────────────────────────────────────────────────
  const templateData = [
    {
      id: TemplateType.SKILL_BREAKDOWN,
      title: 'Skill Breakdown',
      subtitle: 'Master a skill step by step',
      description: 'Break complex skills into clear, learnable components with guided practice.',
      color: '#1a6aff',
      icon: '🧩',
      bestFor: ['Complex skills', 'Beginners', 'Structured learning'],
      steps: [
        { order: 1, title: 'Concept Overview', description: 'Introduce the skill and its core principles', duration: '5 min', tip: 'Use real-world analogies' },
        { order: 2, title: 'Component Breakdown', description: 'Identify and explain each sub-skill', duration: '10 min', tip: 'Limit to 3–5 components' },
        { order: 3, title: 'Guided Practice', description: 'Walk through examples together', duration: '15 min', tip: 'Think aloud as you demonstrate' },
        { order: 4, title: 'Learner Attempt', description: 'Learner tries independently', duration: '10 min', tip: 'Observe without interrupting' },
        { order: 5, title: 'Feedback & Recap', description: 'Targeted feedback and summary', duration: '5 min', tip: 'Focus on 2–3 key improvements' },
      ],
    },
    {
      id: TemplateType.QUICK_START,
      title: 'Quick Start',
      subtitle: 'Get results in 45 minutes',
      description: 'Fast-track to practical results. Perfect for people who want to dive in immediately.',
      color: '#e05c2a',
      icon: '⚡',
      bestFor: ['Beginners', 'Quick wins', 'Hands-on learners'],
      steps: [
        { order: 1, title: 'Goal Alignment', description: 'Clarify what success looks like', duration: '5 min', tip: 'Be specific about the outcome' },
        { order: 2, title: 'Essential Tools', description: 'Show only what is needed right now', duration: '5 min', tip: 'Less is more — resist the urge to over-explain' },
        { order: 3, title: 'First Win', description: 'Get the learner a small, visible result', duration: '20 min', tip: 'Celebrate even small progress' },
        { order: 4, title: 'Next Steps', description: 'Outline what to do after the session', duration: '15 min', tip: 'Provide a short checklist' },
      ],
    },
    {
      id: TemplateType.PRACTICAL_DRILL,
      title: 'Practical Drill',
      subtitle: 'Build muscle memory through repetition',
      description: 'Focused repetition and feedback loops to build lasting habits and reflexes.',
      color: '#059669',
      icon: '🎯',
      bestFor: ['Skill refinement', 'Intermediate learners', 'Habit building'],
      steps: [
        { order: 1, title: 'Warm Up', description: 'Review basics and set drill goals', duration: '5 min', tip: 'Check prior knowledge gaps first' },
        { order: 2, title: 'Drill Round 1', description: 'First repetition with full guidance', duration: '10 min', tip: 'Go slow — accuracy before speed' },
        { order: 3, title: 'Drill Round 2', description: 'Repeat with less guidance', duration: '10 min', tip: 'Notice where hesitation appears' },
        { order: 4, title: 'Drill Round 3', description: 'Independent attempt under mild time pressure', duration: '10 min', tip: 'Timer creates productive stress' },
        { order: 5, title: 'Review & Correct', description: 'Identify patterns and correct misconceptions', duration: '10 min', tip: 'Compare rounds to show progress' },
      ],
    },
    {
      id: TemplateType.CONCEPT_TO_ACTION,
      title: 'Concept to Action',
      subtitle: 'Turn knowledge into real decisions',
      description: 'Bridge the gap between theory and application with real-world scenarios.',
      color: '#d97706',
      icon: '🚀',
      bestFor: ['Theory learners', 'Decision making', 'Applied skills'],
      steps: [
        { order: 1, title: 'Core Concept', description: 'Explain the theory clearly and concisely', duration: '10 min', tip: 'Use a memorable mental model' },
        { order: 2, title: 'Real-World Context', description: 'Show how the concept applies in practice', duration: '10 min', tip: 'Use examples from your own experience' },
        { order: 3, title: 'Scenario Practice', description: 'Work through a realistic scenario together', duration: '15 min', tip: 'Role-play builds confidence' },
        { order: 4, title: 'Your Situation', description: 'Apply to the learner\'s specific context', duration: '10 min', tip: 'Ask "how would YOU apply this?"' },
      ],
    },
  ]

  for (const t of templateData) {
    const { steps, ...templateFields } = t
    await prisma.template.upsert({
      where: { id: templateFields.id },
      update: {},
      create: {
        ...templateFields,
        sessionCount: 0,
        steps: { create: steps },
      },
    })
  }
  console.log('✅ Templates seeded')

  // ── Guide users ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password1', 12)

  const guides = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alex.chen@demo.skillbridge.app' },
      update: {},
      create: {
        email: 'alex.chen@demo.skillbridge.app',
        passwordHash,
        name: 'Alex Chen',
        role: Role.DUAL,
        bio: 'Former Goldman Sachs analyst. I break down complex financial concepts into simple, actionable knowledge.',
        location: 'New York, NY',
        verified: true,
        responseTime: '< 1 hour',
        completionRate: 98,
        skills: { create: [{ skill: 'Finance' }, { skill: 'Investing' }, { skill: 'ETFs' }, { skill: 'Portfolio Management' }] },
        badges: { create: [{ badge: BadgeType.TOP_GUIDE }, { badge: BadgeType.VERIFIED }] },
      },
    }),
    prisma.user.upsert({
      where: { email: 'maya.patel@demo.skillbridge.app' },
      update: {},
      create: {
        email: 'maya.patel@demo.skillbridge.app',
        passwordHash,
        name: 'Maya Patel',
        role: Role.DUAL,
        bio: 'TED speaker coach & startup communication trainer. Helped 200+ founders pitch better.',
        location: 'San Francisco, CA',
        verified: true,
        responseTime: '< 30 min',
        completionRate: 99,
        skills: { create: [{ skill: 'Public Speaking' }, { skill: 'Storytelling' }, { skill: 'Pitch Decks' }] },
        badges: { create: [{ badge: BadgeType.RISING_STAR }, { badge: BadgeType.VERIFIED }] },
      },
    }),
    prisma.user.upsert({
      where: { email: 'james.okafor@demo.skillbridge.app' },
      update: {},
      create: {
        email: 'james.okafor@demo.skillbridge.app',
        passwordHash,
        name: 'James Okafor',
        role: Role.GUIDE,
        bio: 'Full-stack engineer at Stripe. I teach practical coding skills with real-world applications.',
        location: 'London, UK',
        verified: true,
        responseTime: '< 2 hours',
        completionRate: 97,
        skills: { create: [{ skill: 'JavaScript' }, { skill: 'React' }, { skill: 'Node.js' }] },
        badges: { create: [{ badge: BadgeType.VERIFIED }] },
      },
    }),
    prisma.user.upsert({
      where: { email: 'sofia.reyes@demo.skillbridge.app' },
      update: {},
      create: {
        email: 'sofia.reyes@demo.skillbridge.app',
        passwordHash,
        name: 'Sofia Reyes',
        role: Role.GUIDE,
        bio: 'Mindfulness teacher certified by the Mindfulness-Based Stress Reduction institute. 6 years teaching experience.',
        location: 'Barcelona, Spain',
        verified: true,
        responseTime: '< 4 hours',
        completionRate: 100,
        skills: { create: [{ skill: 'Mindfulness' }, { skill: 'Meditation' }, { skill: 'Stress Management' }] },
        badges: { create: [{ badge: BadgeType.PERFECT_SCORE }, { badge: BadgeType.VERIFIED }] },
      },
    }),
  ])
  console.log('✅ Guide users seeded')

  const [alexId, mayaId, jamesId, sofiaId] = guides.map(g => g.id)
  const financeId = categories.find(c => c.slug === 'finance')!.id
  const commId = categories.find(c => c.slug === 'communication')!.id
  const techId = categories.find(c => c.slug === 'tech')!.id
  const mindId = categories.find(c => c.slug === 'mindfulness')!.id

  // ── Sessions ─────────────────────────────────────────────────────────────────
  const sessionData = [
    {
      title: 'ETF Investing: Build a Portfolio That Works',
      outcome: 'You will understand what ETFs are, how to evaluate them, and walk away with a personalised 3-fund portfolio strategy.',
      duration: 45,
      price: 29,
      level: SessionLevel.BEGINNER,
      template: TemplateType.SKILL_BREAKDOWN,
      remote: true,
      local: false,
      featured: true,
      trending: true,
      totalBooked: 214,
      averageRating: 4.97,
      reviewCount: 214,
      takeaway: 'A personalised 3-fund portfolio plan with specific ETF tickers, allocation percentages, and monthly contribution targets.',
      followUpExercise: 'Open a brokerage account and set up a recurring $50 investment in your chosen ETFs. Track for 30 days.',
      nextAvailable: 'Tomorrow at 6 PM',
      guideId: alexId,
      categoryId: financeId,
      steps: [
        { order: 1, title: 'What ETFs actually are', duration: 8, description: 'Demystify the jargon and understand why ETFs beat most active funds.' },
        { order: 2, title: 'Evaluating ETF quality', duration: 10, description: 'Expense ratios, tracking error, liquidity — what actually matters.' },
        { order: 3, title: 'Building your allocation', duration: 15, description: 'The 3-fund portfolio explained. We map it to your age and risk tolerance.' },
        { order: 4, title: 'Practical setup walkthrough', duration: 7, description: 'Setting up auto-invest, tax accounts, and rebalancing reminders.' },
        { order: 5, title: 'Your personalised plan', duration: 5, description: 'Review and finalise your specific tickers and contribution schedule.' },
      ],
      materials: ['Calculator', 'Brokerage account (Fidelity/Vanguard/Schwab)', 'Monthly savings amount in mind'],
      tags: ['ETFs', 'Investing', 'Portfolio', 'Index Funds', 'FIRE'],
    },
    {
      title: 'Pitch Like a Founder: 5-Minute Storytelling',
      outcome: 'You will have a crisp, memorable 5-minute pitch for your idea or business, rehearsed and ready to deliver.',
      duration: 45,
      price: 35,
      level: SessionLevel.INTERMEDIATE,
      template: TemplateType.CONCEPT_TO_ACTION,
      remote: true,
      local: true,
      featured: true,
      trending: false,
      totalBooked: 178,
      averageRating: 4.94,
      reviewCount: 178,
      takeaway: 'A written 5-minute pitch script with a clear Problem → Solution → Traction → Ask structure.',
      followUpExercise: 'Record yourself delivering the pitch and watch it back. Note any filler words or pacing issues.',
      nextAvailable: 'Today at 7 PM',
      guideId: mayaId,
      categoryId: commId,
      steps: [
        { order: 1, title: 'The anatomy of a great pitch', duration: 8, description: 'Problem → Solution → Traction → Ask — and why order matters.' },
        { order: 2, title: 'Your opening hook', duration: 10, description: 'The first 30 seconds decide everything. We craft yours.' },
        { order: 3, title: 'Draft your full pitch', duration: 15, description: 'Collaborative writing sprint to structure your key messages.' },
        { order: 4, title: 'Deliver and refine', duration: 12, description: 'Practice run with live coaching on pacing and presence.' },
      ],
      materials: ['Your idea / business overview (2–3 sentences)', 'Optional: one slide or visual'],
      tags: ['Pitching', 'Storytelling', 'Startup', 'Communication', 'Public Speaking'],
    },
    {
      title: 'React Hooks Deep Dive: useState to useCallback',
      outcome: 'You will understand the full React hooks lifecycle and be able to optimise a real component with memoization.',
      duration: 45,
      price: 40,
      level: SessionLevel.INTERMEDIATE,
      template: TemplateType.PRACTICAL_DRILL,
      remote: true,
      local: false,
      featured: false,
      trending: true,
      totalBooked: 132,
      averageRating: 4.91,
      reviewCount: 132,
      takeaway: 'A refactored component with proper useCallback/useMemo usage and a mental model for when to use each hook.',
      followUpExercise: 'Find one slow component in your codebase and apply the optimisation patterns from this session.',
      nextAvailable: 'Wednesday at 10 AM',
      guideId: jamesId,
      categoryId: techId,
      steps: [
        { order: 1, title: 'Hooks mental model', duration: 8, description: 'How the React render cycle works and where hooks fit in.' },
        { order: 2, title: 'useState & useEffect patterns', duration: 10, description: 'Common mistakes and the correct patterns for side effects.' },
        { order: 3, title: 'useCallback & useMemo', duration: 15, description: 'When and why to memoize. We optimise a real component together.' },
        { order: 4, title: 'Custom hook extraction', duration: 12, description: 'Extract reusable logic into a clean custom hook.' },
      ],
      materials: ['Laptop with Node.js installed', 'A React project you are working on (optional)'],
      tags: ['React', 'Hooks', 'JavaScript', 'Performance', 'Frontend'],
    },
    {
      title: 'Morning Mindfulness: Build a 10-Minute Practice',
      outcome: 'You will complete a guided 10-minute morning practice and have a personalised routine you can repeat daily.',
      duration: 30,
      price: 19,
      level: SessionLevel.BEGINNER,
      template: TemplateType.QUICK_START,
      remote: true,
      local: true,
      featured: true,
      trending: false,
      totalBooked: 98,
      averageRating: 5.0,
      reviewCount: 98,
      takeaway: 'A written daily routine card with specific breath counts, timing, and personalised anchors for your practice.',
      followUpExercise: 'Do the practice every morning for 7 days. Note in a journal how you feel before and after.',
      nextAvailable: 'Today at 8 AM',
      guideId: sofiaId,
      categoryId: mindId,
      steps: [
        { order: 1, title: 'Setting your intention', duration: 5, description: 'Clarify what you want from mindfulness and choose your anchor.' },
        { order: 2, title: 'Guided practice', duration: 15, description: 'A full 10-minute guided session you can record and replay.' },
        { order: 3, title: 'Building the habit', duration: 10, description: 'Habit-stacking and environmental design for daily consistency.' },
      ],
      materials: ['Quiet space', 'Comfortable seat or cushion', 'Timer (phone is fine)'],
      tags: ['Mindfulness', 'Meditation', 'Habits', 'Mental Health', 'Morning Routine'],
    },
  ]

  for (const s of sessionData) {
    const { steps, materials, tags, ...rest } = s
    const existing = await prisma.session.findFirst({ where: { title: s.title, guideId: s.guideId } })
    if (!existing) {
      await prisma.session.create({
        data: {
          ...rest,
          steps: { create: steps },
          materials: { create: materials.map(label => ({ label })) },
          tags: { create: tags.map(tag => ({ tag })) },
        },
      })
    }
  }
  console.log('✅ Sessions seeded')

  // ── Demo learner account ─────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'learner@demo.skillbridge.app' },
    update: {},
    create: {
      email: 'learner@demo.skillbridge.app',
      passwordHash,
      name: 'Demo Learner',
      role: Role.LEARNER,
      bio: 'Lifelong learner exploring new skills.',
      verified: true,
      badges: { create: [{ badge: BadgeType.ACTIVE_LEARNER }] },
    },
  })
  console.log('✅ Demo learner seeded')

  console.log('\n🎉 Seed complete!')
  console.log('Demo accounts (password: Password1):')
  console.log('  learner@demo.skillbridge.app  — Learner')
  console.log('  alex.chen@demo.skillbridge.app — Guide (Finance)')
  console.log('  maya.patel@demo.skillbridge.app — Guide (Communication)')
  console.log('  james.okafor@demo.skillbridge.app — Guide (Tech)')
  console.log('  sofia.reyes@demo.skillbridge.app — Guide (Mindfulness)')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
