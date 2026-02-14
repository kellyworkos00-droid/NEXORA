import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const footerLinks = {
  Product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Marketplace', href: '#marketplace' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Changelog', href: '#changelog' },
  ],
  Company: [
    { name: 'About', href: '#about' },
    { name: 'Blog', href: '#blog' },
    { name: 'Careers', href: '#careers' },
    { name: 'Contact', href: '#contact' },
  ],
  Resources: [
    { name: 'Documentation', href: '#docs' },
    { name: 'API Reference', href: '#api' },
    { name: 'Community', href: '#community' },
    { name: 'Support', href: '#support' },
    { name: 'Status', href: '#status' },
  ],
  Legal: [
    { name: 'Privacy', href: '#privacy' },
    { name: 'Terms', href: '#terms' },
    { name: 'Security', href: '#security' },
    { name: 'Compliance', href: '#compliance' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-white">
                NEXORA
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              The AI Business Operating System. Built for the future of work.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-primary-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <p>© 2026 NEXORA. All rights reserved.</p>
            <p>Built with ❤️ for businesses worldwide</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
