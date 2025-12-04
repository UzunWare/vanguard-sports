import React from 'react';
import LegalPage from './LegalPage';

const PrivacyPolicyPage = ({ setView }) => (
  <LegalPage
    title="Privacy Policy"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p>Vanguard Sports Academy ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Information:</strong> Name, email address, phone number, billing address, and emergency contact information.</li>
          <li><strong>Athlete Information:</strong> Date of birth, gender, medical information (allergies, conditions), and athletic performance data.</li>
          <li><strong>Payment Information:</strong> Credit card details (processed securely through our payment processor).</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide and manage training services</li>
          <li>To process payments and send billing statements</li>
          <li>To communicate important updates about sessions, schedules, and events</li>
          <li>To ensure athlete safety and provide appropriate coaching</li>
          <li>To improve our services and training programs</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share information with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Coaches and staff for training purposes</li>
          <li>Payment processors for billing</li>
          <li>Emergency services if required for athlete safety</li>
          <li>Legal authorities if required by law</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Data Security</h2>
        <p>We implement industry-standard security measures to protect your information. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Your Rights</h2>
        <p>You have the right to access, update, or delete your personal information. Contact us at vanguardsportsacademytx@gmail.com to exercise these rights.</p>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

export default PrivacyPolicyPage;
