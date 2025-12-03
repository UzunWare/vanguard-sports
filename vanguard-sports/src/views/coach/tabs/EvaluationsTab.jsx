import React, { useState, useMemo } from 'react';
import { Plus, Star, Calendar, User, FileText, Trash2, Edit, Search, Filter, TrendingUp, Award, X, Check, ChevronDown } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';
import { SKILL_CRITERIA } from '../../../data/skillCriteria';
import { generateMockEvaluations } from '../../../data/mockData';
import { calculateAverageRating } from '../../../utils/calculations';

/**
 * EvaluationsTab Component
 * Complete evaluation management with history, creation, and analytics
 */
const EvaluationsTab = ({ sessions, rosters, setRosters, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('all');
  const [showNewEvalModal, setShowNewEvalModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [savedEvaluations, setSavedEvaluations] = useState([]);

  // New evaluation state
  const [newEval, setNewEval] = useState({
    athleteId: '',
    sessionId: '',
    date: new Date().toISOString().split('T')[0],
    ratings: {},
    notes: ''
  });

  // Get coach's sessions
  const mySessions = sessions.filter(s => s.sport === user.sport);

  // Get all athletes
  const allAthletes = useMemo(() => {
    const athletes = [];
    mySessions.forEach(session => {
      const sessionRoster = rosters[session.id] || [];
      sessionRoster.forEach(athlete => {
        athletes.push({
          ...athlete,
          sessionId: session.id,
          sessionName: session.level
        });
      });
    });
    return athletes;
  }, [mySessions, rosters]);

  // Check for pre-selected athlete from Athletes tab
  React.useEffect(() => {
    if (window.selectedAthleteForEval && allAthletes.length > 0) {
      const athleteId = window.selectedAthleteForEval;
      delete window.selectedAthleteForEval;
      const athlete = allAthletes.find(a => a.id === athleteId);
      if (athlete) {
        setNewEval({
          athleteId,
          sessionId: athlete.sessionId,
          date: new Date().toISOString().split('T')[0],
          ratings: athlete.ratings || {},
          notes: ''
        });
        setShowNewEvalModal(true);
      }
    }
  }, [allAthletes]);

  // Generate mock evaluations for all athletes + combine with saved ones
  const allEvaluations = useMemo(() => {
    const evals = [];

    // Add mock evaluations (only 1 per athlete to reduce clutter)
    allAthletes.forEach(athlete => {
      const mockEvals = generateMockEvaluations(athlete.id, user.sport, 1);
      mockEvals.forEach(evaluation => {
        evals.push({
          ...evaluation,
          athleteName: athlete.name,
          sessionName: athlete.sessionName,
          sessionId: athlete.sessionId
        });
      });
    });

    // Add saved evaluations
    savedEvaluations.forEach(evaluation => {
      const athlete = allAthletes.find(a => a.id === evaluation.athleteId);
      if (athlete) {
        evals.push({
          ...evaluation,
          id: evaluation.id || `eval-${Date.now()}-${Math.random()}`,
          athleteName: athlete.name,
          sessionName: athlete.sessionName,
          sessionId: athlete.sessionId,
          coach: user.name
        });
      }
    });

    return evals.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [allAthletes, user.sport, savedEvaluations]);

  // Filter evaluations
  const filteredEvaluations = useMemo(() => {
    return allEvaluations.filter(evaluation => {
      const matchesSearch = evaluation.athleteName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSession = filterSession === 'all' || evaluation.sessionId === filterSession;
      return matchesSearch && matchesSession;
    });
  }, [allEvaluations, searchTerm, filterSession]);

  // Calculate analytics
  const totalEvaluations = allEvaluations.length;
  const avgRating = allEvaluations.length > 0
    ? (allEvaluations.reduce((sum, e) => sum + calculateAverageRating(e.ratings), 0) / allEvaluations.length).toFixed(1)
    : 0;
  const recentEvaluations = allEvaluations.filter(e => {
    const evalDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return evalDate >= weekAgo;
  }).length;

  // Get skill criteria for coach's sport
  const skillCriteria = SKILL_CRITERIA[user.sport] || [];

  // Calculate skill averages across all evaluations
  const skillAverages = useMemo(() => {
    const averages = {};
    skillCriteria.forEach(skill => {
      const ratings = allEvaluations
        .map(e => e.ratings[skill])
        .filter(r => r !== undefined);
      averages[skill] = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
        : 0;
    });
    return averages;
  }, [allEvaluations, skillCriteria]);

  // Handle create new evaluation
  const handleCreateNew = () => {
    setNewEval({
      athleteId: '',
      sessionId: '',
      date: new Date().toISOString().split('T')[0],
      ratings: {},
      notes: ''
    });
    setShowNewEvalModal(true);
  };

  // Handle save evaluation
  const handleSaveEvaluation = () => {
    // In a real app, this would save to backend
    // For now, update the roster ratings and add to saved evaluations
    if (newEval.athleteId && newEval.sessionId) {
      // Calculate overall rating
      const overallRating = calculateAverageRating(newEval.ratings);

      // Create new evaluation object
      const newEvaluation = {
        id: `eval-${Date.now()}-${Math.random()}`,
        athleteId: newEval.athleteId,
        sessionId: newEval.sessionId,
        date: newEval.date,
        ratings: newEval.ratings,
        notes: newEval.notes,
        overallRating,
        coach: user.name,
        timestamp: new Date().toISOString()
      };

      // Add to saved evaluations
      setSavedEvaluations(prev => [newEvaluation, ...prev]);

      // Update roster ratings
      setRosters(prev => ({
        ...prev,
        [newEval.sessionId]: prev[newEval.sessionId].map(athlete =>
          athlete.id === newEval.athleteId
            ? { ...athlete, ratings: newEval.ratings }
            : athlete
        )
      }));

      // Reset form and close modal
      setNewEval({
        athleteId: '',
        sessionId: '',
        date: new Date().toISOString().split('T')[0],
        ratings: {},
        notes: ''
      });
      setShowNewEvalModal(false);
    }
  };

  // Handle athlete selection in new eval
  const handleAthleteSelect = (athleteId) => {
    const athlete = allAthletes.find(a => a.id === athleteId);
    setNewEval({
      ...newEval,
      athleteId,
      sessionId: athlete?.sessionId || '',
      ratings: athlete?.ratings || {}
    });
  };

  // Handle rating change
  const handleRatingChange = (skill, rating) => {
    setNewEval({
      ...newEval,
      ratings: {
        ...newEval.ratings,
        [skill]: rating
      }
    });
  };

  // Get rating badge color
  const getRatingBadge = (rating) => {
    if (rating >= 4.5) return { color: 'green', label: 'Excellent' };
    if (rating >= 3.5) return { color: 'blue', label: 'Good' };
    if (rating >= 2.5) return { color: 'yellow', label: 'Fair' };
    return { color: 'red', label: 'Needs Work' };
  };

  // Get rating color class
  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100';
    if (rating >= 3) return 'text-blue-600 bg-blue-100';
    if (rating >= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-none">
          <div className="flex items-center justify-between mb-2">
            <FileText size={24} />
            <Badge color="blue" className="bg-white/20 text-white border-transparent">Total</Badge>
          </div>
          <div className="text-3xl font-bold">{totalEvaluations}</div>
          <div className="text-blue-100 text-sm mt-1">Evaluations</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Star size={24} className="text-yellow-500" />
            <Badge color="yellow">Average</Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900">{avgRating}/5.0</div>
          <div className="text-sm text-slate-500 mt-1">Overall Rating</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={24} className="text-green-600" />
            <Badge color="green">Recent</Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900">{recentEvaluations}</div>
          <div className="text-sm text-slate-500 mt-1">Last 7 Days</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="text-orange-600" />
            <Badge color="orange">Progress</Badge>
          </div>
          <div className="text-3xl font-bold text-slate-900">+12%</div>
          <div className="text-sm text-slate-500 mt-1">vs Last Month</div>
        </Card>
      </div>

      {/* Actions and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search evaluations by athlete name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
        <div className="md:w-64">
          <div className="relative">
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
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
        <Button onClick={handleCreateNew}>
          <Plus size={18} />
          New Evaluation
        </Button>
      </div>

      {/* Skill Averages Chart */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Award size={20} className="text-orange-600" />
          Average Ratings by Skill
        </h3>
        <div className="space-y-4">
          {skillCriteria.map(skill => (
            <div key={skill}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">{skill}</span>
                <span className="text-sm font-bold text-slate-900">{skillAverages[skill]}/5.0</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    skillAverages[skill] >= 4 ? 'bg-green-500' :
                    skillAverages[skill] >= 3 ? 'bg-blue-500' :
                    skillAverages[skill] >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(skillAverages[skill] / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Evaluations Timeline */}
      <div>
        <h3 className="font-bold text-slate-900 mb-4 text-lg">Evaluation History</h3>

        {filteredEvaluations.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-slate-600 mb-2">No Evaluations Found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'Start by creating your first evaluation'}
            </p>
            <Button onClick={handleCreateNew}>
              <Plus size={18} />
              Create Evaluation
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEvaluations.map((evaluation) => {
              const avgRating = calculateAverageRating(evaluation.ratings);
              const ratingBadge = getRatingBadge(avgRating);

              return (
                <Card
                  key={evaluation.id}
                  className="p-6 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedEvaluation(evaluation)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {evaluation.athleteName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{evaluation.athleteName}</h4>
                        <p className="text-sm text-slate-500">{evaluation.sessionName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge color={ratingBadge.color}>
                        {avgRating.toFixed(1)}/5.0 • {ratingBadge.label}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">{evaluation.date}</p>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(evaluation.ratings).map(([skill, rating]) => (
                      <div key={skill} className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1 truncate" title={skill}>{skill}</div>
                        <div className={`text-xl font-bold ${getRatingColor(rating)} rounded-lg py-1`}>
                          {rating}/5
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes Preview */}
                  {evaluation.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 italic line-clamp-2">"{evaluation.notes}"</p>
                    </div>
                  )}

                  {/* Coach Name */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>By: {evaluation.coachName}</span>
                    <button className="text-orange-600 hover:text-orange-700 font-semibold">
                      View Details →
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* New Evaluation Modal */}
      {showNewEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl relative">
            <button
              onClick={() => setShowNewEvalModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="text-orange-600" size={28} />
                New Evaluation
              </h2>
              <p className="text-slate-600 mt-1">Rate athlete performance across key skills</p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
              {/* Select Athlete */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Athlete <span className="text-orange-600">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newEval.athleteId}
                    onChange={(e) => handleAthleteSelect(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="">Choose an athlete...</option>
                    {allAthletes.map(athlete => (
                      <option key={athlete.id} value={athlete.id}>
                        {athlete.name} - {athlete.sessionName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-4 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Date */}
              <Input
                label="Evaluation Date"
                type="date"
                value={newEval.date}
                onChange={(e) => setNewEval({ ...newEval, date: e.target.value })}
                required
              />

              {/* Skill Ratings */}
              {newEval.athleteId && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Rate Skills (1-5 Stars)</h3>
                  <div className="space-y-4">
                    {skillCriteria.map(skill => (
                      <div key={skill} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-slate-700">{skill}</span>
                          <span className="text-sm text-slate-500">
                            {newEval.ratings[skill] ? `${newEval.ratings[skill]}/5` : 'Not rated'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <button
                              key={rating}
                              onClick={() => handleRatingChange(skill, rating)}
                              className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                                newEval.ratings[skill] >= rating
                                  ? rating >= 4 ? 'bg-green-500 border-green-600 text-white' :
                                    rating >= 3 ? 'bg-blue-500 border-blue-600 text-white' :
                                    rating >= 2 ? 'bg-yellow-500 border-yellow-600 text-white' :
                                    'bg-red-500 border-red-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-400 hover:border-orange-400'
                              }`}
                            >
                              <Star
                                size={20}
                                fill={newEval.ratings[skill] >= rating ? 'currentColor' : 'none'}
                                className="mx-auto"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {newEval.athleteId && (
                <Textarea
                  label="Additional Notes (Optional)"
                  value={newEval.notes}
                  onChange={(e) => setNewEval({ ...newEval, notes: e.target.value })}
                  placeholder="Add any additional observations, improvements, or areas to focus on..."
                  rows={4}
                  maxLength={500}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowNewEvalModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveEvaluation}
                disabled={!newEval.athleteId || Object.keys(newEval.ratings).length === 0}
              >
                <Check size={18} />
                Save Evaluation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Detail Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative">
            <button
              onClick={() => setSelectedEvaluation(null)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-2xl">
                  {selectedEvaluation.athleteName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedEvaluation.athleteName}</h2>
                  <p className="text-slate-600">{selectedEvaluation.sessionName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Evaluated on {selectedEvaluation.date}</span>
                <Badge color={getRatingBadge(calculateAverageRating(selectedEvaluation.ratings)).color}>
                  {calculateAverageRating(selectedEvaluation.ratings).toFixed(1)}/5.0
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              <h3 className="font-bold text-slate-900">Skill Ratings</h3>
              {Object.entries(selectedEvaluation.ratings).map(([skill, rating]) => (
                <div key={skill} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">{skill}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={18}
                        fill={star <= rating ? 'currentColor' : 'none'}
                        className={star <= rating ? 'text-yellow-500' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {selectedEvaluation.notes && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">Notes</h3>
                  <p className="text-slate-700 italic">"{selectedEvaluation.notes}"</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                Evaluated by: {selectedEvaluation.coachName}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end">
              <Button variant="ghost" onClick={() => setSelectedEvaluation(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationsTab;
