import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Briefcase, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign,
  Shield,
  Cloud,
  Smartphone,
  Check,
  Star
} from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  const features = [
    {
      icon: Briefcase,
      title: 'Case Management',
      description: 'Comprehensive case tracking with history, documents, and team collaboration.',
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Manage client information, documents, and communication all in one place.',
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Secure document storage with versioning and sharing capabilities.',
    },
    {
      icon: Calendar,
      title: 'Calendar & Reminders',
      description: 'Never miss important deadlines with integrated calendar and notifications.',
    },
    {
      icon: DollarSign,
      title: 'Financial Management',
      description: 'Track invoices, payments, and generate financial reports.',
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'Enterprise-grade security with role-based access control.',
    },
  ];

  const benefits = [
    {
      icon: Cloud,
      title: 'Cloud-Based',
      description: 'Access your data from anywhere, anytime with secure cloud storage.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Full mobile app support for on-the-go access to your cases.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for solo advocates getting started',
      features: [
        'Up to 10 cases',
        'Basic document storage',
        'Email support',
        'Mobile access',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: '/month',
      description: 'Ideal for growing law firms',
      features: [
        'Unlimited cases',
        'Advanced document management',
        'Team collaboration',
        'Priority support',
        'Financial reporting',
        'Google Drive integration',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      description: 'For large law firms and organizations',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'White-label options',
        'API access',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Senior Advocate',
      company: 'Johnson & Associates',
      content: 'Advocate App has transformed how we manage our cases. The document management and team collaboration features are game-changers.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Managing Partner',
      company: 'Chen Law Group',
      content: 'The financial management tools have saved us hours every month. Highly recommended for any law firm.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Legal Consultant',
      company: 'Rodriguez Legal Services',
      content: 'Easy to use, secure, and reliable. The mobile app keeps me connected to my cases wherever I am.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Advocate App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Legal Case Management
              <span className="block text-blue-600">Made Simple</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive legal practice management software designed specifically for advocates and law firms. 
              Manage cases, clients, documents, and finances all in one secure platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need to Manage Your Practice
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed specifically for legal professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Choose the plan that fits your practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
          </li>
                    ))}
                  </ul>
                  <Link href={plan.name === 'Enterprise' ? '/contact' : '/auth/signup'}>
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Trusted by Legal Professionals
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              See what our users have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Why Choose Advocate App?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <benefit.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Transform Your Practice?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of legal professionals who trust Advocate App
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                  Contact Sales
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-blue-200">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-4">Advocate App</h3>
              <p className="text-gray-400 mb-4">
                Comprehensive legal practice management software designed specifically for advocates and law firms.
              </p>
              <div className="flex space-x-4">
                <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
                  Sign Up
                </Link>
                <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
                  Sign In
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-white">Integrations</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Advocate App. All rights reserved.</span>
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white">Terms of Service</Link>
              <Link href="/support" className="hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
