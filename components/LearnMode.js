'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, BookOpen } from 'lucide-react';
import Image from 'next/image';
import PoseDetection from './PoseDetection';

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

const ALL_POSES = [
  {
    id: 1,
    name: 'Pranamasana',
    title: 'Prayer Pose',
    description: 'Stand with palms together at chest',
    emoji: '🙏',
    difficulty: 'Easy'
  },
  {
    id: 2,
    name: 'Hasta Utthanasana',
    title: 'Raised Arms Pose',
    description: 'Arms up, arch back slightly',
    emoji: '🌟',
    difficulty: 'Easy'
  },
  {
    id: 3,
    name: 'Padahastasana',
    title: 'Forward Bend',
    description: 'Touch toes, bend forward',
    emoji: '🧘',
    difficulty: 'Medium'
  },
  {
    id: 4,
    name: 'Ashwa Sanchalanasana',
    title: 'Equestrian Pose',
    description: 'One leg back, knee down',
    emoji: '🦵',
    difficulty: 'Medium'
  },
  {
    id: 5,
    name: 'Kumbhakasana',
    title: 'Plank Pose',
    description: 'Straight body like a plank',
    emoji: '💪',
    difficulty: 'Hard'
  },
  {
    id: 6,
    name: 'Ashtanga Namaskara',
    title: 'Eight Point Pose',
    description: 'Chest and knees down',
    emoji: '🌙',
    difficulty: 'Hard'
  },
  {
    id: 7,
    name: 'Bhujangasana',
    title: 'Cobra Pose',
    description: 'Chest up, arms straight',
    emoji: '🐍',
    difficulty: 'Medium'
  },
  {
    id: 8,
    name: 'Adho Mukh Svanasana',
    title: 'Downward Dog',
    description: 'Inverted V shape',
    emoji: '🐕',
    difficulty: 'Medium'
  }
];

const DIFFICULTY_COLORS = {
  'Easy': 'from-green-500 to-emerald-500',
  'Medium': 'from-yellow-500 to-orange-500',
  'Hard': 'from-red-500 to-pink-500'
};

export default function LearnMode({ onBack }) {
  const [selectedPose, setSelectedPose] = useState(null);
  const [isPracticing, setIsPracticing] = useState(false);

  if (isPracticing && selectedPose) {
    return <PoseDetection onBack={() => setIsPracticing(false)} learnMode={true} targetPose={selectedPose.name.toLowerCase()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full text-white font-semibold hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-black text-white">Learn Mode</h1>
          </div>
        </div>

        <p className="text-center text-purple-200 text-xl mb-2">
          Choose any pose to practice individually
        </p>
        <p className="text-center text-purple-300 text-lg">
          Perfect your form at your own pace
        </p>
      </div>

      {/* Poses Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ALL_POSES.map((pose, idx) => (
            <motion.div
              key={pose.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => {
                setSelectedPose(pose);
                setIsPracticing(true);
              }}
              className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border-2 border-white/20 hover:border-white/50 transition-all cursor-pointer shadow-xl hover:shadow-2xl"
            >
              {/* Pose Header */}
              <div className="relative h-48 bg-gradient-to-br from-purple-600/40 to-pink-600/40 flex items-center justify-center overflow-hidden">
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
                    <div className="text-8xl z-10">
                      {pose.emoji}
                    </div>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <div className="bg-white/90 rounded-full p-4">
                    <Play className="w-12 h-12 text-purple-600 fill-current" />
                  </div>
                </div>
                
                {/* Difficulty Badge */}
                <div className={`absolute top-4 right-4 bg-gradient-to-r ${DIFFICULTY_COLORS[pose.difficulty]} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20`}>
                  {pose.difficulty}
                </div>
              </div>

              {/* Pose Info */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{pose.title}</h3>
                <p className="text-purple-300 text-sm mb-3 font-mono">{pose.name}</p>
                <p className="text-purple-200 text-base mb-4 leading-relaxed">
                  {pose.description}
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Practice This Pose
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
        >
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            Learn Mode Tips
          </h3>
          <ul className="space-y-3 text-purple-200">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <span>Select any pose to practice it individually without following the sequence</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <span>Take your time to perfect each pose at your own pace</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <span>The AI will provide real-time feedback on your form and accuracy</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <span>Practice difficult poses multiple times until you&apos;re comfortable</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
