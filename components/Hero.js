'use client';

import { motion } from 'framer-motion';
import { Play, Sparkles, Activity, Target } from 'lucide-react';

export default function Hero({ onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-6"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-16 h-16 text-yellow-300 mx-auto" />
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Surya<span className="text-yellow-300">namaskar</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-200 mb-4 max-w-3xl mx-auto">
            AI-Powered Pose Detection & Real-Time Correction
          </p>
          
          <p className="text-lg text-purple-300 mb-12 max-w-2xl mx-auto">
            Experience the future of yoga practice with intelligent pose recognition 
            and personalized feedback for perfect alignment
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <Activity className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Tracking</h3>
              <p className="text-purple-200">
                Advanced AI detects your poses instantly with high precision
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Smart Corrections</h3>
              <p className="text-purple-200">
                Get instant feedback on alignment and form improvements
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
            >
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">12 Pose Sequence</h3>
              <p className="text-purple-200">
                Complete guided Suryanamaskara flow with AI assistance
              </p>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xl font-bold px-12 py-6 rounded-full shadow-2xl transition-all duration-300"
          >
            <Play className="w-6 h-6" />
            Start Your Practice
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.2 }}
            />
          </motion.button>

          <p className="text-purple-300 mt-6 text-sm">
            Allow camera access to begin • Works best in good lighting
          </p>
        </motion.div>
      </div>
    </div>
  );
}
