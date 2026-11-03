import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Lock,
  ChevronRight,
  RefreshCw,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, TaskQuiz, InvestmentPlan, AppSettings } from '../types';
import { storage } from '../services/storageService';

interface TasksViewProps {
  user: User | null;
  plans: InvestmentPlan[];
  quizzes: TaskQuiz[];
  settings: AppSettings;
  onGoToPlans: () => void;
  onOpenAuth: () => void;
  onTaskCompleted: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  user,
  plans,
  quizzes,
  settings,
  onGoToPlans,
  onOpenAuth,
  onTaskCompleted
}) => {
  const [activeQuiz, setActiveQuiz] = useState<TaskQuiz | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{
    submitted: boolean;
    isCorrect: boolean;
    reward: number;
    explanation: string;
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activePlan = plans.find(p => p.id === user?.activePlanId);
  const totalTasksAllowed = activePlan ? activePlan.dailyTaskCount : 0;
  const completedToday = user?.dailyTasksCompletedToday || 0;
  const remainingToday = Math.max(0, totalTasksAllowed - completedToday);
  const taskReward = activePlan ? Number((activePlan.dailyMinEarn / activePlan.dailyTaskCount).toFixed(2)) : 0;
  const earnedToday = Number((completedToday * taskReward).toFixed(2));

  const handleStartQuiz = (quiz: TaskQuiz) => {
    setActiveQuiz(quiz);
    setSelectedOption(null);
    setQuizResult(null);
  };

  const handleSelectOption = (idx: number) => {
    if (quizResult?.submitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (!user || !activeQuiz || selectedOption === null) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const res = storage.submitTaskQuiz(user.id, activeQuiz.id, selectedOption);
      setIsSubmitting(false);
      setQuizResult({
        submitted: true,
        isCorrect: res.isCorrect,
        reward: res.reward,
        explanation: res.explanation,
        message: res.message
      });

      if (res.isCorrect) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        onTaskCompleted();
      }
    }, 400);
  };

  const handleCloseQuiz = () => {
    setActiveQuiz(null);
    setSelectedOption(null);
    setQuizResult(null);
  };

  // If user not signed in
  if (!user) {
    return (
      <div className="max-w-md mx-auto my-8 p-6 rounded-3xl bg-[#0c1622] border border-emerald-500/30 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <h3 className="font-extrabold text-xl text-white mb-2">Daily Math Quiz Tasks</h3>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Sign in or create your free account to access daily profit tasks and earn instant cash!
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  // If user has no active plan
  if (!activePlan) {
    return (
      <div className="space-y-6 pb-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#19130c] via-[#131720] to-[#0b1018] border border-amber-500/30 shadow-2xl text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
            Package Activation Required
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-3 mb-2">
            Unlock Daily Math Quiz Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
            Micro tasks are available exclusively for members holding an active investment tier (Bronze Rs. 500 up to Rs. 50,000). Activate your contract to start collecting instant cash today!
          </p>

          <button
            onClick={onGoToPlans}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 transition cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            <span>Browse Investment Packages</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Preview of Quizzes */}
        <div className="max-w-2xl mx-auto">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Sample Challenges Waiting for You
          </h4>
          <div className="space-y-2.5 opacity-75">
            {quizzes.slice(0, 3).map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#0c141d] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-200 text-xs">{q.title}</h5>
                    <p className="text-[11px] text-slate-400">{q.quizData.question}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">Locked 🔒</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active Plan View
  return (
    <div className="space-y-6 pb-6">
      {/* Header Stats Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c1b26] to-[#09121a] border border-emerald-500/35 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Daily Work Terminal
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {activePlan.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Arithmetic Challenges
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 sm:px-3 rounded-xl bg-[#070d13] border border-emerald-500/30 text-right">
              <span className="text-[10px] text-slate-400 block">Per Task Payout</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                Rs. {taskReward.toFixed(2)}
              </span>
            </div>
            <div className="p-2 sm:px-3 rounded-xl bg-[#070d13] border border-amber-500/30 text-right">
              <span className="text-[10px] text-slate-400 block">Today's Profit</span>
              <span className="text-sm font-bold text-amber-300 font-mono">
                Rs. {earnedToday.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              Tasks Completed Today
            </span>
            <span className="font-mono font-bold text-white text-sm">
              {completedToday} / {totalTasksAllowed}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${(completedToday / totalTasksAllowed) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>
              {remainingToday > 0
                ? `${remainingToday} tasks remaining to collect full Rs. ${activePlan.dailyMinEarn} daily quota.`
                : '🎉 All tasks finished for today! Next dispatch arrives after midnight.'}
            </span>
            <span className="text-emerald-400 font-mono font-semibold">Resets 00:00 PKT</span>
          </p>
        </div>
      </div>

      {/* Finished for today celebration banner */}
      {remainingToday === 0 && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-200 text-xs sm:text-sm">
              100% Daily Target Achieved!
            </h4>
            <p className="text-[11px] text-slate-300">
              You have completed all {totalTasksAllowed} arithmetic challenges. Today's Rs. {activePlan.dailyMinEarn} has been credited to your balance.
            </p>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Available Math Challenges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quizzes.slice(0, totalTasksAllowed).map((quiz, index) => {
            const isCompleted = index < completedToday;
            const isCurrent = index === completedToday && remainingToday > 0;
            const isLocked = index > completedToday;

            return (
              <div
                key={quiz.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-[#081216] border-emerald-500/30 opacity-80'
                    : isCurrent
                    ? 'bg-[#0e1824] border-emerald-400 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                    : 'bg-[#0a0f16] border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isCurrent
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm">{quiz.title}</h4>
                      <span className="text-[10px] text-slate-400">{quiz.category}</span>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                    +Rs. {taskReward.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3 bg-[#060a0f] p-2 rounded-xl border border-slate-800/80 font-mono">
                  {quiz.quizData.question}
                </p>

                <div>
                  {isCompleted ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Completed & Paid (Rs. {taskReward.toFixed(2)})</span>
                    </div>
                  ) : isCurrent ? (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Solve & Claim Cash</span>
                    </button>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-slate-900 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Complete Task #{index} First</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Quiz Runner Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#0c1622] border border-emerald-500/40 p-5 sm:p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{activeQuiz.title}</h3>
                  <span className="text-[10px] text-slate-400">Difficulty: {activeQuiz.difficulty}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Reward</span>
                <span className="font-mono text-xs font-extrabold text-emerald-400">
                  Rs. {taskReward.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quiz Question Card */}
            <div className="my-5 p-4 rounded-2xl bg-[#070c12] border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Solve the arithmetic expression:
              </span>
              <p className="text-lg sm:text-xl font-bold font-mono text-white tracking-wide">
                {activeQuiz.quizData.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2.5 mb-5">
              {activeQuiz.quizData.options.map((opt, oidx) => {
                const isSelected = selectedOption === oidx;
                let optStyles = 'bg-[#0f1722] border-slate-800 hover:border-slate-700 text-slate-200';

                if (isSelected && !quizResult) {
                  optStyles = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400';
                }

                if (quizResult?.submitted) {
                  if (oidx === activeQuiz.quizData.correctIndex) {
                    optStyles = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold';
                  } else if (isSelected && !quizResult.isCorrect) {
                    optStyles = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                  } else {
                    optStyles = 'bg-[#090d14] border-slate-850 opacity-40 text-slate-400';
                  }
                }

                return (
                  <button
                    key={oidx}
                    disabled={quizResult?.submitted}
                    onClick={() => handleSelectOption(oidx)}
                    className={`w-full p-3.5 rounded-xl border font-mono text-sm font-semibold flex items-center justify-between transition cursor-pointer ${optStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center text-xs text-slate-300 font-bold">
                        {String.fromCharCode(65 + oidx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {quizResult?.submitted && oidx === activeQuiz.quizData.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {quizResult?.submitted && isSelected && !quizResult.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Result Explanation */}
            {quizResult && (
              <div
                className={`p-3.5 rounded-2xl border mb-5 text-xs ${
                  quizResult.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {quizResult.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{quizResult.message}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>{quizResult.message}</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  Explanation: {quizResult.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div>
              {!quizResult ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCloseQuiz}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={selectedOption === null || isSubmitting}
                    onClick={handleSubmitAnswer}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? 'Evaluating...' : 'Confirm Answer'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCloseQuiz}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {quizResult.isCorrect ? 'Awesome! Next Task' : 'Understood, Continue'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
