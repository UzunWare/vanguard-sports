import React, { useState, useMemo } from 'react';
import { Search, Users, Filter, HeartPulse, Phone, Mail, AlertTriangle, X, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { calculateAttendancePercentage } from '../../../utils/calculations';

/**
 * AthletesTab Component
 * Complete athlete directory with search, filters, and detailed profiles
 */
const AthletesTab = ({ sessions, rosters, user, onNavigateToEvaluations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('all');
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid | list

  // Get all sessions for this coach's sport
  const mySessions = sessions.filter(s => s.sport === user.sport);

  // Get all athletes from all sessions
  const allAthletes = useMemo(() => {
    const athletes = [];
    mySessions.forEach(session => {
      const sessionRoster = rosters[session.id] || [];
      sessionRoster.forEach(athlete => {
        athletes.push({
          ...athlete,
          sessionId: session.id,
          sessionName: session.level,
          sessionTime: session.time
        });
      });
    });
    return athletes;
  }, [mySessions, rosters]);

  // Filter athletes based on search and session
  const filteredAthletes = useMemo(() => {
    return allAthletes.filter(athlete => {
      const matchesSearch = athlete.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSession = selectedSession === 'all' || athlete.sessionId === selectedSession;
      return matchesSearch && matchesSession;
    });
  }, [allAthletes, searchTerm, selectedSession]);

  // Calculate stats
  const totalAthletes = allAthletes.length;
  const athletesWithMedical = allAthletes.filter(a => a.medical && a.medical !== 'None').length;
  const avgAttendance = allAthletes.length > 0
    ? Math.round(allAthletes.filter(a => a.attendance === 'present').length / allAthletes.length * 100)
    : 0;

  // Handle athlete click
  const handleAthleteClick = (athlete) => {
    // Build full profile from real athlete data
    const fullProfile = {
      ...athlete,
      attendanceRate: athlete.attendanceRate || 0,
      evaluationCount: 0, // TODO: Get from backend
      lastEvaluation: 'Not evaluated yet',
      emergencyContacts: athlete.emergencyContacts || [
        {
          id: 'ec1',
          name: athlete.parent,
          phone: athlete.phone,
          relationship: 'Parent',
          isPrimary: true
        }
      ],
      attendanceHistory: [], // TODO: Get from backend
      medicalHistory: []
    };
    setSelectedAthlete(fullProfile);
  };

  // Close modal
  const closeModal = () => {
    setSelectedAthlete(null);
  };

  // Get attendance badge color
  const getAttendanceBadge = (rate) => {
    if (rate >= 90) return { color: 'green', label: 'Excellent' };
    if (rate >= 75) return { color: 'blue', label: 'Good' };
    if (rate >= 60) return { color: 'yellow', label: 'Fair' };
    return { color: 'red', label: 'Needs Attention' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} className="text-blue-600" />
            <Badge color="blue">Total</Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalAthletes}</div>
          <div className="text-sm text-slate-500 mt-1">Athletes</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <HeartPulse size={24} className="text-red-600" />
            <Badge color="red">Medical</Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900">{athletesWithMedical}</div>
          <div className="text-sm text-slate-500 mt-1">With Medical Info</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={24} className="text-green-600" />
            <Badge color="green">Attendance</Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900">{avgAttendance}%</div>
          <div className="text-sm text-slate-500 mt-1">Average Rate</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="text-purple-600" />
            <Badge color="purple">Sessions</Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900">{mySessions.length}</div>
          <div className="text-sm text-slate-500 mt-1">Active Groups</div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search athletes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="md:w-64">
            <div className="relative">
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
              >
                <option value="all">All Sessions</option>
                {mySessions.map(session => (
                  <option key={session.id} value={session.id}>
                    {session.level}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="px-4"
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="px-4"
            >
              List
            </Button>
          </div>
        </div>
      </Card>

      {/* Athletes Display */}
      {filteredAthletes.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No Athletes Found</h3>
          <p className="text-sm text-slate-500">
            {searchTerm ? 'Try adjusting your search term' : 'No athletes enrolled yet'}
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => {
            const attendanceRate = athlete.attendanceRate || 0;
            const attendanceBadge = getAttendanceBadge(attendanceRate);
            const hasMedical = athlete.medical && athlete.medical !== 'None';

            return (
              <Card
                key={athlete.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group border-t-4 border-t-transparent hover:border-t-orange-500"
                onClick={() => handleAthleteClick(athlete)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl group-hover:scale-110 transition-transform">
                      {athlete.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{athlete.name}</h3>
                      <p className="text-sm text-slate-500">Age {athlete.age}</p>
                    </div>
                  </div>
                  {hasMedical && (
                    <div className="p-2 bg-red-50 rounded-lg" title={athlete.medical}>
                      <HeartPulse size={18} className="text-red-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Jersey:</span>
                    <Badge color="gray">{athlete.jersey}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Session:</span>
                    <span className="font-semibold text-slate-700">{athlete.sessionName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Attendance:</span>
                    <Badge color={attendanceBadge.color}>
                      {attendanceRate}% • {attendanceBadge.label}
                    </Badge>
                  </div>
                </div>

                {/* Ratings Preview */}
                {athlete.ratings && Object.keys(athlete.ratings).length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>Latest Ratings:</span>
                      <span>{Object.keys(athlete.ratings).length} skills</span>
                    </div>
                    <div className="flex gap-1">
                      {Object.entries(athlete.ratings).slice(0, 5).map(([skill, rating]) => (
                        <div
                          key={skill}
                          className={`h-2 flex-1 rounded-full ${
                            rating >= 4 ? 'bg-green-500' :
                            rating >= 3 ? 'bg-blue-500' :
                            rating >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          title={`${skill}: ${rating}/5`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        // List View
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4 text-left">Athlete</th>
                <th className="p-4 text-left">Session</th>
                <th className="p-4 text-center">Jersey</th>
                <th className="p-4 text-center">Attendance</th>
                <th className="p-4 text-center">Medical</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAthletes.map((athlete) => {
                const attendanceRate = athlete.attendanceRate || 0;
                const attendanceBadge = getAttendanceBadge(attendanceRate);
                const hasMedical = athlete.medical && athlete.medical !== 'None';

                return (
                  <tr key={athlete.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                          {athlete.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{athlete.name}</div>
                          <div className="text-xs text-slate-500">Age {athlete.age}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-700">{athlete.sessionName}</td>
                    <td className="p-4 text-center">
                      <Badge color="gray">{athlete.jersey}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge color={attendanceBadge.color}>{attendanceRate}%</Badge>
                    </td>
                    <td className="p-4 text-center">
                      {hasMedical ? (
                        <HeartPulse size={18} className="text-red-600 mx-auto" title={athlete.medical} />
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => handleAthleteClick(athlete)}
                        className="text-xs h-8 px-3"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Student Detail Modal */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl relative max-h-[90vh] flex flex-col">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {selectedAthlete.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedAthlete.name}</h2>
                  <p className="text-slate-600">
                    {selectedAthlete.sessionName} • Age {selectedAthlete.age} • Jersey {selectedAthlete.jersey}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-semibold mb-1">Attendance Rate</div>
                  <div className="text-2xl font-bold text-blue-900">{selectedAthlete.attendanceRate}%</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-semibold mb-1">Evaluations</div>
                  <div className="text-2xl font-bold text-green-900">{selectedAthlete.evaluationCount}</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-semibold mb-1">Last Evaluation</div>
                  <div className="text-sm font-bold text-purple-900">{selectedAthlete.lastEvaluation}</div>
                </div>
              </div>

              {/* Parent Contact */}
              <div>
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Phone size={18} className="text-orange-600" />
                  Parent Contact
                </h3>
                <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Name:</span>
                    <span className="font-semibold text-slate-900">{selectedAthlete.parent}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <a href={`tel:${selectedAthlete.phone}`} className="font-semibold text-orange-600 hover:underline">
                      {selectedAthlete.phone}
                    </a>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" className="flex-1">
                      <Phone size={16} /> Call
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Mail size={16} /> Email
                    </Button>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              {selectedAthlete.emergencyContacts && selectedAthlete.emergencyContacts.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-red-600" />
                    Emergency Contacts
                  </h3>
                  <div className="space-y-3">
                    {selectedAthlete.emergencyContacts.map((contact, index) => (
                      <div key={contact.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center justify-between mb-2">
                          <Badge color={contact.isPrimary ? 'red' : 'gray'}>
                            {contact.isPrimary ? 'Primary' : 'Secondary'}
                          </Badge>
                          <span className="text-xs text-slate-500">{contact.relationship}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{contact.name}</span>
                          <a href={`tel:${contact.phone}`} className="text-sm text-red-600 hover:underline">
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Information */}
              {selectedAthlete.medical && selectedAthlete.medical !== 'None' && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <HeartPulse size={18} className="text-red-600" />
                    Medical Information
                  </h3>
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 mb-1">Important Medical Alert</p>
                        <p className="text-sm text-red-800">{selectedAthlete.medical}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance History */}
              {selectedAthlete.attendanceHistory && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    Recent Attendance
                  </h3>
                  <div className="flex gap-1 flex-wrap">
                    {selectedAthlete.attendanceHistory.slice(0, 12).map((record, index) => (
                      <div
                        key={index}
                        className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                        title={`${record.date}: ${record.status}`}
                      >
                        <div className="font-bold">{record.date.split(' ')[1]}</div>
                        <div className="text-[10px]">{record.date.split(' ')[0]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
              <Button variant="ghost" onClick={closeModal}>
                Close
              </Button>
              <Button onClick={() => {
                closeModal();
                if (onNavigateToEvaluations) {
                  onNavigateToEvaluations(selectedAthlete.id);
                }
              }}>
                Create Evaluation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthletesTab;
