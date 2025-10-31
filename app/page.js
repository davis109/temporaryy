'use client';

import { useState } from 'react';
import PoseDetection from '@/components/PoseDetection';
import HeroEnhanced from '@/components/HeroEnhanced';
import LearnMode from '@/components/LearnMode';
import { motion } from 'framer-motion';

export default function Home() {
  const [mode, setMode] = useState('home'); // 'home', 'practice', 'learn'

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {mode === 'home' && (
        <HeroEnhanced 
          onStartPractice={() => setMode('practice')} 
          onStartLearn={() => setMode('learn')}
        />
      )}
      
      {mode === 'practice' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PoseDetection onBack={() => setMode('home')} />
        </motion.div>
      )}

      {mode === 'learn' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LearnMode onBack={() => setMode('home')} />
        </motion.div>
      )}
    </main>
  );
}
