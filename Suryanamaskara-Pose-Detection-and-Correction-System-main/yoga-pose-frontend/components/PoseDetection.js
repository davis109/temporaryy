'use client';

import { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Trophy, Zap } from 'lucide-react';

const POSE_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  [9, 10], [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  [17, 19], [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [27, 29], [27, 31],
  [29, 31], [24, 26], [26, 28], [28, 30], [28, 32], [30, 32]
];

const POSE_ORDER = [
  "Pranamasana",
  "Hasta Utthanasana",
  "Padahastasana",
  "Ashwa Sanchalanasana",
  "Kumbhakasana",
  "Ashtanga Namaskara",
  "Bhujangasana",
  "Adho Mukh Svanasana",
  "Ashwa Sanchalanasana",
  "Padahastasana",
  "Hasta Utthanasana",
  "Pranamasana"
];

const POSE_DESCRIPTIONS = {
  "Pranamasana": "Prayer Pose - Stand with palms together at chest",
  "Hasta Utthanasana": "Raised Arms - Arms up, arch back slightly",
  "Padahastasana": "Forward Bend - Touch toes, bend forward",
  "Ashwa Sanchalanasana": "Lunge - One leg back, knee down",
  "Kumbhakasana": "Plank - Straight body like a plank",
  "Ashtanga Namaskara": "Eight Point Pose - Chest and knees down",
  "Bhujangasana": "Cobra - Chest up, arms straight",
  "Adho Mukh Svanasana": "Downward Dog - Inverted V shape"
};

export default function PoseDetection({ onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentPose, setCurrentPose] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [progress, setProgress] = useState(0);
  const [holdFrames, setHoldFrames] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const initializePose = async () => {
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      pose.onResults(onResults);
      poseRef.current = pose;

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            }
          },
          width: 1280,
          height: 720
        });
        camera.start();
        cameraRef.current = camera;
        setIsLoading(false);
      }
    };

    initializePose();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, []);

  const onResults = (results) => {
    if (!canvasRef.current || !results.poseLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    // Draw pose landmarks
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
      color: '#00FF00',
      lineWidth: 4
    });
    drawLandmarks(ctx, results.poseLandmarks, {
      color: '#FF0000',
      lineWidth: 2,
      radius: 6
    });

    ctx.restore();

    // Simple pose detection logic (placeholder)
    analyzePose(results.poseLandmarks);
  };

  const analyzePose = (landmarks) => {
    // Placeholder for pose analysis
    // In a real implementation, you would:
    // 1. Extract features from landmarks
    // 2. Compare with reference poses
    // 3. Provide corrections
    
    const corrections = [];
    const targetPose = POSE_ORDER[currentPose];
    
    // Simulate pose detection
    const randomCorrect = Math.random() > 0.7;
    setIsCorrect(randomCorrect);
    
    if (!randomCorrect) {
      if (targetPose === "Pranamasana") {
        corrections.push("Bring palms closer together");
      } else if (targetPose === "Kumbhakasana") {
        corrections.push("Keep body straight - avoid sagging");
      } else if (targetPose === "Bhujangasana") {
        corrections.push("Lift chest higher");
      }
    }
    
    setFeedback(corrections);
    
    // Progress tracking
    if (randomCorrect) {
      setHoldFrames(prev => {
        const newValue = prev + 1;
        const progressPercent = Math.min((newValue / 30) * 100, 100);
        setProgress(progressPercent);
        
        if (newValue >= 30 && currentPose < POSE_ORDER.length - 1) {
          // Move to next pose
          setTimeout(() => {
            setCurrentPose(prev => prev + 1);
            setHoldFrames(0);
            setProgress(0);
          }, 500);
        }
        
        return newValue;
      });
    } else {
      setHoldFrames(0);
      setProgress(0);
    }
  };

  const targetPose = POSE_ORDER[currentPose];
  const isComplete = currentPose === POSE_ORDER.length - 1 && progress >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full text-white font-semibold hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-purple-300 text-sm">Pose Progress</div>
              <div className="text-white text-2xl font-bold">{currentPose + 1} / {POSE_ORDER.length}</div>
            </div>
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-green-500 p-3 rounded-full"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-black rounded-3xl overflow-hidden shadow-2xl"
          >
            <video
              ref={videoRef}
              className="absolute top-0 left-0 w-full h-full object-cover"
              style={{ display: 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="w-full h-auto"
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-xl">Initializing camera...</div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Current Pose */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-white text-xl font-bold">Current Pose</h2>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{targetPose}</h3>
            <p className="text-purple-200 text-sm">{POSE_DESCRIPTIONS[targetPose]}</p>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-200 text-sm">Hold Progress</span>
                <span className="text-white font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-3xl p-6 border ${
              isCorrect
                ? 'bg-green-500/20 border-green-400/50'
                : 'bg-orange-500/20 border-orange-400/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <h3 className="text-green-400 font-bold text-lg">Great Form!</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                  <h3 className="text-orange-400 font-bold text-lg">Adjust Position</h3>
                </>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {feedback.length > 0 ? (
                <motion.ul
                  key="feedback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {feedback.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-white text-sm flex items-start gap-2"
                    >
                      <span className="text-orange-400 mt-1">•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p
                  key="no-feedback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-white text-sm"
                >
                  Perfect! Hold this position...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Completion Badge */}
          {isComplete && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 text-center"
            >
              <Trophy className="w-16 h-16 text-white mx-auto mb-3" />
              <h3 className="text-white text-2xl font-bold mb-2">Sequence Complete!</h3>
              <p className="text-white/90">Amazing work on your Suryanamaskara</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
