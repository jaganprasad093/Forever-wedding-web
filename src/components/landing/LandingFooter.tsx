import Link from 'next/link'
import { Heart, Sparkles, ArrowRight } from 'lucide-react'

export default function LandingFooter() {
  return (
    <footer className="bg-stone-950 text-stone-400 pt-20 pb-12 px-4 sm:px-6 lg:px-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand info (2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-gold">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-serif text-2xl text-white font-medium">
                Forever<span className="italic text-amber-400 font-normal">Vows</span>
              </span>
            </Link>

            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              The modern way to announce your celebration. Exquisite digital wedding invitations with background music, RSVP tracking, love story timeline, and Google Maps venue guidance.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-xs text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>100% Eco-friendly &amp; Carbon Neutral</span>
            </div>
          </div>

          {/* Column: Templates */}
          <div>
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-4">
              Designer Themes
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/templates/preview/kerala-traditional" className="hover:text-amber-300 transition-colors">
                  Kerala Traditional
                </Link>
              </li>
              <li>
                <Link href="/templates/preview/royal-gold" className="hover:text-amber-300 transition-colors">
                  Royal Midnight Gold
                </Link>
              </li>
              <li>
                <Link href="/templates/preview/floral-romantic" className="hover:text-amber-300 transition-colors">
                  Floral Romance
                </Link>
              </li>
              <li>
                <Link href="/templates/preview/minimal-white" className="hover:text-amber-300 transition-colors">
                  Minimal Editorial
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 pt-1">
                  <span>View All Templates</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: Product */}
          <div>
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <a href="#features" className="hover:text-amber-300 transition-colors">
                  Features &amp; RSVP
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-amber-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-amber-300 transition-colors">
                  Love Stories
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-amber-300 transition-colors">
                  FAQ &amp; Help
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Account */}
          <div>
            <h4 className="text-white text-xs uppercase tracking-widest font-semibold mb-4">
              Get Started
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/register" className="hover:text-amber-300 transition-colors font-semibold text-white">
                  Create Free Invitation
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-300 transition-colors">
                  Sign In to Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-amber-300 transition-colors">
                  RSVP Manager
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider & copyright */}
        <div className="pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} ForeverVows. Made with love for couples worldwide.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
