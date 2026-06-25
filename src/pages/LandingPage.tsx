import { Link } from 'react-router-dom';
import { Shield, Lock, Clock, FileCheck, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppLayout } from '../layouts/AppLayout';

export const LandingPage = () => {
  return (
    <AppLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-text-primary mb-6 leading-tight">
              Your Medical Records. <br />
              <span className="text-accent">Owned by You.</span>
            </h1>
            <p className="text-lg text-text-secondary mb-8">
              CareVault encrypts and stores your health data on a decentralized network — giving you full control over who sees what, for how long.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/connect"
                className="px-6 py-3 bg-accent text-white rounded-input font-medium hover:bg-accent/90 transition-colors"
              >
                Connect Wallet
              </Link>
              <a
                href="#how-it-works"
                className="px-6 py-3 border border-border text-text-primary rounded-input font-medium hover:bg-surface-hover transition-colors"
              >
                See How It Works
              </a>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-card rounded-card shadow-custom p-8 border border-border">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-surface-hover rounded-input">
                    <div className="w-12 h-12 bg-accent/10 rounded-input flex items-center justify-center">
                      <FileCheck className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-border rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-border rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="bg-card py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">How It Works</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Three simple steps to take control of your medical records
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Connect your Stellar wallet', desc: 'Use your existing wallet or create a new one in minutes' },
              { icon: Lock, title: 'Upload and encrypt your records', desc: 'Files are encrypted locally before leaving your device' },
              { icon: Clock, title: 'Grant time-bound access to doctors', desc: 'Set expiry dates and revoke access anytime' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                <p className="text-text-secondary">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text-primary mb-4">Enterprise-Grade Security</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Built on Stellar blockchain with military-grade encryption
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Self-Sovereign Records', desc: 'You hold the encryption keys' },
              { icon: Clock, title: 'Time-Bound Consent', desc: 'Set expiry on every access grant' },
              { icon: FileCheck, title: 'Immutable Audit Trail', desc: 'Every action recorded on-chain' },
              { icon: Lock, title: 'IPFS Storage', desc: 'Decentralized, tamper-proof' },
              { icon: Zap, title: 'Instant Revocation', desc: 'Withdraw access in one click' },
              { icon: Shield, title: 'Verification Status', desc: 'Records confirmed on-chain' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="p-6 bg-card rounded-card shadow-custom border border-border"
              >
                <feature.icon className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-accent/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12,400+', label: 'Records Secured' },
              { value: '3,200+', label: 'Patients' },
              { value: '180+', label: 'Healthcare Providers' },
              { value: '100%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-accent" />
              <span className="text-xl font-bold text-text-primary">CareVault</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-text-primary transition-colors">Docs</a>
              <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
            </div>
            <div className="text-sm text-muted mt-4 md:mt-0">
              Built on <span className="text-accent font-medium">Stellar</span>
            </div>
          </div>
        </div>
      </footer>
    </AppLayout>
  );
};
