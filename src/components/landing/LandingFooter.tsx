import { Link } from 'react-router-dom';
import { Workflow, Github, Twitter, Linkedin } from 'lucide-react';

export const LandingFooter = () => {
  const footerLinks = {
    product: [
      { label: 'Özellikler', href: '#features' },
      { label: 'Entegrasyonlar', href: '#integrations' },
      { label: 'Fiyatlandırma', href: '#pricing' },
      { label: 'Changelog', href: '#changelog' },
    ],
    company: [
      { label: 'Hakkımızda', href: '#about' },
      { label: 'Blog', href: '#blog' },
      { label: 'Kariyer', href: '#careers' },
      { label: 'İletişim', href: '#contact' },
    ],
    resources: [
      { label: 'Dokümantasyon', href: '#docs' },
      { label: 'API Referansı', href: '#api' },
      { label: 'Topluluk', href: '#community' },
      { label: 'Destek', href: '#support' },
    ],
    legal: [
      { label: 'Gizlilik', href: '#privacy' },
      { label: 'Kullanım Koşulları', href: '#terms' },
      { label: 'Güvenlik', href: '#security' },
      { label: 'KVKK', href: '#kvkk' },
    ],
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-2 rounded-xl">
                <Workflow className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">FlowMaster</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              İş süreçlerinizi otomatikleştirmek için modern, güçlü ve kullanımı kolay workflow platformu.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Ürün</h4>
            <ul className="space-y-2">
              {footerLinks.product.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Şirket</h4>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Kaynaklar</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Yasal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map(link => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FlowMaster. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Tüm sistemler çalışıyor
          </div>
        </div>
      </div>
    </footer>
  );
};
