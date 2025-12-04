import React, { useState } from 'react';
import {
  MapPin, Calendar, CreditCard, User, Check, X, ChevronRight,
  Menu, Mail, Clock, Users, Info, ArrowRight, LogOut,
  Loader, Star, ChevronDown, ChevronUp, Lock, CheckCircle, Award,
  AlertTriangle, Zap, FileText, HeartPulse, Trophy, RefreshCw, Settings
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import contactService from '../services/contactService';
import { COACHES } from '../constants/coachesData';

/**
 * HomeView Component
 * Main landing page with hero, programs, coaches, location, gallery, rules/FAQs, and contact form
 *
 * @param {object} props
 * @param {function} props.setView - Function to change the current view
 * @param {function} props.scrollToSection - Function to scroll to a specific section
 * @param {object} props.refs - References to sections (sessions, location)
 * @param {array} props.sessions - Array of available training sessions
 * @param {function} props.setSelectedProgram - Function to set selected program
 * @param {array} props.heroImages - Array of hero background images
 * @param {number} props.currentSlide - Current hero slide index
 * @param {function} props.showNotification - Function to display notifications
 */
const HomeView = ({ setView, scrollToSection, refs, sessions, setSelectedProgram, heroImages, currentSlide, showNotification }) => {
  const [activeTab, setActiveTab] = useState('All');

  // Contact form state
  const [contactForm, setContactForm] = useState({
    firstName: '', lastName: '', email: '', message: ''
  });
  const [contactErrors, setContactErrors] = useState({
    firstName: '', lastName: '', email: '', message: ''
  });
  const [contactTouched, setContactTouched] = useState({
    firstName: false, lastName: false, email: false, message: false
  });

  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterTouched, setNewsletterTouched] = useState(false);

  // Form submission loading states
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);

  const filteredSessions = activeTab === 'All' ? sessions : sessions.filter(s => s.sport === activeTab);

  // Contact form validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'This field is required';
    if (name.trim().length < 2) return 'Must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) return 'Message is required';
    if (message.trim().length < 10) return 'Message must be at least 10 characters';
    return '';
  };

  // Contact form handlers
  const handleContactChange = (field, value) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
    if (contactTouched[field]) {
      let error = '';
      if (field === 'firstName' || field === 'lastName') {
        error = validateName(value);
      } else if (field === 'email') {
        error = validateEmail(value);
      } else if (field === 'message') {
        error = validateMessage(value);
      }
      setContactErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleContactBlur = (field) => {
    setContactTouched(prev => ({ ...prev, [field]: true }));
    let error = '';
    if (field === 'firstName' || field === 'lastName') {
      error = validateName(contactForm[field]);
    } else if (field === 'email') {
      error = validateEmail(contactForm[field]);
    } else if (field === 'message') {
      error = validateMessage(contactForm[field]);
    }
    setContactErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    // PREVENT DUPLICATE SUBMISSIONS
    if (isSubmittingContact) {
      return;
    }

    // Mark all as touched
    setContactTouched({ firstName: true, lastName: true, email: true, message: true });

    // Validate all fields
    const errors = {
      firstName: validateName(contactForm.firstName),
      lastName: validateName(contactForm.lastName),
      email: validateEmail(contactForm.email),
      message: validateMessage(contactForm.message)
    };

    setContactErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(err => err !== '')) {
      return;
    }

    // Form is valid, proceed with submission
    setIsSubmittingContact(true);
    try {
      await contactService.submitContactForm(contactForm);
      // Mark form as submitted and collapse the section
      setContactFormSubmitted(true);
      showNotification('Your message has been sent successfully! We will get back to you soon.');
      // Reset form
      setContactForm({ firstName: '', lastName: '', email: '', message: '' });
      setContactTouched({ firstName: false, lastName: false, email: false, message: false });
    } catch (error) {
      showNotification('Failed to send message. Please try again or contact us directly at vanguardsportsacademytx@gmail.com', 'error');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Newsletter handlers
  const handleNewsletterChange = (value) => {
    setNewsletterEmail(value);
    if (newsletterTouched) {
      setNewsletterError(validateEmail(value));
    }
  };

  const handleNewsletterBlur = () => {
    setNewsletterTouched(true);
    setNewsletterError(validateEmail(newsletterEmail));
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    // PREVENT DUPLICATE SUBMISSIONS
    if (isSubmittingNewsletter) {
      return;
    }

    setNewsletterTouched(true);
    const error = validateEmail(newsletterEmail);
    setNewsletterError(error);

    if (!error) {
      setIsSubmittingNewsletter(true);
      try {
        await contactService.subscribeNewsletter(newsletterEmail);
        showNotification('Successfully subscribed to newsletter! Check your email for confirmation.');
        setNewsletterEmail('');
        setNewsletterTouched(false);
      } catch (error) {
        showNotification('Failed to subscribe. Please try again later.');
      } finally {
        setIsSubmittingNewsletter(false);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative bg-slate-900 text-white min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Hero ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-30' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-orange-600/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
              <Trophy size={16} className="text-orange-500" />
              <span className="text-orange-100 font-semibold text-sm tracking-wide">San Antonio's Premier Academy</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8">
              Forge Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Greatness</span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
              Professional-grade Basketball and Volleyball training for youth athletes.
              Develop elite skills, game IQ, and character in a world-class facility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => scrollToSection(refs.sessions)} className="text-lg px-8 py-4">
                Start Training <ArrowRight size={20} />
              </Button>
              <Button variant="outline" onClick={() => scrollToSection(refs.location)} className="text-lg px-8 py-4 !bg-transparent border-slate-700 !text-white hover:!bg-white/10 hover:!border-white">
                Visit Facility
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-8 text-slate-400 text-sm font-medium">
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-orange-500" /> Certified Coaches</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-orange-500" /> Regulation Courts</div>
              <div className="flex items-center gap-2"><CheckCircle size={18} className="text-orange-500" /> Ages 4-18</div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs */}
      <div ref={refs.sessions} className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Training Programs</h2>
            <div className="flex justify-center gap-2">
              {['All', 'Basketball', 'Volleyball'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeTab === tab ? 'bg-orange-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="group hover:shadow-xl transition-all duration-300 flex flex-col h-full border-t-4 border-t-orange-500">
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge color={session.sport === 'Basketball' ? 'orange' : 'blue'} className="mb-2">{session.sport}</Badge>
                      <h3 className="text-2xl font-bold text-slate-900">{session.level}</h3>
                      <p className="text-slate-500 font-medium">{session.grades} • {session.gender}</p>
                    </div>
                    {session.status !== 'Open' ? <Badge color="yellow">{session.status}</Badge> : <Badge color="green">Open</Badge>}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2"><Calendar size={16} className="text-orange-600"/> {session.date}</div>
                    <div className="flex items-center gap-2"><Clock size={16} className="text-orange-600"/> {session.time}</div>
                    <div className="flex items-center gap-2"><MapPin size={16} className="text-orange-600"/> {session.location}</div>
                  </div>

                  <p className="text-slate-600 mb-6 leading-relaxed">{session.description}</p>

                  {/* Coach Info Section */}
                  <div className="mb-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                       <span className="font-bold text-blue-800">Head Coach:</span> {session.headCoach}
                    </div>
                    {session.assistantCoach && (
                       <div className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="font-bold text-blue-600">Assistant:</span> {session.assistantCoach}
                       </div>
                    )}
                  </div>

                  <div className="mb-8">
                    <h4 className="font-bold text-slate-900 text-sm mb-3">Key Focus Areas:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {session.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <Check size={14} className="text-green-500 mt-1 shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-slate-900">${session.price}</span>
                        <span className="text-sm text-slate-500 font-medium">/mo</span>
                      </div>
                      <span className="text-xs text-slate-400">+$30 Reg Fee (One-time)</span>
                    </div>
                    <Button onClick={() => { setSelectedProgram(session.sport); setView('register'); }}>
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* What's Included Section */}
      <div className="py-16 bg-white px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-12 text-center">What's Included</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-green-50 border border-green-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">~4 Sessions/Month</h3>
              <p className="text-slate-600 text-sm">Every Saturday (may vary with holidays)</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-blue-50 border border-blue-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Professional Jersey</h3>
              <p className="text-slate-600 text-sm">Included with registration fee</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Small Group Training</h3>
              <p className="text-slate-600 text-sm">Max 20 students per session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coaches Section */}
      <div className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Meet Our Directors</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our academy is led by champions. Decades of professional experience, dedicated to your child's growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {COACHES.map((coach, idx) => (
              <div key={idx} className="flex flex-col h-full p-6 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl border border-slate-100 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <img src={coach.img} alt={coach.name} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{coach.name}</h3>
                    <p className="text-orange-600 text-sm font-semibold">{coach.role}</p>
                  </div>
                </div>

                <div className="mb-4">
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                     <Award size={14} className="text-orange-500"/> Highlights
                   </div>
                   <ul className="space-y-2">
                     {coach.highlights.map((highlight, i) => (
                       <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                         <div className="min-w-[4px] h-[4px] rounded-full bg-slate-300 mt-2"></div>
                         {highlight}
                       </li>
                     ))}
                   </ul>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                   <span>{coach.exp}</span>
                   <div className="flex gap-1">
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                      <Star size={12} className="text-yellow-400 fill-current"/>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location */}
      <div ref={refs.location} className="py-24 bg-slate-900 text-white px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600 rounded-full blur-[128px] opacity-20"></div>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-block p-3 bg-orange-600/20 rounded-xl mb-6">
              <MapPin size={32} className="text-orange-500" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Home Court Advantage</h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              Located centrally in San Antonio, our facility features 4 regulation basketball courts,
              6 volleyball courts, and a dedicated strength & conditioning area.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-1 bg-orange-500 h-full min-h-[40px] rounded-full"></div>
                <div>
                  <h4 className="font-bold text-white">Vanguard Sports Academy</h4>
                  <p className="text-slate-400">1450 NE Interstate 410 Loop<br/>San Antonio, TX 78209</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-80 bg-slate-800 rounded-2xl overflow-hidden relative shadow-2xl border border-slate-700 group">
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800/50 group-hover:bg-slate-800/30 transition-colors">
                <MapPin size={48} className="text-orange-500 mb-4 animate-bounce" />
                {/* Fix: Added !bg-white/10 !text-white to ensure transparency and white text */}
                <Button variant="outline" className="!bg-white/10 border-white/20 !text-white hover:bg-white hover:!text-slate-900 backdrop-blur-md">
                  Get Directions
                </Button>
             </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Training Gallery</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Get a glimpse of our training sessions, facility, and the incredible energy our athletes bring every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80"
                alt="Basketball Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Basketball Drills</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80"
                alt="Volleyball Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Volleyball Practice</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80"
                alt="Team Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Team Drills</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?auto=format&fit=crop&q=80"
                alt="Skills Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Skills Development</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80"
                alt="Court Facility"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Our Facility</span>
              </div>
            </div>
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1552084162-ec07b3f162dc?auto=format&fit=crop&q=80"
                alt="Group Training"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <span className="text-white font-bold text-lg">Group Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academy Rules & FAQs Section */}
      <div className="py-24 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Academy Rules */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-orange-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Academy Rules</h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">1</div>
                <p className="text-slate-700 pt-1">Punctuality is key. Arrive 10 minutes before sessions start.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">2</div>
                <p className="text-slate-700 pt-1">Appropriate athletic shoes and sportswear are required.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">3</div>
                <p className="text-slate-700 pt-1">Respect towards coaches, staff, and peers is non-negotiable.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">4</div>
                <p className="text-slate-700 pt-1">No foul language or bullying will be tolerated.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">5</div>
                <p className="text-slate-700 pt-1">Listen to safety instructions at all times.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">6</div>
                <p className="text-slate-700 pt-1">Parents should trust coaches to coach and refrain from sideline instruction.</p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  What is the age range for your training sessions?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  We offer programs for athletes aged 4-18, divided into age-appropriate groups to ensure optimal skill development and safety.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  What should my child bring to training sessions?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  Athletes should bring appropriate athletic shoes, comfortable sportswear, a water bottle, and their provided academy jersey. We recommend bringing a towel as well.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  How do I communicate with coaches?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  Parents can reach coaches via email or through the parent portal. We also hold periodic parent meetings to discuss athlete progress and answer questions.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  What is your cancellation policy?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  We require 30 days notice for cancellations to receive a full refund. Please review our complete cancellation policy in the enrollment agreement.
                </p>
              </details>

              <details className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 group">
                <summary className="font-bold text-slate-900 cursor-pointer flex items-center justify-between">
                  Is the environment safe?
                  <ChevronDown size={20} className="text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                  Absolutely. All our coaches are certified and background-checked. We maintain strict safety protocols, and our facility is equipped with first aid supplies and AEDs.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Get In Touch Section */}
      <div className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          {contactFormSubmitted ? (
            /* Collapsed Success Message */
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Message Sent Successfully!</h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-2">
                Thank you for reaching out to Vanguard Sports Academy.
              </p>
              <p className="text-slate-600 max-w-2xl mx-auto">
                We have received your message and will get back to you shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Get In Touch</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Have questions about registration or our programs? Send us a message.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Info */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                  <a href="mailto:vanguardsportsacademytx@gmail.com" className="text-blue-600 hover:underline">
                    vanguardsportsacademytx@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Location</h3>
                  <p className="text-slate-600">
                    1450 NE Interstate 410 Loop<br />
                    San Antonio, TX 78209
                  </p>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
                <p className="text-blue-100 mb-6 text-sm">Get the latest news on classes and events.</p>
                <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                  <div>
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => handleNewsletterChange(e.target.value)}
                      onBlur={handleNewsletterBlur}
                      placeholder="Your email address"
                      disabled={isSubmittingNewsletter}
                      className={`w-full px-4 py-3 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        newsletterTouched && newsletterError
                          ? 'ring-2 ring-red-300 border-red-400'
                          : 'focus:ring-white'
                      } ${isSubmittingNewsletter ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {newsletterTouched && newsletterError && (
                      <p className="text-xs font-bold text-red-200 mt-2 flex items-center gap-1">
                        <Info size={10} /> {newsletterError}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-blue-100">
                    <input type="checkbox" className="rounded" disabled={isSubmittingNewsletter} />
                    Subscribe to newsletter
                  </label>
                  <Button type="submit" disabled={isSubmittingNewsletter} className="w-full !bg-white !text-blue-600 hover:!bg-blue-50">
                    {isSubmittingNewsletter ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        <span className="ml-2">Subscribing...</span>
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Form */}
            <form className="bg-slate-50 rounded-2xl p-8 border border-slate-200 space-y-6" onSubmit={handleContactSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  value={contactForm.firstName}
                  onChange={(e) => handleContactChange('firstName', e.target.value)}
                  onBlur={() => handleContactBlur('firstName')}
                  placeholder="John"
                  error={contactTouched.firstName ? contactErrors.firstName : ''}
                  disabled={isSubmittingContact}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={contactForm.lastName}
                  onChange={(e) => handleContactChange('lastName', e.target.value)}
                  onBlur={() => handleContactBlur('lastName')}
                  placeholder="Smith"
                  error={contactTouched.lastName ? contactErrors.lastName : ''}
                  disabled={isSubmittingContact}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={contactForm.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                onBlur={() => handleContactBlur('email')}
                placeholder="john@example.com"
                error={contactTouched.email ? contactErrors.email : ''}
                disabled={isSubmittingContact}
                required
              />

              <div className="mb-4">
                <div className="flex justify-between items-baseline">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                    Message <span className="text-orange-600">*</span>
                  </label>
                  {contactTouched.message && contactErrors.message && (
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1 animate-pulse">
                      <Info size={10} /> {contactErrors.message}
                    </span>
                  )}
                </div>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => handleContactChange('message', e.target.value)}
                  onBlur={() => handleContactBlur('message')}
                  rows="5"
                  placeholder="Your message here..."
                  disabled={isSubmittingContact}
                  className={`w-full bg-slate-50 border rounded-lg p-2.5 outline-none transition-all placeholder:text-slate-400 focus:placeholder:text-transparent resize-none ${
                    contactTouched.message && contactErrors.message
                      ? 'border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 bg-red-50'
                      : 'border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white'
                  } ${isSubmittingContact ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>

              <Button type="submit" disabled={isSubmittingContact} className="w-full text-lg py-4">
                {isSubmittingContact ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
