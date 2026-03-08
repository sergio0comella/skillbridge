import { Link } from 'react-router-dom'
import { Twitter, Linkedin, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-subtle)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-brand">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 9 C2 5.5 5.5 3 9 3 C12.5 3 16 5.5 16 9" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                  <path d="M5 12 L9 8 L13 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="8" r="1.5" fill="white"/>
                </svg>
              </div>
              <span className="font-display font-bold text-[var(--text-primary)] text-lg">
                Skill<span className="text-brand-500">Bridge</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs mb-4">
              Peer-to-peer micro-learning marketplace. Learn any practical skill in 30–45 minute outcome-driven sessions.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: <Twitter size={16} />, href: '#' },
                { icon: <Linkedin size={16} />, href: '#' },
                { icon: <Instagram size={16} />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Product',
              links: [
                { label: 'Discover Sessions', to: '/discover' },
                { label: 'Become a Guide', to: '/onboarding' },
                { label: 'Teaching Templates', to: '/templates' },
                { label: 'Pricing', to: '/pricing' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About', to: '/about' },
                { label: 'Blog', to: '/blog' },
                { label: 'Careers', to: '/careers' },
                { label: 'Press', to: '/press' },
              ],
            },
            {
              title: 'Support',
              links: [
                { label: 'Help Center', to: '/help' },
                { label: 'Trust & Safety', to: '/safety' },
                { label: 'Community', to: '/community' },
                { label: 'Contact', to: '/contact' },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="divider pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span>© 2025 SkillBridge Technologies, Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-[var(--text-secondary)] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
