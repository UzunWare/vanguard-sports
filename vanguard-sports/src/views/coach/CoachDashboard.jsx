import React, { useState, useEffect, Suspense } from 'react';
import { Calendar, Users, Info, Clock, Zap, Star, Mail, HeartPulse, FileText, Menu, LogOut, Settings } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import AssessmentModal from '../../components/modals/AssessmentModal';
import LoadingFallback from '../../components/LoadingFallback';
import AccountSettings from '../parent/AccountSettings';
import { PRACTICE_PLANS } from '../../constants/practiceData';
import { AthletesTab, EvaluationsTab } from './tabs';
import enrollmentService from '../../services/enrollmentService';

/**
 * CoachDashboard Component
 * Main dashboard for coaches to manage sessions, rosters, and athlete evaluations
 *
 * @param {object} props
 * @param {object} props.user - Current coach user
 * @param {function} props.logoutUser - Function to log out
 * @param {array} props.sessions - Available sessions
 * @param {object} props.rosters - Roster data by session ID
 * @param {function} props.setRosters - Function to update rosters
 */
const CoachDashboard = ({ user, logoutUser, sessions, rosters, setRosters, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, schedule, athletes
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showAssessment, setShowAssessment] = useState(null); // student ID or null
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);

  // Load enrollment data for all sessions
  useEffect(() => {
    const loadRosterData = async () => {
      try {
        setLoading(true);
        const mySessions = sessions.filter(s => s.sport === user.sport);
        const rosterData = {};

        for (const session of mySessions) {
          try {
            const response = await enrollmentService.getSessionEnrollments(session.id);
            if (response.enrollments) {
              // Transform backend data to match expected format
              rosterData[session.id] = response.enrollments.map(enrollment => ({
                id: enrollment.athlete_id,
                enrollmentId: enrollment.id,
                name: `${enrollment.athlete_first_name} ${enrollment.athlete_last_name}`,
                age: enrollment.athlete_dob ? new Date().getFullYear() - new Date(enrollment.athlete_dob).getFullYear() : 0,
                jersey: enrollment.jersey_size || 'N/A',
                parent: enrollment.parent_name,
                phone: enrollment.parent_phone,
                email: enrollment.parent_email,
                medical: [enrollment.allergies, enrollment.conditions, enrollment.medications]
                  .filter(Boolean)
                  .join(', ') || 'None',
                attendance: 'present', // Default for UI
                attendanceRate: parseInt(enrollment.attendance_rate) || 0,
                ratings: {}
              }));
            }
          } catch (error) {
            console.error(`Failed to load roster for session ${session.id}:`, error);
            rosterData[session.id] = [];
          }
        }

        setRosters(rosterData);
      } catch (error) {
        console.error('Failed to load roster data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessions.length > 0 && user.sport) {
      loadRosterData();
    }
  }, [sessions, user.sport, setRosters]);

  useEffect(() => {
     if (!selectedSessionId) {
        const first = sessions.find(s => s.sport === user.sport);
        if (first) setSelectedSessionId(first.id);
     }
  }, [sessions, user.sport, selectedSessionId]);

  const activeSession = sessions.find(s => s.id === selectedSessionId);
  const mySessions = sessions.filter(s => s.sport === user.sport);
  const totalStudents = mySessions.reduce((acc, s) => acc + (rosters[s.id]?.length || 0), 0);

  const handleSaveAssessment = (sid, newRatings) => {
     setRosters(prev => ({
        ...prev,
        [selectedSessionId]: prev[selectedSessionId].map(s =>
           s.id === sid ? {...s, ratings: newRatings} : s
        )
     }));
     setShowAssessment(null);
  };

  const toggleAtt = (sid) => {
    setRosters(prev => ({
       ...prev,
       [selectedSessionId]: prev[selectedSessionId].map(s => s.id === sid ? {...s, attendance: s.attendance === 'present' ? 'absent' : 'present'} : s)
    }));
  };

  // --- Sub-Views ---

  const OverviewTab = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-none">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-white/20 rounded-lg"><Users size={24}/></div>
                 <span className="text-orange-100 text-xs font-bold uppercase tracking-wider">Total Athletes</span>
              </div>
              <div className="text-4xl font-bold mb-1">{totalStudents}</div>
              <div className="text-orange-100 text-sm">Across {mySessions.length} active sessions</div>
           </Card>
           <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Calendar size={24}/></div>
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Next Session</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mb-1">{activeSession?.level || 'No Session'}</div>
              <div className="text-slate-500 text-sm">{activeSession?.time} • {activeSession?.location}</div>
           </Card>
           <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-green-50 rounded-lg text-green-600"><Zap size={24}/></div>
                 <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg Attendance</span>
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">94%</div>
              <div className="text-green-600 text-sm font-medium">↑ 2% from last month</div>
           </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
           {totalStudents > 0 && (
             <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                   <Info size={18} className="text-orange-500"/> Action Required
                </h3>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100 text-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="font-medium text-red-900">3 Evaluations Pending</span>
                      <button onClick={() => setActiveTab('schedule')} className="ml-auto text-xs font-bold text-red-600 hover:underline">View</button>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 text-sm">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="font-medium text-orange-900">Confirm Saturday's Roster</span>
                      <button onClick={() => setActiveTab('schedule')} className="ml-auto text-xs font-bold text-orange-600 hover:underline">Check</button>
                   </div>
                </div>
             </Card>
           )}
           <Card className="p-6 bg-slate-900 text-white border-none relative overflow-hidden">
              <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-2">Coach's Tip</h3>
                 <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    "Focus on defensive footwork this week. The U14 group needs work on transition defense."
                 </p>
                 <div className="flex gap-2">
                    <Badge color="gray" className="bg-white/10 text-white border-white/20">Defense</Badge>
                    <Badge color="gray" className="bg-white/10 text-white border-white/20">U14</Badge>
                 </div>
              </div>
              <Zap className="absolute -bottom-4 -right-4 text-white/5" size={120} />
           </Card>
        </div>
     </div>
  );

  const ScheduleTab = () => (
     <div className="grid lg:grid-cols-12 gap-6 animate-fade-in">
        {/* Session Selector */}
        <div className="lg:col-span-4 space-y-4">
           {mySessions.map(session => (
              <div
                 key={session.id}
                 onClick={() => setSelectedSessionId(session.id)}
                 className={`p-4 rounded-xl cursor-pointer transition-all border group relative overflow-hidden ${selectedSessionId === session.id ? 'bg-slate-900 border-slate-900 shadow-lg' : 'bg-white border-slate-200 hover:border-orange-300'}`}
              >
                 <div className="flex justify-between mb-2 relative z-10">
                    <span className={`font-bold ${selectedSessionId === session.id ? 'text-white' : 'text-slate-900'}`}>{session.level}</span>
                    <Badge color={session.status === 'Open' ? 'green' : 'yellow'} className={selectedSessionId === session.id ? 'bg-white/20 text-white border-transparent' : ''}>{session.status}</Badge>
                 </div>
                 <div className={`text-xs flex items-center gap-2 mb-3 relative z-10 ${selectedSessionId === session.id ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Clock size={14}/> {session.time}
                 </div>
                 {/* Progress Bar */}
                 <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden relative z-10">
                    <div className={`h-full ${selectedSessionId === session.id ? 'bg-orange-500' : 'bg-slate-300'}`} style={{ width: `${(session.registeredCount/session.capacity)*100}%`}}></div>
                 </div>
              </div>
           ))}
        </div>

        {/* Active Session View */}
        <div className="lg:col-span-8 space-y-6">
           {/* Practice Plan Card */}
           <Card className="p-0 overflow-hidden">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                 <h3 className="font-bold text-orange-900 flex items-center gap-2"><Menu size={18}/> Digital Clipboard</h3>
                 <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Today's Plan</span>
              </div>
              <div className="divide-y divide-orange-100 bg-orange-50/30">
                 {activeSession && PRACTICE_PLANS[activeSession.sport]?.map((item, idx) => (
                    <div key={idx} className="flex items-center p-3 hover:bg-orange-100/50 transition-colors">
                       <span className="w-16 font-mono text-xs font-bold text-slate-500">{item.time}</span>
                       <div className="flex-1">
                          <div className="font-bold text-slate-800 text-sm">{item.activity}</div>
                          <div className="text-xs text-slate-500">{item.notes}</div>
                       </div>
                       <input type="checkbox" className="w-5 h-5 accent-orange-600 rounded cursor-pointer" />
                    </div>
                 ))}
                 {!activeSession && <div className="p-6 text-center text-slate-500">Select a session to view the plan.</div>}
              </div>
           </Card>

           {/* Roster & Attendance */}
           {activeSession ? (
             <div className="space-y-6">
               <Card className="flex flex-col">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                     <div>
                        <h2 className="text-lg font-bold text-slate-900">Athlete Roster</h2>
                        <p className="text-xs text-slate-500">{rosters[selectedSessionId]?.length || 0} Registered</p>
                     </div>
                     <Button className="text-xs h-8 px-3">Email All Parents</Button>
                  </div>

                  <div className="overflow-auto p-0">
                     <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                           <tr>
                              <th className="p-4 pl-6">Athlete</th>
                              <th className="p-4">Status</th>
                              <th className="p-4">Health</th>
                              <th className="p-4 text-center">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {rosters[selectedSessionId]?.map(student => (
                              <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                                 <td className="p-4 pl-6">
                                    <div className="font-bold text-slate-900">{student.name}</div>
                                    <div className="text-xs text-slate-500">Jersey: {student.jersey}</div>
                                 </td>
                                 <td className="p-4">
                                    <button onClick={() => toggleAtt(student.id)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${student.attendance === 'present' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                       {student.attendance === 'present' ? 'Present' : 'Absent'}
                                    </button>
                                 </td>
                                 <td className="p-4">
                                    {student.medical !== 'None' ? (
                                       <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold border border-red-100 w-fit">
                                          <HeartPulse size={12}/> {student.medical}
                                       </div>
                                    ) : <span className="text-slate-400">-</span>}
                                 </td>
                                 <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => setShowAssessment(student)} className="p-2 rounded-full hover:bg-orange-100 text-slate-400 hover:text-orange-600 transition-colors" title="Evaluate Skills">
                                       <Star size={18}/>
                                    </button>
                                    <button className="p-2 rounded-full hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition-colors" title="Contact Parent">
                                       <Mail size={18}/>
                                    </button>
                                 </td>
                              </tr>
                           ))}
                           {(!rosters[selectedSessionId] || rosters[selectedSessionId].length === 0) && (
                              <tr><td colSpan={4} className="p-8 text-center text-slate-400">No students enrolled yet.</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </Card>

               <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <FileText size={18} className="text-orange-600"/> Session Notes
                  </h3>
                  <textarea
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                     rows={4}
                     placeholder="Log drills, injuries, or improvements..."
                     value={notes[selectedSessionId] || ''}
                     onChange={(e) => setNotes({...notes, [selectedSessionId]: e.target.value})}
                  />
                  <div className="mt-2 text-right">
                     <Button className="text-xs h-8 px-3">Save Note</Button>
                  </div>
               </Card>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-12">
                <Menu size={48} className="mb-4 opacity-50"/>
                <p>Select a session to manage roster</p>
             </div>
           )}
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex animate-fade-in">
      {/* Assessment Modal Triggered from Roster */}
      {showAssessment && (
         <AssessmentModal
            student={showAssessment}
            sport={user.sport}
            onClose={() => setShowAssessment(null)}
            onSave={handleSaveAssessment}
         />
      )}

      {/* Sidebar Navigation */}
      <div className="w-20 lg:w-64 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 transition-all duration-300">
         <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
            <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold flex-shrink-0">V</div>
            <span className="ml-3 font-bold text-white hidden lg:block">COACH PORTAL</span>
         </div>

         <nav className="flex-1 py-6 space-y-2 px-3">
            {[
               { id: 'overview', icon: Zap, label: 'Overview' },
               { id: 'schedule', icon: Calendar, label: 'Schedule & Roster' },
               { id: 'athletes', icon: Users, label: 'My Athletes' },
               { id: 'evaluations', icon: Star, label: 'Evaluations' },
               { id: 'settings', icon: Settings, label: 'Settings' },
            ].map(item => (
               <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'hover:bg-slate-800 hover:text-white'}`}
               >
                  <item.icon size={20} />
                  <span className="font-medium hidden lg:block">{item.label}</span>
               </button>
            ))}
            {onNavigate && (
               <button
                  onClick={() => onNavigate('calendar')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
               >
                  <Calendar size={20} />
                  <span className="font-medium hidden lg:block">Full Calendar</span>
               </button>
            )}
         </nav>

         <div className="p-4 border-t border-slate-800">
            <button onClick={logoutUser} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-slate-400">
               <LogOut size={20} />
               <span className="font-medium hidden lg:block">Log Out</span>
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
         {/* Top Header */}
         <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h1>
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.sport} Department</div>
               </div>
               <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                  {user.name.charAt(0)}
               </div>
            </div>
         </header>

         {/* Scrollable Content */}
         <div className="flex-1 overflow-auto p-8">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'athletes' && (
              <Suspense fallback={<LoadingFallback />}>
                <AthletesTab sessions={sessions} rosters={rosters} user={user} onNavigateToEvaluations={(athleteId) => {
                  setActiveTab('evaluations');
                  // Store athlete ID for pre-selection
                  window.selectedAthleteForEval = athleteId;
                }} />
              </Suspense>
            )}
            {activeTab === 'evaluations' && (
              <Suspense fallback={<LoadingFallback />}>
                <EvaluationsTab sessions={sessions} rosters={rosters} setRosters={setRosters} user={user} />
              </Suspense>
            )}
            {activeTab === 'settings' && (
              <Suspense fallback={<LoadingFallback />}>
                <AccountSettings user={user} onUpdate={(updatedUser) => {
                  // Update user in parent component if needed
                  localStorage.setItem('vanguard_user', JSON.stringify(updatedUser));
                }} onBack={() => setActiveTab('overview')} />
              </Suspense>
            )}
         </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
