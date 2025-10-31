'use client';

import { useState } from 'react';
import PoseDetection from '@/components/PoseDetection';
import Hero from '@/components/Hero';
import { motion } from 'framer-motion';

export default function Home() {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {!isStarted ? (
        <Hero onStart={() => setIsStarted(true)} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <PoseDetection onBack={() => setIsStarted(false)} />
        </motion.div>
      )}
    </main>
  );
}
