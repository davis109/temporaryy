'use client';

import { motion } from 'framer-motion';
import { Sparkles, Play, Target, Zap, Brain, Video, TrendingUp, CheckCircle, ArrowRight, Camera, Users, Shield } from 'lucide-react';
import { useState, useRef } from 'react';
import Image from 'next/image';

// GSAP imports removed - using Framer Motion for all animations to prevent hydration issues

// Static sparkle positions to prevent hydration mismatch
const STATIC_SPARKLES = [
  { x: 12, y: 8, delay: 0.5 }, { x: 85, y: 15, delay: 1.2 }, { x: 45, y: 25, delay: 0.8 },
  { x: 68, y: 35, delay: 1.5 }, { x: 22, y: 42, delay: 0.3 }, { x: 91, y: 52, delay: 1.8 },
  { x: 38, y: 61, delay: 0.9 }, { x: 74, y: 71, delay: 1.1 }, { x: 15, y: 78, delay: 0.6 },
  { x: 56, y: 88, delay: 1.4 }, { x: 82, y: 93, delay: 0.4 }, { x: 28, y: 18, delay: 1.6 },
  { x: 95, y: 28, delay: 0.7 }, { x: 42, y: 38, delay: 1.3 }, { x: 65, y: 48, delay: 0.2 },
  { x: 19, y: 58, delay: 1.7 }, { x: 88, y: 68, delay: 0.5 }, { x: 33, y: 75, delay: 1.0 },
  { x: 71, y: 82, delay: 0.8 }, { x: 8, y: 12, delay: 1.9 }, { x: 52, y: 22, delay: 0.4 },
  { x: 78, y: 32, delay: 1.2 }, { x: 25, y: 45, delay: 0.6 }, { x: 92, y: 55, delay: 1.5 },
  { x: 48, y: 65, delay: 0.9 }, { x: 14, y: 72, delay: 1.1 }, { x: 85, y: 85, delay: 0.3 },
  { x: 61, y: 95, delay: 1.8 }, { x: 35, y: 5, delay: 0.7 }, { x: 98, y: 18, delay: 1.4 }
];

// Helper function to get image path for a pose
const getPoseImage = (poseName) => {
  const imageMap = {
    'Pranamasana': '/images/Pranamasana.jpg',
    'Hasta Utthanasana': '/images/Hastauttanasana.jpg',
    'Padahastasana': '/images/Hastapadasana.jpg',
    'Ashwa Sanchalanasana': '/images/Ashwa_Sanchalanasana.jpg',
    'Kumbhakasana': null, // No image available
    'Ashtanga Namaskara': '/images/Ashtanga_Namaskara.jpg',
    'Bhujangasana': '/images/Bhujangasana.jpg',
    'Adho Mukh Svanasana': '/images/Adho_Mukha_Svanasana.jpg',
  };
  return imageMap[poseName] || null;
};

const YOGA_POSES = [
  {
    name: 'Pranamasana',
    title: 'Prayer Pose',
    description: 'Begin your journey with centered breathing and prayer position',
    benefits: ['Calms the mind', 'Improves focus', 'Centers energy'],
    emoji: '🙏',
    tips: 'Keep your palms together at heart center, feet together, and spine straight',
    videoId: '1VYlOKUdylM'
  },
  {
    name: 'Hasta Utthanasana',
    title: 'Raised Arms Pose',
    description: 'Stretch upward, opening chest and improving flexibility',
    benefits: ['Stretches abdomen', 'Improves digestion', 'Tones arms'],
    emoji: '🌟',
    tips: 'Reach arms up and back, keep hips forward, gentle backbend',
    videoId: '5WQ1DW7h6CY'
  },
  {
    name: 'Padahastasana',
    title: 'Forward Bend',
    description: 'Touch your toes, energizing the nervous system',
    benefits: ['Relieves stress', 'Stretches hamstrings', 'Aids digestion'],
    emoji: '🧘',
    tips: 'Fold forward from hips, keep knees slightly bent if needed',
    videoId: 'g_tea8ZNk5A'
  },
  {
    name: 'Ashwa Sanchalanasana',
    title: 'Equestrian Pose',
    description: 'Lunge position strengthening legs and opening hips',
    benefits: ['Strengthens legs', 'Opens hip flexors', 'Improves balance'],
    emoji: '🦵',
    tips: 'Step right leg back, left knee over ankle, chest lifted',
    videoId: '1VYlOKUdylM'
  },
  {
    name: 'Kumbhakasana',
    title: 'Plank Pose',
    description: 'Build core strength and stability',
    benefits: ['Strengthens core', 'Tones arms', 'Improves posture'],
    emoji: '💪',
    tips: 'Body in straight line from head to heels, core engaged',
    videoId: 'pSHjTRCQxIw'
  },
  {
    name: 'Ashtanga Namaskara',
    title: 'Eight Limbed Pose',
    description: 'Salute with eight points touching the ground',
    benefits: ['Strengthens back', 'Opens chest', 'Improves flexibility'],
    emoji: '🌙',
    tips: 'Knees, chest, chin touch ground, hips stay elevated',
    videoId: '1VYlOKUdylM'
  },
  {
    name: 'Bhujangasana',
    title: 'Cobra Pose',
    description: 'Open your chest and strengthen your spine',
    benefits: ['Strengthens spine', 'Opens chest', 'Relieves stress'],
    emoji: '🐍',
    tips: 'Press palms down, lift chest, shoulders back and down',
    videoId: 'JUP_YdYyfQw'
  },
  {
    name: 'Adho Mukh Svanasana',
    title: 'Downward Dog',
    description: 'Inverted V-shape rejuvenating the entire body',
    benefits: ['Energizes body', 'Strengthens arms', 'Stretches spine'],
    emoji: '🐕',
    tips: 'Hands shoulder-width, push hips up and back, heels toward ground',
    videoId: 'kVl2uTkR2h8'
  },
  {
    name: 'Ashwa Sanchalanasana',
    title: 'Equestrian Pose (Return)',
    description: 'Lunge with opposite leg forward',
    benefits: ['Strengthens legs', 'Opens hip flexors', 'Improves balance'],
    emoji: '🦵',
    tips: 'Step left leg forward, right knee over ankle, chest lifted',
    videoId: '1VYlOKUdylM'
  },
  {
    name: 'Padahastasana',
    title: 'Forward Bend (Return)',
    description: 'Deep forward fold to complete the flow',
    benefits: ['Relieves stress', 'Stretches hamstrings', 'Aids digestion'],
    emoji: '🧘',
    tips: 'Both feet together, fold deeply from the hips',
    videoId: 'g_tea8ZNk5A'
  },
  {
    name: 'Hasta Utthanasana',
    title: 'Raised Arms Pose (Return)',
    description: 'Stretch upward with renewed energy',
    benefits: ['Stretches abdomen', 'Improves digestion', 'Tones arms'],
    emoji: '🌟',
    tips: 'Rise up with breath, arms reaching skyward',
    videoId: '5WQ1DW7h6CY'
  },
  {
    name: 'Pranamasana',
    title: 'Prayer Pose (Return)',
    description: 'Complete the cycle with gratitude',
    benefits: ['Calms the mind', 'Improves focus', 'Centers energy'],
    emoji: '🙏',
    tips: 'Return to prayer position, take a moment to reflect',
    videoId: '1VYlOKUdylM'
  }
];

export default function HeroEnhanced({ onStartPractice, onStartLearn }) {
  const [selectedPose, setSelectedPose] = useState(null);
  const heroRef = useRef(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {STATIC_SPARKLES.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + pos.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Sparkles className="w-3 h-3 text-yellow-300" />
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <div 
        ref={heroRef}
        className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="hero-title"
          >
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-none tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Zenpose
              </span>
              <br />
              <span className="text-5xl md:text-6xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                AIML Based Yoga Detection
              </span>
              <br />
              <span className="text-5xl md:text-6xl bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                and Correction
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-2xl md:text-4xl text-purple-100 mb-6 font-bold">
              Real-time AI Pose Detection • 97.69% Accuracy • 12 Sacred Poses
            </p>
            
            <p className="text-lg md:text-xl text-purple-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience the ancient practice of Suryanamaskara guided by cutting-edge artificial intelligence. 
              Our system analyzes <span className="text-yellow-400 font-bold">33 body landmarks</span> in real-time 
              to ensure perfect form and provide instant corrections.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12 max-w-5xl mx-auto"
          >
            {[
              { label: 'Model Accuracy', value: '97.69', suffix: '%', icon: Target, color: 'from-green-500 to-emerald-500' },
              { label: 'Sacred Poses', value: '12', suffix: '', icon: Zap, color: 'from-yellow-500 to-orange-500' },
              { label: 'Body Landmarks', value: '33', suffix: '', icon: Brain, color: 'from-blue-500 to-cyan-500' },
              { label: 'Response Time', value: '50', suffix: 'ms', icon: TrendingUp, color: 'from-purple-500 to-pink-500' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.08, y: -8 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/30 shadow-2xl hover:bg-white/15 transition-all"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 mx-auto`}>
                  <stat.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm md:text-base text-purple-300 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-8">
            {/* ADVANCED CORRECTION SYSTEM - MAIN USP */}
            <motion.button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:5000/api/start-correc', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                  const data = await response.json();
                  if (data.success) {
                    alert('🎯 Advanced Correction System Launched!\n\nA new window has opened with the professional correction system.\n\n✓ Real-time angle-based corrections\n✓ Professional feedback system\n✓ Press Q to exit\n\nMake sure the new window is visible!');
                  } else {
                    alert('Error: ' + data.message);
                  }
                } catch (error) {
                  alert('Please make sure the backend server is running:\npython api_server.py');
                }
              }}
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              whileHover={{ scale: 1.1, boxShadow: '0 0 50px rgba(255, 0, 255, 0.8)' }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 text-white text-3xl md:text-4xl font-black px-20 py-10 rounded-full shadow-2xl hover:shadow-pink-500/80 transition-all overflow-hidden border-4 border-yellow-400 animate-pulse"
            >
              <span className="relative z-10 flex items-center gap-4">
                <Target className="w-12 h-12" />
                🎯 ADVANCED CORRECTION SYSTEM
                <Zap className="w-12 h-12" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
            <motion.button
              onClick={onStartPractice}
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white text-2xl md:text-3xl font-black px-16 py-8 rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-4">
                <Play className="w-10 h-10 fill-current" />
                Start Full Practice
                <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            <motion.button
              onClick={onStartLearn}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white text-2xl md:text-3xl font-black px-16 py-8 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all overflow-hidden border-2 border-white/30"
            >
              <span className="relative z-10 flex items-center gap-4">
                📚 Learn Mode
                <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
                initial={{ x: '-100%' }}
                whileHover={{ x: '0%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>

          <p className="text-purple-300 mt-6 text-lg flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            Allow camera access to begin • Works best in good lighting
          </p>
        </div>
      </div>

      {/* About Suryanamaskara Section */}
      <div className="relative z-10 py-32 px-4 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-6">
              What is Suryanamaskara?
            </h2>
            <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 mx-auto rounded-full mb-8"></div>
            <p className="text-xl md:text-2xl text-purple-200 max-w-4xl mx-auto leading-relaxed">
              Suryanamaskara, or Sun Salutation, is an ancient yogic practice comprising <span className="text-yellow-400 font-bold">12 powerful poses</span> 
              performed in a flowing sequence. This sacred practice dates back thousands of years and is designed to honor the sun 
              as the source of all life and energy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: '🌅',
                title: 'Ancient Wisdom',
                description: 'A 3,000+ year old practice that harmonizes body, mind, and spirit through rhythmic movement and breath'
              },
              {
                icon: '💫',
                title: 'Complete Workout',
                description: 'Engages every major muscle group, improves flexibility, and boosts cardiovascular health in just 12 poses'
              },
              {
                icon: '🧠',
                title: 'Holistic Benefits',
                description: 'Enhances mental clarity, reduces stress, improves posture, and promotes overall wellbeing'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
              >
                <div className="text-6xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-purple-200 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-5xl md:text-7xl font-black text-center text-white mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Why Choose Our AI System?
          </motion.h2>
          <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 mx-auto rounded-full mb-12"></div>
          <motion.p
            className="text-xl md:text-2xl text-purple-200 text-center mb-20 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Advanced machine learning meets ancient wisdom for the perfect yoga practice
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'RandomForest ML Model',
                description: 'Trained on 2,159 samples with 97.69% accuracy using GridSearchCV optimization for superior pose classification',
                color: 'from-blue-500 to-cyan-500',
                highlight: '2,159 samples'
              },
              {
                icon: Video,
                title: 'MediaPipe Integration',
                description: 'Google\'s MediaPipe processes 33 body landmarks at 60fps for smooth, real-time pose tracking',
                color: 'from-purple-500 to-pink-500',
                highlight: '60 FPS'
              },
              {
                icon: Target,
                title: 'Precision Corrections',
                description: 'Get specific feedback on alignment, joint angles, and body positioning for perfect form',
                color: 'from-yellow-500 to-orange-500',
                highlight: '33 landmarks'
              },
              {
                icon: TrendingUp,
                title: 'Instant Analysis',
                description: 'Sub-50ms response time ensures your corrections appear in real-time as you practice',
                color: 'from-green-500 to-emerald-500',
                highlight: '<50ms'
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description: 'All processing happens locally - your video never leaves your device',
                color: 'from-red-500 to-rose-500',
                highlight: '100% private'
              },
              {
                icon: Users,
                title: 'For All Levels',
                description: 'Whether beginner or advanced, get personalized guidance tailored to your practice',
                color: 'from-indigo-500 to-purple-500',
                highlight: 'All levels'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all cursor-pointer overflow-hidden relative"
                whileHover={{ y: -12, scale: 1.02 }}
              >
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute top-6 right-6 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                  {feature.highlight}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-purple-200 leading-relaxed text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* 🎯 ADVANCED CORRECTION SYSTEM HIGHLIGHT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 relative"
          >
            <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-[3rem] p-1 shadow-2xl">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.8rem] p-12 relative overflow-hidden">
                {/* Animated background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-red-500/20"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <Target className="w-16 h-16 text-yellow-400 animate-pulse" />
                    <h3 className="text-4xl md:text-6xl font-black text-white text-center">
                      🎯 ADVANCED CORRECTION SYSTEM
                    </h3>
                    <Zap className="w-16 h-16 text-yellow-400 animate-pulse" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg animate-bounce">
                      NEW
                    </div>
                    <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-lg">
                      PROFESSIONAL MODE
                    </div>
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                      ANGLE-BASED
                    </div>
                  </div>
                  
                  <p className="text-2xl md:text-3xl text-center text-purple-200 mb-8 max-w-5xl mx-auto leading-relaxed">
                    Experience our <span className="text-yellow-400 font-black">PREMIUM</span> correction system with 
                    <span className="text-pink-400 font-black"> angle-based analysis</span>, 
                    <span className="text-cyan-400 font-black"> real-time feedback</span>, and 
                    <span className="text-green-400 font-black"> professional-grade corrections</span> in a dedicated OpenCV window!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                      { icon: '📐', label: 'Angle Detection', desc: 'Precise joint angles' },
                      { icon: '⚡', label: 'Real-time', desc: 'Instant feedback' },
                      { icon: '🎯', label: 'Professional', desc: 'Studio-quality' },
                      { icon: '🔄', label: 'Sequential', desc: 'Guided flow' }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/30"
                      >
                        <div className="text-5xl mb-3">{item.icon}</div>
                        <div className="text-white font-bold text-xl mb-1">{item.label}</div>
                        <div className="text-purple-300 text-sm">{item.desc}</div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <motion.button
                      onClick={async () => {
                        try {
                          const response = await fetch('http://localhost:5000/api/start-correc', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert('🎯 Advanced Correction System Launched!\n\nA new window has opened with the professional correction system.\n\n✓ Real-time angle-based corrections\n✓ Professional feedback system\n✓ Press Q to exit\n\nMake sure the new window is visible!');
                          } else {
                            alert('Error: ' + data.message);
                          }
                        } catch (error) {
                          alert('Please make sure the backend server is running:\npython api_server.py');
                        }
                      }}
                      whileHover={{ scale: 1.1, boxShadow: '0 0 50px rgba(255, 215, 0, 1)' }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-black text-3xl md:text-4xl font-black px-20 py-8 rounded-full shadow-2xl hover:shadow-yellow-500/80 transition-all border-4 border-yellow-300"
                    >
                      🚀 LAUNCH ADVANCED MODE
                    </motion.button>
                    <p className="text-purple-300 mt-4 text-lg">
                      Opens in new window • Press Q to exit • Requires camera access
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 12 Poses Tutorial Section */}
      <div className="poses-section relative z-10 py-32 px-4 bg-gradient-to-b from-black/40 to-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-5xl md:text-7xl font-black text-center text-white mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The 12 Sacred Poses
          </motion.h2>
          <div className="w-32 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 mx-auto rounded-full mb-12"></div>
          <motion.p
            className="text-xl md:text-2xl text-purple-200 text-center mb-20 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Master each pose with detailed instructions, benefits, and pro tips
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {YOGA_POSES.map((pose, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all cursor-pointer shadow-xl hover:shadow-2xl"
                whileHover={{ y: -12, scale: 1.03 }}
                onClick={() => setSelectedPose(pose)}
              >
                {/* Pose Image */}
                <div className="relative h-56 bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center overflow-hidden">
                  {getPoseImage(pose.name) ? (
                    <>
                      <Image 
                        src={getPoseImage(pose.name)} 
                        alt={pose.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                      <div className="text-8xl z-10">{pose.emoji}</div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="bg-white/90 rounded-full p-4">
                      <Play className="w-12 h-12 text-purple-600 fill-current" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 bg-yellow-400 text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg z-20">
                    Step {idx + 1}
                  </div>
                </div>

                {/* Pose Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{pose.title}</h3>
                  <p className="text-purple-300 text-sm mb-1 font-mono">{pose.name}</p>
                  <p className="text-purple-200 text-base mb-4 leading-relaxed">{pose.description}</p>
                  
                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    <div className="text-xs text-yellow-400 font-bold mb-2">BENEFITS:</div>
                    {pose.benefits.map((benefit, bidx) => (
                      <div key={bidx} className="flex items-start gap-2 text-sm text-purple-200">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-3">
                    <div className="text-xs text-yellow-400 font-bold mb-1">PRO TIP:</div>
                    <p className="text-xs text-purple-100 leading-relaxed">{pose.tips}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology Deep Dive */}
      <div className="tech-section relative z-10 py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-purple-900/60 to-pink-900/60 backdrop-blur-xl rounded-[3rem] p-12 md:p-16 border-2 border-white/30 shadow-2xl"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 text-center">
              Powered by Advanced AI
            </h2>
            <p className="text-xl md:text-2xl text-purple-200 text-center mb-16 max-w-4xl mx-auto leading-relaxed">
              Our system combines Google&apos;s MediaPipe pose detection with a custom-trained RandomForest classifier 
              to deliver unparalleled accuracy and real-time performance
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="text-center bg-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-3">
                  2,159
                </div>
                <div className="text-purple-200 text-lg font-semibold">Training Samples</div>
                <p className="text-purple-300 text-sm mt-2">Diverse pose dataset</p>
              </div>
              <div className="text-center bg-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-3">
                  132
                </div>
                <div className="text-purple-200 text-lg font-semibold">Feature Dimensions</div>
                <p className="text-purple-300 text-sm mt-2">33 landmarks × 4 coordinates</p>
              </div>
              <div className="text-center bg-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-3">
                  60
                </div>
                <div className="text-purple-200 text-lg font-semibold">Frames Per Second</div>
                <p className="text-purple-300 text-sm mt-2">Smooth real-time tracking</p>
              </div>
            </div>

            <div className="bg-black/30 rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Brain className="w-8 h-8 text-yellow-400" />
                Technical Architecture
              </h3>
              <div className="space-y-4 text-purple-200">
                <p className="flex items-start gap-3">
                  <span className="text-yellow-400 font-bold">→</span>
                  <span><strong className="text-white">MediaPipe Pose:</strong> Detects 33 body landmarks (eyes, shoulders, elbows, wrists, hips, knees, ankles) with x, y, z coordinates + visibility score</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-yellow-400 font-bold">→</span>
                  <span><strong className="text-white">Feature Engineering:</strong> 132-dimensional feature vector created from landmark coordinates for ML classification</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-yellow-400 font-bold">→</span>
                  <span><strong className="text-white">RandomForest Classifier:</strong> Ensemble learning model trained with GridSearchCV for optimal hyperparameters</span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-yellow-400 font-bold">→</span>
                  <span><strong className="text-white">Real-time Pipeline:</strong> Camera → MediaPipe → Feature Extraction → Model Prediction → Visual Feedback (&lt; 50ms latency)</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative z-10 py-32 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
            Ready to Transform<br />Your Practice?
          </h2>
          <p className="text-xl md:text-2xl text-purple-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the future of yoga with AI-powered guidance that helps you master 
            the ancient art of Suryanamaskara with perfect form
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-8">
            <motion.button
              onClick={onStartPractice}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white text-3xl font-black px-20 py-10 rounded-full shadow-2xl hover:shadow-pink-500/60 transition-all"
            >
              Begin Full Practice
            </motion.button>
            
            <motion.button
              onClick={onStartLearn}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white text-3xl font-black px-20 py-10 rounded-full shadow-2xl hover:shadow-blue-500/60 transition-all border-2 border-white/30"
            >
              Learn Individual Poses
            </motion.button>
          </div>
          
          <p className="text-purple-300 text-lg">
            ✨ No registration required • Start in seconds • 100% free
          </p>
        </motion.div>
      </div>

      {/* Pose Modal */}
      {selectedPose && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedPose(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/30 shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-4xl font-black text-white mb-2">{selectedPose.title}</h3>
                  <p className="text-purple-300 font-mono">{selectedPose.name}</p>
                </div>
                <button
                  onClick={() => setSelectedPose(null)}
                  className="text-white hover:text-pink-400 transition-colors"
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="aspect-video bg-black rounded-2xl mb-6 flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedPose.videoId}`}
                  title={selectedPose.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-2xl"
                ></iframe>
              </div>

              <p className="text-xl text-purple-200 mb-6">{selectedPose.description}</p>
              
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                <h4 className="text-xl font-bold text-yellow-400 mb-4">Benefits:</h4>
                <ul className="space-y-2">
                  {selectedPose.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-purple-200">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6">
                <h4 className="text-xl font-bold text-yellow-400 mb-3">Pro Tip:</h4>
                <p className="text-purple-100 leading-relaxed">{selectedPose.tips}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
