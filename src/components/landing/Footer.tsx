import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Twitter, Linkedin, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="icon-container">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">Visitify</span>
            </div>
            <p className="text-muted-foreground">
              Smarter visitor management for modern offices. Streamline your front desk operations.
            </p>
            <div className="flex space-x-4">
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
              <li><Link to="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
              <li><Link to="/signup" className="text-muted-foreground hover:text-foreground">Free Trial</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">API Documentation</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">About</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground">GDPR</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2024 Visitify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};