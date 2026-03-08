import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, CreditCard, Calendar, Wifi, Loader2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { sessionsApi, bookingsApi, paymentsApi } from '../lib/services'
import { mapApiSession } from '../lib/mappers'
import { useAuth } from '../context/AuthContext'
import { AuthModal } from '../components/AuthModal'
import type { Session } from '../types'
import clsx from 'clsx'

type BookingStep = 'time' | 'payment' | 'confirm'

const TIME_SLOTS = [
  { date: 'Today', times: ['6:00 PM', '7:00 PM', '8:00 PM'] },
  { date: 'Tomorrow', times: ['9:00 AM', '10:00 AM', '2:00 PM', '4:00 PM', '7:00 PM'] },
  { date: 'Wednesday', times: ['11:00 AM', '1:00 PM', '5:00 PM', '8:00 PM'] },
  { date: 'Thursday', times: ['9:00 AM', '10:00 AM', '3:00 PM', '6:00 PM'] },
]

export function BookingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!id) return
    sessionsApi.get(id)
      .then(r => setSession(mapApiSession(r.data)))
      .catch(() => setSession(null))
      .finally(() => setSessionLoading(false))
  }, [id])

  const [step, setStep] = useState<BookingStep>('time')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (sessionLoading) {
    return <Layout noFooter><div className="flex items-center justify-center py-40"><Loader2 size={32} className="animate-spin text-brand-500" /></div></Layout>
  }

  if (!session) {
    return <Layout><div className="p-20 text-center"><Link to="/discover" className="btn-primary">Back</Link></div></Layout>
  }

  const steps: BookingStep[] = ['time', 'payment', 'confirm']
  const stepIndex = steps.indexOf(step)
  const progress = ((stepIndex + 1) / steps.length) * 100

  const handleBookAndPay = async () => {
    if (!isAuthenticated) { setShowAuthModal(true); return }
    setProcessing(true)
    setError(null)
    try {
      // Create booking
      const dateTime = `${selectedDate}T${selectedTime}:00.000Z`
      const bookingRes = await bookingsApi.create({
        sessionId: session.id,
        scheduledAt: dateTime,
      })
      // bookingId stored on server
      // Create payment intent
      await paymentsApi.createIntent(bookingRes.data.id)
      // For demo purposes, go straight to confirm
      // In production, you'd integrate Stripe Elements here
      setStep('confirm')
    } catch (err: any) {
      setError(err.message ?? 'Booking failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handlePayment = handleBookAndPay

  return (
    <>
    <Layout noFooter>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">{error}</div>}
        <div className="flex items-center gap-3 mb-6">
          <button className="btn-ghost py-1.5 px-2.5" onClick={() => step === 'time' ? navigate(-1) : setStep(steps[stepIndex - 1])}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs text-[var(--text-muted)]">Step {stepIndex + 1} of 3</span>
        </div>

        <div className="card p-4 mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-xl flex-shrink-0">
            {session.category.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] leading-snug">{session.title}</h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Clock size={12} /> {session.duration} min
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Wifi size={12} /> Remote
              </div>
            </div>
          </div>
          <span className="font-bold text-[var(--text-primary)]">${session.price}</span>
        </div>

        {step === 'time' && (
          <TimeStep
            slots={TIME_SLOTS}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            onNext={() => setStep('payment')}
          />
        )}

        {step === 'payment' && (
          <PaymentStep
            session={session}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            cardNumber={cardNumber}
            cardName={cardName}
            expiry={expiry}
            cvv={cvv}
            paymentMethod={paymentMethod}
            setCardNumber={setCardNumber}
            setCardName={setCardName}
            setExpiry={setExpiry}
            setCvv={setCvv}
            setPaymentMethod={setPaymentMethod}
            processing={processing}
            onPay={handlePayment}
          />
        )}

        {step === 'confirm' && (
          <ConfirmStep session={session} selectedDate={selectedDate} selectedTime={selectedTime} />
        )}
      </div>
    </Layout>
    {showAuthModal && (
      <AuthModal
        defaultMode="login"
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => { setShowAuthModal(false); handleBookAndPay() }}
      />
    )}
  </>
  )
}

function TimeStep({ slots, selectedDate, selectedTime, setSelectedDate, setSelectedTime, onNext }: {
  slots: typeof TIME_SLOTS
  selectedDate: string
  selectedTime: string
  setSelectedDate: (d: string) => void
  setSelectedTime: (t: string) => void
  onNext: () => void
}) {
  return (
    <div>
      <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">Pick a time</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">All times shown in your local timezone.</p>

      <div className="space-y-5 mb-6">
        {slots.map(slot => (
          <div key={slot.date}>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-2">
              <Calendar size={13} /> {slot.date}
            </p>
            <div className="flex flex-wrap gap-2">
              {slot.times.map(time => (
                <button
                  key={time}
                  onClick={() => { setSelectedDate(slot.date); setSelectedTime(time) }}
                  className={clsx(
                    'px-4 py-2.5 rounded-2xl text-sm font-medium transition-all',
                    selectedDate === slot.date && selectedTime === time
                      ? 'bg-brand-500 text-white shadow-brand'
                      : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-primary w-full justify-center"
        disabled={!selectedDate || !selectedTime}
        onClick={onNext}
      >
        Confirm {selectedDate && selectedTime ? `${selectedDate} at ${selectedTime}` : 'time'}
        <ArrowRight size={16} />
      </button>
    </div>
  )
}

function PaymentStep({ session, selectedDate, selectedTime, cardNumber, cardName, expiry, cvv, paymentMethod, setCardNumber, setCardName, setExpiry, setCvv, setPaymentMethod, processing, onPay }: {
  session: import("../types").Session
  selectedDate: string
  selectedTime: string
  cardNumber: string
  cardName: string
  expiry: string
  cvv: string
  paymentMethod: 'card' | 'paypal'
  setCardNumber: (v: string) => void
  setCardName: (v: string) => void
  setExpiry: (v: string) => void
  setCvv: (v: string) => void
  setPaymentMethod: (v: 'card' | 'paypal') => void
  processing: boolean
  onPay: () => void
}) {
  if (!session) return null
  const fee = Math.round(session.price * 0.12)
  const total = session.price + fee

  const formatCard = (v: string) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  const formatExpiry = (v: string) => v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5)

  const cardReady = cardNumber.length >= 19 && cardName && expiry.length === 5 && cvv.length >= 3

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-[var(--text-primary)] mb-1">Payment</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6">You'll only be charged after confirming.</p>

      <div className="card p-4 mb-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[var(--text-secondary)]">Session fee</span>
          <span className="font-medium text-[var(--text-primary)]">${session.price}</span>
        </div>
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-[var(--text-secondary)]">Platform fee (12%)</span>
          <span className="font-medium text-[var(--text-primary)]">${fee}</span>
        </div>
        <div className="divider pt-3 flex items-center justify-between">
          <span className="font-semibold text-[var(--text-primary)]">Total</span>
          <span className="font-bold text-lg text-[var(--text-primary)]">${total}</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Booked for {selectedDate} at {selectedTime}
        </p>
      </div>

      {/* Payment method selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setPaymentMethod('card')}
          className={clsx(
            'flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 text-sm font-medium transition-all',
            paymentMethod === 'card'
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
          )}
        >
          <CreditCard size={16} />
          Credit card
        </button>
        <button
          onClick={() => setPaymentMethod('paypal')}
          className={clsx(
            'flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border-2 text-sm font-medium transition-all',
            paymentMethod === 'paypal'
              ? 'border-[#003087] bg-[#003087]/5 text-[#003087] dark:text-[#5b9bd5]'
              : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
          )}
        >
          {/* PayPal wordmark SVG */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.99l-.188 1.16c-.038.24.144.46.385.46h3.12c.46 0 .85-.334.923-.788l.038-.19.735-4.653.047-.258a.932.932 0 0 1 .923-.788h.581c3.76 0 6.704-1.528 7.56-5.949.36-1.847.174-3.388-.415-4.414z"/>
          </svg>
          PayPal
        </button>
      </div>

      {paymentMethod === 'card' && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="label">Card number</label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                className="input pl-10"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))}
                maxLength={19}
              />
            </div>
          </div>
          <div>
            <label className="label">Cardholder name</label>
            <input className="input" placeholder="Jordan Lee" value={cardName} onChange={e => setCardName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Expiry</label>
              <input className="input" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
            </div>
            <div>
              <label className="label">CVV</label>
              <input className="input" placeholder="123" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} />
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="mb-6 p-4 rounded-2xl bg-[#003087]/5 border border-[#003087]/20 text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-1">
            You'll be redirected to PayPal to complete the payment securely.
          </p>
          <p className="text-xs text-[var(--text-muted)]">Total: <strong>${total}</strong></p>
        </div>
      )}

      <button
        className="btn-primary w-full justify-center text-base py-3.5"
        disabled={processing || (paymentMethod === 'card' && !cardReady)}
        onClick={onPay}
      >
        {processing ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Processing...
          </span>
        ) : paymentMethod === 'paypal' ? (
          <>Continue to PayPal <ArrowRight size={16} /></>
        ) : (
          <>Pay ${total} and confirm booking <ArrowRight size={16} /></>
        )}
      </button>

      <p className="text-center text-xs text-[var(--text-muted)] mt-3">
        By confirming, you agree to SkillBridge's terms. Full refund if outcome not met.
      </p>
    </div>
  )
}

function ConfirmStep({ session, selectedDate, selectedTime }: {
  session: import("../types").Session
  selectedDate: string
  selectedTime: string
}) {
  if (!session) return null

  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 rounded-full bg-sage-50 dark:bg-sage-950 flex items-center justify-center mx-auto mb-6">
        <div className="w-14 h-14 rounded-full bg-sage-500 flex items-center justify-center">
          <Check size={28} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <h2 className="font-display font-bold text-2xl text-[var(--text-primary)] mb-2">You're booked!</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
        Your session with {session.guide.name} is confirmed. A calendar invite and meeting link have been sent to your email.
      </p>

      <div className="card p-5 text-left mb-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Session</span>
            <span className="font-medium text-[var(--text-primary)] text-right max-w-[200px] line-clamp-1">{session.title}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Date & time</span>
            <span className="font-medium text-[var(--text-primary)]">{selectedDate} at {selectedTime}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Guide</span>
            <span className="font-medium text-[var(--text-primary)]">{session.guide.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Format</span>
            <div className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
              <Wifi size={14} /> Remote — link sent to email
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/dashboard/learner" className="btn-primary justify-center">
          View my sessions
        </Link>
        <Link to="/discover" className="btn-ghost justify-center">
          Discover more sessions
        </Link>
      </div>
    </div>
  )
}