import React from 'react';
import LegalPage from './LegalPage';

const WaiverPage = ({ setView }) => (
  <LegalPage
    title="Liability Waiver"
    setView={setView}
    content={
      <div className="space-y-4 text-slate-700">
        <p className="font-bold text-lg">PLEASE READ CAREFULLY BEFORE SIGNING</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Assumption of Risk</h2>
        <p>I acknowledge that participation in basketball and volleyball training involves physical activity and carries inherent risks, including but not limited to: sprains, fractures, concussions, and other injuries. I voluntarily assume all risks associated with my child's participation.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Release of Liability</h2>
        <p>I hereby release, waive, and discharge Vanguard Sports Academy, its owners, directors, coaches, employees, and volunteers from any and all liability, claims, demands, or causes of action arising from my child's participation in training programs, including those caused by negligence.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Medical Authorization</h2>
        <p>I authorize Vanguard Sports Academy staff to seek emergency medical treatment for my child if necessary. I understand that I will be responsible for all medical expenses incurred.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Medical Information</h2>
        <p>I certify that my child is in good physical condition and has no medical conditions that would prevent safe participation, except as disclosed in writing to the academy.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Photo/Video Release</h2>
        <p>I grant permission for Vanguard Sports Academy to use photographs or videos of my child for promotional purposes, including website, social media, and marketing materials.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-6">Agreement</h2>
        <p>I have read this waiver carefully and understand its contents. I sign this voluntarily and with full knowledge of its significance.</p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-6">
          <p className="text-sm font-bold text-orange-900">This waiver must be signed during the enrollment process. Contact us at vanguardsportsacademytx@gmail.com for enrollment information.</p>
        </div>

        <p className="mt-6 text-sm text-slate-600">Last updated: December 2024</p>
      </div>
    }
  />
);

export default WaiverPage;
