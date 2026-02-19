import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Store, TrendingUp, ArrowRight, Globe, QrCode, UtensilsCrossed, ClipboardList, BarChart3, ShieldCheck, Users2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const heroSlides = [
  { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80', alt: 'Restaurant interior' },
  { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80', alt: 'Chef preparing food' },
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80', alt: 'Restaurant table service' }
]

const translations = {
  en: {
    signIn: 'Sign In', getStarted: 'Get Started',
    heroTitle1: 'Grow Your Restaurant', heroTitle2: 'With Faster Ordering',
    heroText: 'SwiftLink helps restaurants sell more with QR menu ordering, faster kitchen coordination, and smoother delivery management.',
    heroSubText: 'Customers scan, order, and pay faster. Your team receives clean, structured orders instantly.',
    trial: 'Start free. Upgrade only when your volume grows.', tryFree: 'Start Free', seePricing: 'View Pricing',
    badge1: 'QR Menu', badge2: 'Kitchen Flow', badge3: 'Delivery Ready', imageCaption: 'One QR experience from table to kitchen to delivery.',
    businessTitle: 'Why Restaurants Choose SwiftLink', businessText: 'Give customers a modern ordering experience while your team operates with less friction and more speed.',
    businessPoint1: 'Reduce waiting time with direct table-to-kitchen QR orders.', businessPoint2: 'Keep service fluid during rush hours with a clear order pipeline.',
    businessPoint3: 'Offer a cleaner, smarter digital menu experience.', businessPoint4: 'Turn more visits into repeat customers with consistent service.',
    overviewTitle: 'What You Get', overviewText: 'SwiftLink combines restaurant ordering and delivery execution in one platform made for real-world service.',
    o1Title: 'Smooth Order Operations', o1Text: 'Every order moves clearly from pending to preparing to ready, so teams stay aligned and fast.',
    o2Title: 'QR Menu Ordering', o2Text: 'Each table has its QR code. Customers scan, browse your menu, add items, and send orders in seconds.',
    o3Title: 'Revenue-Oriented Growth', o3Text: 'Upgrade plans as your business grows and unlock higher limits, premium tools, and better support.',
    planTitle: 'Choose the Plan That Matches Your Stage',
    planText: 'Each plan fits a growth phase. Start lean, then unlock more power as demand increases.',
    planFreeTitle: 'Free', planProTitle: 'Pro', planUltimateTitle: 'Ultimate',
    plan1a: 'Ideal to launch and validate your first digital flow.', plan1b: 'Up to 5 QR tables.', plan1c: 'Core dashboard features.', plan1d: 'Perfect for small teams.',
    plan2a: 'Built for stable daily traffic.', plan2b: 'Unlimited QR tables.', plan2c: 'Priority support.', plan2d: 'Great for growth-focused teams.',
    plan3a: 'For high-volume and multi-site expansion.', plan3b: 'Premium capabilities.', plan3c: 'Top support level.', plan3d: 'Full control at scale.',
    qrTitle: 'How QR Ordering Works', qrText: 'A simple experience that increases speed and reduces friction.',
    q1: 'Generate table QR codes in QR Tables.', q2: 'Customer scans and opens your menu instantly.', q3: 'Customer selects dishes and submits order.', q4: 'Kitchen receives order live and updates status.', qrResult: 'faster table turnover, clearer service, happier customers.',
    featuresTitle: 'Built for Daily Performance', featuresText: 'Essential capabilities for fluid operations from first order to final delivery.',
    f1Title: 'Real-Time Visibility', f1Text: 'Track active orders and keep teams synchronized.',
    f2Title: 'Restaurant Control Center', f2Text: 'Manage menu, QR tables, and kitchen flow in one place.',
    f3Title: 'Business Performance', f3Text: 'Understand trends and improve service quality over time.',
    audienceTitle: 'Who Benefits Most', audienceText: 'SwiftLink creates value for every side of the service experience.',
    a1Title: 'Restaurant Teams', a1Text: 'Less chaos, better coordination, quicker execution.',
    a2Title: 'Drivers', a2Text: 'Clear assignment flow and better delivery tracking.',
    a3Title: 'Customers', a3Text: 'Fast contactless ordering with a smooth table experience.',
    ctaTitle: 'Ready to Modernize Your Restaurant Service?', ctaText: 'Launch your QR ordering flow and scale with the plan that fits your goals.', ctaButton: 'Create Your Account',
    footerTagline: 'Modern restaurant ordering and delivery operations in one platform.',
    product: 'Product', company: 'Company', legal: 'Legal', pricing: 'Pricing', liveDemo: 'Live Demo', restaurantLogin: 'Restaurant Login', driverLogin: 'Driver Login',
    about: 'About Us', careers: 'Careers', docs: 'Documentation', status: 'System Status', privacy: 'Privacy Policy', terms: 'Terms of Service', support: 'Contact Support', email: 'Email', phone: 'Phone', rights: 'All rights reserved.'
  },
  fr: {
    signIn: 'Connexion', getStarted: 'Commencer',
    heroTitle1: 'Fais Grandir Ton Restaurant', heroTitle2: 'Avec des Commandes Plus Rapides',
    heroText: 'SwiftLink aide les restaurants a vendre plus grace au menu QR, a une meilleure coordination cuisine et a une gestion livraison plus fluide.',
    heroSubText: 'Le client scanne, commande, et gagne du temps. Ton equipe recoit des commandes claires instantanement.',
    trial: 'Commence gratuitement. Upgrade seulement quand ton volume augmente.', tryFree: 'Commencer Gratuitement', seePricing: 'Voir les Tarifs',
    badge1: 'Menu QR', badge2: 'Flux Cuisine', badge3: 'Livraison Prete', imageCaption: 'Une experience QR de la table a la cuisine puis a la livraison.',
    businessTitle: 'Pourquoi les Restaurants Choisissent SwiftLink', businessText: 'Offre une experience moderne aux clients pendant que ton equipe opere plus vite avec moins de friction.',
    businessPoint1: 'Reduis l attente avec les commandes directes table -> cuisine.', businessPoint2: 'Garde un service fluide aux heures de pointe.',
    businessPoint3: 'Propose un menu digital plus moderne.', businessPoint4: 'Transforme plus de visites en clients fideles.',
    overviewTitle: 'Ce Que Tu Obtiens', overviewText: 'SwiftLink combine commandes restaurant et execution livraison dans une plateforme pensee pour le terrain.',
    o1Title: 'Operations Fluides', o1Text: 'Chaque commande suit un flux clair: pending -> preparing -> ready.',
    o2Title: 'Commande Menu par QR', o2Text: 'Chaque table a son QR code. Le client scanne, choisit et envoie en quelques secondes.',
    o3Title: 'Croissance Orientee Revenus', o3Text: 'Passe au plan superieur quand ton activite augmente.',
    planTitle: 'Choisis le Plan Adapte a Ton Stade', planText: 'Chaque plan correspond a une phase de croissance.',
    planFreeTitle: 'Free', planProTitle: 'Pro', planUltimateTitle: 'Ultimate',
    plan1a: 'Ideal pour lancer ton flux digital.', plan1b: 'Jusqu a 5 tables QR.', plan1c: 'Fonctions essentielles.', plan1d: 'Parfait pour debuter.',
    plan2a: 'Pense pour trafic quotidien stable.', plan2b: 'Tables QR illimitees.', plan2c: 'Support prioritaire.', plan2d: 'Excellent pour la croissance.',
    plan3a: 'Pour fort volume et expansion multi-sites.', plan3b: 'Capacites premium.', plan3c: 'Support maximal.', plan3d: 'Controle total.',
    qrTitle: 'Comment la Commande QR Fonctionne', qrText: 'Une experience simple qui augmente la vitesse.',
    q1: 'Genere les QR dans QR Tables.', q2: 'Le client scanne et ouvre le menu.', q3: 'Le client choisit puis envoie.', q4: 'La cuisine recoit en direct.', qrResult: 'rotation plus rapide des tables et clients plus satisfaits.',
    featuresTitle: 'Concu pour la Performance Quotidienne', featuresText: 'Des capacites essentielles pour des operations fluides.',
    f1Title: 'Visibilite en Temps Reel', f1Text: 'Suis les commandes actives.',
    f2Title: 'Centre de Controle Restaurant', f2Text: 'Gere menu, tables QR et flux cuisine.',
    f3Title: 'Performance Business', f3Text: 'Analyse les tendances pour ameliorer le service.',
    audienceTitle: 'Qui En Profite le Plus', audienceText: 'SwiftLink cree de la valeur pour chaque acteur du service.',
    a1Title: 'Equipes Restaurant', a1Text: 'Moins de chaos, meilleure coordination.', a2Title: 'Livreurs', a2Text: 'Attribution claire et suivi fiable.', a3Title: 'Clients', a3Text: 'Commande rapide et fluide a table.',
    ctaTitle: 'Pret a Moderniser le Service de Ton Restaurant?', ctaText: 'Lance ton flux menu QR et monte en puissance.', ctaButton: 'Creer Ton Compte',
    footerTagline: 'Operations modernes de commande et livraison restaurant sur une seule plateforme.',
    product: 'Produit', company: 'Entreprise', legal: 'Legal', pricing: 'Tarifs', liveDemo: 'Demo', restaurantLogin: 'Connexion restaurant', driverLogin: 'Connexion livreur',
    about: 'A propos', careers: 'Carrieres', docs: 'Documentation', status: 'Statut systeme', privacy: 'Confidentialite', terms: 'Conditions', support: 'Support', email: 'Email', phone: 'Telephone', rights: 'Tous droits reserves.'
  }
}

export default function Landing() {
  const { language, changeLanguage } = useTheme()
  const t = translations[language] || translations.en
  const [slideIndex, setSlideIndex] = useState(0)

  const planBullets = useMemo(
    () => ({
      free: [t.plan1a, t.plan1b, t.plan1c, t.plan1d],
      pro: [t.plan2a, t.plan2b, t.plan2c, t.plan2d],
      ultimate: [t.plan3a, t.plan3b, t.plan3c, t.plan3d]
    }),
    [t]
  )

  useEffect(() => {
    const hero = document.querySelector('[data-hero]')
    if (hero) requestAnimationFrame(() => hero.classList.add('is-visible'))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16 }
    )

    const revealElements = document.querySelectorAll('[data-reveal]')
    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min((index % 6) * 70, 280)}ms`
      observer.observe(element)
    })

    const animate = (element, keyframes, options) => {
      if (!element || typeof element.animate !== 'function') return
      element.animate(keyframes, options)
    }

    const buttons = Array.from(document.querySelectorAll('[data-js-btn]'))
    const listeners = buttons.map((button) => {
      const onEnter = () =>
        animate(
          button,
          [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-2px) scale(1.03)' }],
          { duration: 180, fill: 'forwards', easing: 'ease-out' }
        )
      const onLeave = () =>
        animate(
          button,
          [{ transform: 'translateY(-2px) scale(1.03)' }, { transform: 'translateY(0) scale(1)' }],
          { duration: 160, fill: 'forwards', easing: 'ease-out' }
        )
      const onClick = () =>
        animate(
          button,
          [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(1px) scale(0.98)' }, { transform: 'translateY(0) scale(1)' }],
          { duration: 220, easing: 'ease-out' }
        )

      button.addEventListener('mouseenter', onEnter)
      button.addEventListener('mouseleave', onLeave)
      button.addEventListener('click', onClick)
      return { button, onEnter, onLeave, onClick }
    })

    const intervalId = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length)
    }, 4200)

    return () => {
      window.clearInterval(intervalId)
      observer.disconnect()
      revealElements.forEach((element) => {
        element.style.transitionDelay = ''
      })
      listeners.forEach(({ button, onEnter, onLeave, onClick }) => {
        button.removeEventListener('mouseenter', onEnter)
        button.removeEventListener('mouseleave', onLeave)
        button.removeEventListener('click', onClick)
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-dark-surface">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <img src="/swiftlink_logos_png/logo-icon.png" alt="SwiftLink" className="w-10 h-10 rounded-lg" />
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">SwiftLink</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => changeLanguage(language === 'en' ? 'fr' : 'en')}
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base font-medium"
                data-js-btn
              >
                <Globe size={16} />
                {language === 'en' ? 'FR' : 'EN'}
              </button>
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base font-medium" data-js-btn>
                {t.signIn}
              </Link>
              <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors" data-js-btn>
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10 reveal" data-hero>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 reveal" data-reveal>
              {t.heroTitle1}
              <span className="text-primary block">{t.heroTitle2}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-4 reveal" data-reveal>
              {t.heroText}
            </p>
            <p className="text-base text-gray-500 dark:text-gray-400 mb-8 reveal" data-reveal>
              {t.heroSubText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start reveal" data-reveal>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors" data-js-btn>
                {t.tryFree}
                <ArrowRight size={20} />
              </Link>
              <Link to="/pricing" className="inline-flex items-center justify-center gap-2 bg-white dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface border border-light-border dark:border-dark-border px-8 py-4 rounded-xl text-lg font-semibold transition-colors" data-js-btn>
                {t.seePricing}
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t.trial}</p>
          </div>

          <div className="reveal" data-reveal>
            <div className="relative rounded-2xl bg-white dark:bg-dark-border border border-light-border dark:border-dark-border shadow-xl p-6 sm:p-7">
              <div className="relative h-64 sm:h-72 overflow-hidden rounded-xl">
                {heroSlides.map((slide, idx) => (
                  <img
                    key={slide.src}
                    src={slide.src}
                    alt={slide.alt}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${slideIndex === idx ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
                <button type="button" onClick={() => setSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2" aria-label="Previous slide" data-js-btn>
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={() => setSlideIndex((prev) => (prev + 1) % heroSlides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2" aria-label="Next slide" data-js-btn>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <div className="rounded-lg bg-primary/10 text-primary px-3 py-2 text-sm font-medium">{t.badge1}</div>
                <div className="rounded-lg bg-secondary/10 text-secondary px-3 py-2 text-sm font-medium">{t.badge2}</div>
                <div className="rounded-lg bg-warning/10 text-warning px-3 py-2 text-sm font-medium">{t.badge3}</div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">{t.imageCaption}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.businessTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{t.businessText}</p>
            <div className="space-y-3">
              {[t.businessPoint1, t.businessPoint2, t.businessPoint3, t.businessPoint4].map((point) => (
                <div key={point} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-dark-border border border-light-border dark:border-dark-border">
                  <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">{point}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal" data-reveal>
            <div className="rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-border p-6 shadow-lg">
              <img src="/swiftlink_logos_png/logo-main.png" alt="SwiftLink workflow" className="w-full h-44 object-contain rounded-lg bg-gray-50 dark:bg-dark-surface" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.overviewTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t.overviewText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-border reveal" data-reveal>
              <ClipboardList className="w-7 h-7 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.o1Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.o1Text}</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-border reveal" data-reveal>
              <QrCode className="w-7 h-7 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.o2Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.o2Text}</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-border reveal" data-reveal>
              <TrendingUp className="w-7 h-7 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.o3Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.o3Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.planTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t.planText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-dark-border border border-light-border dark:border-dark-border reveal" data-reveal>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.planFreeTitle}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">{planBullets.free.map((item) => <li key={item} className="flex items-start gap-2"><span className="text-primary mt-0.5">*</span><span>{item}</span></li>)}</ul>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-dark-border border border-primary/30 reveal" data-reveal>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.planProTitle}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">{planBullets.pro.map((item) => <li key={item} className="flex items-start gap-2"><span className="text-primary mt-0.5">*</span><span>{item}</span></li>)}</ul>
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-dark-border border border-light-border dark:border-dark-border reveal" data-reveal>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.planUltimateTitle}</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">{planBullets.ultimate.map((item) => <li key={item} className="flex items-start gap-2"><span className="text-primary mt-0.5">*</span><span>{item}</span></li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.qrTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t.qrText}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="rounded-2xl bg-white dark:bg-dark-border border border-light-border dark:border-dark-border p-6 reveal" data-reveal>
              <div className="space-y-4">{[t.q1, t.q2, t.q3, t.q4].map((step, idx) => <div key={step} className="flex items-start gap-3"><div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</div><p className="text-gray-700 dark:text-gray-300">{step}</p></div>)}</div>
            </div>
            <div className="rounded-2xl bg-white dark:bg-dark-border border border-light-border dark:border-dark-border p-6 reveal" data-reveal>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-primary/10 p-4 text-center"><QrCode className="mx-auto text-primary mb-2" /><p className="text-xs text-gray-600 dark:text-gray-300">Scan</p></div>
                <div className="rounded-lg bg-secondary/10 p-4 text-center"><UtensilsCrossed className="mx-auto text-secondary mb-2" /><p className="text-xs text-gray-600 dark:text-gray-300">Menu</p></div>
                <div className="rounded-lg bg-warning/10 p-4 text-center"><ClipboardList className="mx-auto text-warning mb-2" /><p className="text-xs text-gray-600 dark:text-gray-300">Order</p></div>
              </div>
              <div className="mt-4 rounded-lg bg-gray-50 dark:bg-dark-surface p-4"><p className="text-sm text-gray-600 dark:text-gray-300"><strong className="text-gray-900 dark:text-white">{language === 'en' ? 'Result:' : 'Resultat:'}</strong> {t.qrResult}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t.featuresText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white dark:bg-dark-border hover:shadow-lg transition-shadow reveal" data-reveal><div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6"><Truck className="w-7 h-7 text-primary" /></div><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.f1Title}</h3><p className="text-gray-600 dark:text-gray-400">{t.f1Text}</p></div>
            <div className="p-8 rounded-2xl bg-white dark:bg-dark-border hover:shadow-lg transition-shadow reveal" data-reveal><div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6"><Store className="w-7 h-7 text-primary" /></div><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.f2Title}</h3><p className="text-gray-600 dark:text-gray-400">{t.f2Text}</p></div>
            <div className="p-8 rounded-2xl bg-white dark:bg-dark-border hover:shadow-lg transition-shadow reveal" data-reveal><div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6"><BarChart3 className="w-7 h-7 text-primary" /></div><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.f3Title}</h3><p className="text-gray-600 dark:text-gray-400">{t.f3Text}</p></div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.audienceTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">{t.audienceText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-border border border-light-border dark:border-dark-border reveal" data-reveal><Store className="w-7 h-7 text-primary mb-3" /><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.a1Title}</h3><p className="text-gray-600 dark:text-gray-400">{t.a1Text}</p></div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-border border border-light-border dark:border-dark-border reveal" data-reveal><Truck className="w-7 h-7 text-primary mb-3" /><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.a2Title}</h3><p className="text-gray-600 dark:text-gray-400">{t.a2Text}</p></div>
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-dark-border border border-light-border dark:border-dark-border reveal" data-reveal><Users2 className="w-7 h-7 text-primary mb-3" /><h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.a3Title}</h3><p className="text-gray-600 dark:text-gray-400">{t.a3Text}</p></div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary reveal" data-reveal>
        <div className="max-w-4xl mx-auto text-center reveal" data-reveal>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{t.ctaTitle}</h2>
          <p className="text-xl text-white/80 mb-10">{t.ctaText}</p>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-colors" data-js-btn>{t.ctaButton}<ArrowRight size={20} /></Link>
        </div>
      </section>

      <footer className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2"><Link to="/" className="inline-flex items-center gap-3"><img src="/swiftlink_logos_png/logo-icon.png" alt="SwiftLink" className="w-10 h-10 rounded-lg" /><span className="text-2xl font-bold text-white">SwiftLink</span></Link><p className="mt-4 text-sm text-gray-400 max-w-md">{t.footerTagline}</p></div>
            <div><h4 className="text-white font-semibold mb-4">{t.product}</h4><div className="space-y-3 text-sm"><Link to="/pricing" className="block text-gray-400 hover:text-white">{t.pricing}</Link><Link to="/docs" className="block text-gray-400 hover:text-white">{t.liveDemo}</Link><Link to="/login" className="block text-gray-400 hover:text-white">{t.restaurantLogin}</Link><Link to="/login" className="block text-gray-400 hover:text-white">{t.driverLogin}</Link></div></div>
            <div><h4 className="text-white font-semibold mb-4">{t.company}</h4><div className="space-y-3 text-sm"><Link to="/about" className="block text-gray-400 hover:text-white">{t.about}</Link><Link to="/careers" className="block text-gray-400 hover:text-white">{t.careers}</Link><Link to="/docs" className="block text-gray-400 hover:text-white">{t.docs}</Link><Link to="/status" className="block text-gray-400 hover:text-white">{t.status}</Link></div></div>
            <div><h4 className="text-white font-semibold mb-4">{t.legal}</h4><div className="space-y-3 text-sm"><Link to="/privacy" className="block text-gray-400 hover:text-white">{t.privacy}</Link><Link to="/terms" className="block text-gray-400 hover:text-white">{t.terms}</Link><Link to="/contact" className="block text-gray-400 hover:text-white">{t.support}</Link></div><div className="mt-5 text-sm text-gray-400"><p><span className="text-gray-300">{t.email}:</span> support@swiftlink.com</p><p><span className="text-gray-300">{t.phone}:</span> +1 (555) 010-2457</p></div></div>
          </div>
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"><p className="text-gray-500 text-sm">2026 SwiftLink. {t.rights}</p><p className="text-gray-500 text-xs">Built for modern delivery operations</p></div>
        </div>
      </footer>
    </div>
  )
}

