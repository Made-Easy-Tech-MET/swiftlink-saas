import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Truck, Store, TrendingUp, ArrowRight, Globe } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const translations = {
  en: {
    signIn: 'Sign In',
    getStarted: 'Get Started',
    heroTitle1: 'Streamline Your Delivery',
    heroTitle2: 'Operations Seamlessly',
    heroText: 'Connect restaurants with delivery drivers effortlessly. Manage orders, track deliveries, and grow your business with our all-in-one platform.',
    trial: 'No credit card required - Free 14-day trial',
    tryFree: 'Try for Free',
    featuresTitle: 'Everything You Need to Succeed',
    featuresText: 'Our platform provides all the tools you need to manage your delivery business efficiently.',
    f1Title: 'Real-Time Tracking',
    f1Text: 'Track deliveries in real-time with GPS. Keep your customers informed every step of the way.',
    f2Title: 'Restaurant Management',
    f2Text: 'Manage menus, orders, and inventory all in one place. Streamline your restaurant operations.',
    f3Title: 'Analytics & Insights',
    f3Text: 'Get detailed analytics and insights to make data-driven decisions and grow your business.',
    howTitle: 'How It Works',
    howText: 'Get started in three simple steps',
    s1Title: 'Create Account',
    s1Text: 'Sign up for free and choose your plan',
    s2Title: 'Set Up Profile',
    s2Text: 'Add your restaurant or driver details',
    s3Title: 'Start Delivering',
    s3Text: 'Begin managing your deliveries instantly',
    ctaTitle: 'Ready to Transform Your Delivery Business?',
    ctaText: 'Join thousands of restaurants and drivers who trust SwiftLink for their delivery operations.',
    ctaButton: 'Start Your Free Trial',
    footerTagline: 'Modern logistics operations for restaurants, drivers, and admins in one platform.',
    product: 'Product',
    company: 'Company',
    legal: 'Legal',
    contactTitle: 'Contact',
    pricing: 'Pricing',
    liveDemo: 'Live Demo',
    restaurantLogin: 'Restaurant Login',
    driverLogin: 'Driver Login',
    about: 'About Us',
    careers: 'Careers',
    docs: 'Documentation',
    status: 'System Status',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    support: 'Contact Support',
    email: 'Email',
    phone: 'Phone',
    rights: 'All rights reserved.'
  },
  fr: {
    signIn: 'Connexion',
    getStarted: 'Commencer',
    heroTitle1: 'Optimisez vos livraisons',
    heroTitle2: 'sans friction',
    heroText: 'Connectez restaurants et livreurs facilement. Gerees les commandes, suivez les livraisons et developpez votre activite.',
    trial: 'Pas de carte requise - Essai gratuit 14 jours',
    tryFree: 'Essayer gratuitement',
    featuresTitle: 'Tout ce qu il faut pour reussir',
    featuresText: 'La plateforme fournit les outils essentiels pour piloter votre activite de livraison.',
    f1Title: 'Suivi en temps reel',
    f1Text: 'Suivez les livraisons par GPS et gardez vos clients informes a chaque etape.',
    f2Title: 'Gestion restaurant',
    f2Text: 'Centralisez menus, commandes et operations dans un seul espace.',
    f3Title: 'Analyses avancees',
    f3Text: 'Exploitez des indicateurs clairs pour prendre de meilleures decisions.',
    howTitle: 'Comment ca marche',
    howText: 'Commencez en trois etapes',
    s1Title: 'Creer un compte',
    s1Text: 'Inscrivez-vous et choisissez un plan',
    s2Title: 'Configurer le profil',
    s2Text: 'Ajoutez les informations restaurant ou livreur',
    s3Title: 'Lancer l activite',
    s3Text: 'Commencez a gerer les livraisons immediatement',
    ctaTitle: 'Pret a transformer votre activite ?',
    ctaText: 'Rejoignez les restaurants et livreurs qui utilisent deja SwiftLink.',
    ctaButton: 'Demarrer l essai',
    footerTagline: 'Operations logistiques modernes pour restaurants, livreurs et admins dans une seule plateforme.',
    product: 'Produit',
    company: 'Entreprise',
    legal: 'Legal',
    contactTitle: 'Contact',
    pricing: 'Tarifs',
    liveDemo: 'Demo',
    restaurantLogin: 'Connexion restaurant',
    driverLogin: 'Connexion livreur',
    about: 'A propos',
    careers: 'Carrieres',
    docs: 'Documentation',
    status: 'Statut systeme',
    privacy: 'Confidentialite',
    terms: 'Conditions',
    support: 'Support',
    email: 'Email',
    phone: 'Telephone',
    rights: 'Tous droits reserves.'
  }
}

export default function Landing() {
  const { language, changeLanguage } = useTheme()
  const t = translations[language] || translations.en

  useEffect(() => {
    const hero = document.querySelector('[data-hero]')
    if (hero) {
      requestAnimationFrame(() => {
        hero.classList.add('is-visible')
      })
    }

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

    return () => {
      observer.disconnect()
      revealElements.forEach((element) => {
        element.style.transitionDelay = ''
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
              >
                <Globe size={16} />
                {language === 'en' ? 'FR' : 'EN'}
              </button>
              <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm sm:text-base font-medium">
                {t.signIn}
              </Link>
              <Link to="/register" className="bg-primary hover:bg-primary-dark text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors">
                {t.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-primary/10 reveal" data-hero>
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 reveal" data-reveal>
              {t.heroTitle1}
              <span className="text-primary block">{t.heroTitle2}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 reveal" data-reveal>
              {t.heroText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center reveal" data-reveal>
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
                {t.tryFree}
                <ArrowRight size={20} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white dark:bg-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-surface border border-light-border dark:border-dark-border px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
                {t.signIn}
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t.trial}</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.featuresTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t.featuresText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-dark-border hover:shadow-lg transition-shadow reveal" data-reveal>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Truck className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.f1Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.f1Text}</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-dark-border hover:shadow-lg transition-shadow reveal" data-reveal>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <Store className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.f2Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.f2Text}</p>
            </div>
            <div className="p-8 rounded-2xl bg-gray-50 dark:bg-dark-border hover:shadow-lg transition-shadow reveal" data-reveal>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{t.f3Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.f3Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 reveal" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.howTitle}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{t.howText}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center reveal" data-reveal>
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.s1Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.s1Text}</p>
            </div>
            <div className="text-center reveal" data-reveal>
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.s2Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.s2Text}</p>
            </div>
            <div className="text-center reveal" data-reveal>
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.s3Title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t.s3Text}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary reveal" data-reveal>
        <div className="max-w-4xl mx-auto text-center reveal" data-reveal>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{t.ctaTitle}</h2>
          <p className="text-xl text-white/80 mb-10">{t.ctaText}</p>
          <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
            {t.ctaButton}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <footer className="pt-16 pb-8 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/swiftlink_logos_png/logo-icon.png" alt="SwiftLink" className="w-10 h-10 rounded-lg" />
                <span className="text-2xl font-bold text-white">SwiftLink</span>
              </Link>
              <p className="mt-4 text-sm text-gray-400 max-w-md">{t.footerTagline}</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t.product}</h4>
              <div className="space-y-3 text-sm">
                <Link to="/pricing" className="block text-gray-400 hover:text-white">{t.pricing}</Link>
                <Link to="/docs" className="block text-gray-400 hover:text-white">{t.liveDemo}</Link>
                <Link to="/login" className="block text-gray-400 hover:text-white">{t.restaurantLogin}</Link>
                <Link to="/login" className="block text-gray-400 hover:text-white">{t.driverLogin}</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t.company}</h4>
              <div className="space-y-3 text-sm">
                <Link to="/about" className="block text-gray-400 hover:text-white">{t.about}</Link>
                <Link to="/careers" className="block text-gray-400 hover:text-white">{t.careers}</Link>
                <Link to="/docs" className="block text-gray-400 hover:text-white">{t.docs}</Link>
                <Link to="/status" className="block text-gray-400 hover:text-white">{t.status}</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t.legal}</h4>
              <div className="space-y-3 text-sm">
                <Link to="/privacy" className="block text-gray-400 hover:text-white">{t.privacy}</Link>
                <Link to="/terms" className="block text-gray-400 hover:text-white">{t.terms}</Link>
                <Link to="/contact" className="block text-gray-400 hover:text-white">{t.support}</Link>
              </div>
              <div className="mt-5 text-sm text-gray-400">
                <p><span className="text-gray-300">{t.email}:</span> support@swiftlink.com</p>
                <p><span className="text-gray-300">{t.phone}:</span> +1 (555) 010-2457</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <p className="text-gray-500 text-sm"> 2026 SwiftLink. {t.rights}</p>
            <p className="text-gray-500 text-xs">Built for modern delivery operations</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
