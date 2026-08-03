'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Zap, Trophy, Clock } from 'lucide-react';

const QUESTIONS = [
  'Name a common password people actually use',
  'Name something you should never click in an email',
  'Name a way hackers try to trick you',
  'Name something you do on your phone that is risky',
  'Name a sign that an email might be fake',
];

const SAMPLE_ANSWERS: Record<number, string[]> = {
  0: ['123456', 'password', 'qwerty', 'your name', 'birthday'],
  1: ['Unknown links', 'Attachments', 'Login forms', 'Too good to be true offers', 'Urgent warnings'],
  2: ['Phishing', 'Fake emails', 'Urgency', 'Free stuff', 'Pretend to be someone else'],
  3: ['Public WiFi', 'Clicking links', 'Sharing location', 'Using same password', 'Ignoring updates'],
  4: ['Bad grammar', 'Wrong email address', 'Urgent language', 'Unknown sender', 'Asks for password'],
};

interface Props {
  participantName?: string | null;
}

export function SimulationIdle({ participantName }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [buzzed, setBuzzed] = useState(false);
  const [buzzCount, setBuzzCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [yourRank, setYourRank] = useState<number | null>(null);

  // Countdown timer for each question
  useEffect(() => {
    if (buzzed || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [buzzed, timeLeft]);

  // Simulate other participants buzzing in (fake counter for atmosphere)
  useEffect(() => {
    const id = setInterval(() => {
      setBuzzCount((c) => {
        if (c >= 47) return c;
        return c + Math.floor(Math.random() * 3);
      });
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [currentQ]);

  // Auto-advance to next question after timer or buzz
  useEffect(() => {
    if (timeLeft > 0 && !buzzed) return;
    const id = setTimeout(() => {
      setCurrentQ((q) => (q + 1) % QUESTIONS.length);
      setBuzzed(false);
      setTimeLeft(30);
      setYourRank(null);
    }, 2500);
    return () => clearTimeout(id);
  }, [timeLeft, buzzed]);

  const handleBuzz = () => {
    if (buzzed) return;
    setBuzzed(true);
    // Fake rank — you're somewhere in the top 10
    setYourRank(Math.floor(Math.random() * 12) + 1);
  };

  const spotsLeft = Math.max(0, 10 - (yourRank ?? 99));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center px-4 py-8"
    >
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600/15 border border-blue-500/40 px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-blue-300"
          >
            <Zap className="h-3.5 w-3.5" />
            Buzzer Round Active
          </motion.div>
          <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-blue-400">Family Feud</span>
            <span className="text-muted-foreground"> · </span>
            <span className="text-foreground">CYBER EDITION</span>
          </h1>
          {participantName && (
            <p className="text-sm text-muted-foreground">
              Welcome, <span className="text-foreground font-medium">{participantName}</span>!
            </p>
          )}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-3 text-center">
            <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Buzzed in</p>
            <p className="font-mono text-lg font-bold text-foreground">{buzzCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-3 text-center">
            <Trophy className="h-4 w-4 text-amber-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Spots left</p>
            <p className="font-mono text-lg font-bold text-foreground">{Math.max(0, 10 - Math.min(buzzCount, 10))}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/60 backdrop-blur p-3 text-center">
            <Clock className="h-4 w-4 text-red-400 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Time left</p>
            <p className="font-mono text-lg font-bold text-foreground tabular-nums">{timeLeft}s</p>
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-blue-500/30 bg-card/80 backdrop-blur p-6 sm:p-8"
          >
            <p className="font-mono text-xs text-blue-400 uppercase tracking-wider mb-2">
              Question {currentQ + 1} of {QUESTIONS.length}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
              {QUESTIONS[currentQ]}
            </h2>

            {/* Buzz button or result */}
            <div className="mt-6">
              {!buzzed ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuzz}
                  disabled={timeLeft <= 0}
                  className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                >
                  <Zap className="h-6 w-6" />
                  BUZZ IN!
                </motion.button>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center space-y-2"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-4 py-2">
                    <Trophy className="h-4 w-4 text-emerald-400" />
                    <span className="font-mono text-sm text-emerald-300">
                      You buzzed in! Rank #{yourRank}
                    </span>
                  </div>
                  {yourRank && yourRank <= 10 ? (
                    <p className="text-sm text-emerald-300">
                      🎉 You made the top 10! You&apos;re in the Family Feud round.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Better luck on the next question!
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sample answers (revealed after buzz or timeout) */}
            {(buzzed || timeLeft <= 0) && SAMPLE_ANSWERS[currentQ] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 pt-4 border-t border-border"
              >
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Top answers
                </p>
                <div className="space-y-1.5">
                  {SAMPLE_ANSWERS[currentQ].map((ans, i) => (
                    <div
                      key={ans}
                      className="flex items-center gap-2 rounded bg-background/40 px-3 py-1.5 text-sm"
                    >
                      <span className="font-mono text-xs text-muted-foreground w-6">
                        {i + 1}.
                      </span>
                      <span className="text-foreground">{ans}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground/60 font-mono">
          Stay sharp · Next question coming up...
        </p>
      </div>
    </motion.div>
  );
}
