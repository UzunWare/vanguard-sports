import React from 'react';
import { Mail, MapPin } from 'lucide-react';

/**
 * Footer Component
 * Main site footer with navigation links, legal links, and contact information
 *
 * @param {object} props
 * @param {object} props.refs - Refs object containing session and location refs for scrolling
 * @param {function} props.scrollToSection - Function to scroll to a specific section
 * @param {function} props.setView - Function to change the current view/page
 */
const Footer = ({ refs, scrollToSection, setView }) => (
  <footer className="bg-slate-900 text-slate-400 py-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-5 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Vanguard Logo" className="h-24 w-auto" onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }} />
            <div className="w-14 h-14 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-2xl" style={{display: 'none'}}>V</div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white leading-none">VANGUARD</span>
              <span className="text-sm font-bold text-orange-500 leading-none">SPORTS ACADEMY</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            San Antonio's premier youth sports academy. Building champions on and off the court.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => setView('about')} className="hover:text-orange-500 transition-colors">About Us</button></li>
            <li><button onClick={() => scrollToSection(refs.sessions)} className="hover:text-orange-500 transition-colors">Training Sessions</button></li>
            <li><button onClick={() => setView('staff')} className="hover:text-orange-500 transition-colors">Our Staff</button></li>
            <li><button onClick={() => setView('contact')} className="hover:text-orange-500 transition-colors">Contact</button></li>
            <li><button onClick={() => setView('login')} className="hover:text-orange-500 transition-colors">Email Us</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><button onClick={() => setView('refund-policy')} className="hover:text-orange-500 transition-colors">Refund & Cancellation Policy</button></li>
            <li><button onClick={() => setView('privacy-policy')} className="hover:text-orange-500 transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => setView('terms')} className="hover:text-orange-500 transition-colors">Terms & Conditions</button></li>
            <li><button onClick={() => setView('waiver')} className="hover:text-orange-500 transition-colors">Waiver</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Mail size={14} className="mt-0.5" />
              <span>vanguardsportsacademytx@gmail.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5" />
              <span>1450 NE Interstate 410 Loop<br/>San Antonio, TX 78209</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-6 text-center text-sm">
        <p>&copy; 2024 Vanguard Sports Academy. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
