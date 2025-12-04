import React from 'react';
import LegalPage from './LegalPage';

const TermsPage = ({ setView }) => (
  <LegalPage
    title="Terms & Conditions"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p>By enrolling in Vanguard Sports Academy programs, you agree to the following terms and conditions:</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Enrollment & Payment</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>All enrollments require payment of a monthly subscription fee and a one-time registration fee.</li>
          <li>Monthly fees are billed automatically on the enrollment date each month.</li>
          <li>Failure to pay may result in suspension of training privileges.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Attendance & Participation</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Athletes are expected to attend all scheduled sessions.</li>
          <li>Missed sessions cannot be refunded or made up unless the academy cancels the session.</li>
          <li>Athletes must arrive 10 minutes before session start time.</li>
          <li>Appropriate athletic attire and footwear are required.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Code of Conduct</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Athletes must treat coaches, staff, and peers with respect.</li>
          <li>Bullying, foul language, or disruptive behavior will not be tolerated.</li>
          <li>Violation of conduct rules may result in removal from the program without refund.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Liability</h2>
        <p>Participation in athletic activities carries inherent risks. By enrolling, you acknowledge these risks and agree to the terms outlined in our liability waiver.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Media Release</h2>
        <p>We may photograph or video athletes during training for promotional purposes. If you do not consent, please notify us in writing.</p>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

export default TermsPage;
