import React from 'react';
import LegalPage from './LegalPage';

const RefundPolicyPage = ({ setView }) => (
  <LegalPage
    title="Refund & Cancellation Policy"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p>At Vanguard Sports Academy, we strive to provide the best training experience for all our athletes. Please review our refund and cancellation policy carefully before enrollment.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Cancellation Policy</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>30-Day Notice Required:</strong> To receive a full refund of your monthly subscription, you must provide written notice at least 30 days before your next billing date.</li>
          <li><strong>Registration Fees:</strong> The one-time registration fee ($30) is non-refundable once the athlete has participated in their first session.</li>
          <li><strong>Prorated Refunds:</strong> If you cancel mid-month with less than 30 days notice, no prorated refunds will be issued.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Refund Process</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Refunds will be processed within 7-10 business days after approval.</li>
          <li>Refunds will be issued to the original payment method.</li>
          <li>To request a cancellation, please email us at vanguardsportsacademytx@gmail.com with your account details.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Special Circumstances</h2>
        <p>We understand that unexpected situations arise. In cases of injury, relocation, or other extenuating circumstances, please contact us directly. We will review your situation on a case-by-case basis.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Session Cancellations by Academy</h2>
        <p>If Vanguard Sports Academy cancels a session due to weather, facility issues, or other unforeseen circumstances, we will provide make-up sessions or credit toward future sessions.</p>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

export default RefundPolicyPage;
