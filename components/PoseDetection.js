'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Trophy, Zap, Camera as CameraIcon, BookOpen } from 'lucide-react';

const POSE_ORDER = [
  "pranamasana",
  "hasta utthanasana",
  "padahastasana",
  "ashwa sanchalanasana",
  "kumbhakasana",
  "ashtanga namaskara",
  "bhujangasana",
  "adho mukh svanasana",
  "ashwa sanchalanasana",
  "padahastasana",
  "hasta utthanasana",
  "pranamasana"
];

const POSE_DISPLAY_NAMES = {
  "pranamasana": "Pranamasana",
  "hasta utthanasana": "Hasta Utthanasana",
  "padahastasana": "Padahastasana",
  "ashwa sanchalanasana": "Ashwa Sanchalanasana",
  "kumbhakasana": "Kumbhakasana",
  "ashtanga namaskara": "Ashtanga Namaskara",
  "bhujangasana": "Bhujangasana",
  "adho mukh svanasana": "Adho Mukh Svanasana"
};

const POSE_DESCRIPTIONS = {
  "pranamasana": "Prayer Pose - Stand with palms together at chest",
  "hasta utthanasana": "Raised Arms - Arms up, arch back slightly",
  "padahastasana": "Forward Bend - Touch toes, bend forward",
  "ashwa sanchalanasana": "Lunge - One leg back, knee down",
  "kumbhakasana": "Plank - Straight body like a plank",
  "ashtanga namaskara": "Eight Point Pose - Chest and knees down",
  "bhujangasana": "Cobra - Chest up, arms straight",
  "adho mukh svanasana": "Downward Dog - Inverted V shape"
};

const API_URL = 'http://localhost:5000';

export default function PoseDetection({ onBack, learnMode = false, targetPose = null }) {
  const videoRef = useRef(null);
  const [currentPose, setCurrentPose] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [detectedPose, setDetectedPose] = useState('');
  const [confidence, setConfidence] = useState(0);
  const streamRef = useRef(null);
  const predictionIntervalRef = useRef(null);

  useEffect(() => {
    // Capture frame from video and send to API
    const captureAndPredict = async () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) return;

      try {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw mirrored video frame
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Convert to base64
        const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

        // Send to API
        const response = await fetch(`${API_URL}/api/predict`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Debug log
          
          // Check if API returned success
          if (!data.success || !data.pose || data.pose === 'Unknown') {
            setDetectedPose(null); // Clear pose display
            setConfidence(0); // Clear confidence
            setIsCorrect(false);
            setFeedback(['Stand in clear view of camera', 'Ensure good lighting', 'Position full body in frame']);
            return;
          }
          
          const predictedPose = data.pose.toLowerCase().trim();
          
          // In learn mode, use the target pose; otherwise use sequence
          const currentTargetPose = learnMode && targetPose 
            ? targetPose.toLowerCase().trim() 
            : POSE_ORDER[currentPose].toLowerCase().trim();
          
          const poseConfidence = data.confidence || 0;
          
          setDetectedPose(data.pose_display || data.pose);
          setConfidence(poseConfidence);
          
          console.log(`🎯 Predicted: "${predictedPose}" | Target: "${currentTargetPose}" | Conf: ${(poseConfidence * 100).toFixed(1)}% | Match: ${predictedPose === currentTargetPose} | Learn Mode: ${learnMode}`);
          
          // Check if predicted pose matches target
          const isMatch = predictedPose === currentTargetPose;
          setIsCorrect(isMatch);
          
          if (isMatch) {
            // ✅ CORRECT POSE - INSTANT PROGRESS!
            console.log('✅ MATCH! Increasing progress...');
            
            setProgress(prev => {
              const newProgress = Math.min(prev + 5, 100);
              console.log(`Progress: ${prev}% → ${newProgress}%`);
              
              if (newProgress >= 100) {
                // Move to next pose after completing current one
                if (currentPose < POSE_ORDER.length - 1) {
                  console.log('🎉 Pose complete! Moving to next...');
                  setTimeout(() => {
                    setCurrentPose(curr => curr + 1);
                    setProgress(0);
                    setFeedback([]);
                  }, 1000);
                }
                return 100;
              }
              
              return newProgress;
            });
            setFeedback(['✨ Perfect! Hold steady...']);
          } else {
            // ❌ Wrong pose
            console.log('❌ No match');
            const targetPoseDisplay = POSE_DISPLAY_NAMES[targetPose];
            const targetFeedback = [
              `You're doing ${data.pose_display || data.pose}`,
              `Please do ${targetPoseDisplay} instead`,
              POSE_DESCRIPTIONS[targetPose]
            ];
            setFeedback(targetFeedback);
          }
        } else {
          console.error('API error:', response.status);
          setDetectedPose(null); // Clear pose display
          setConfidence(0); // Clear confidence
          setFeedback(['Server error - check if Flask API is running']);
        }
      } catch (error) {
        console.error('Prediction error:', error);
        setDetectedPose(null); // Clear pose display
        setConfidence(0); // Clear confidence
        setFeedback(['Cannot connect to server', 'Make sure Flask API is running on port 5000']);
      }
    };

    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 1280, 
            height: 720,
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          streamRef.current = mediaStream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            setIsLoading(false);
            
            // Start prediction loop
            predictionIntervalRef.current = setInterval(() => {
              captureAndPredict();
            }, 500); // Predict every 500ms
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setFeedback(['Camera access denied. Please allow camera permissions.']);
        setIsLoading(false);
      }
    };

    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (predictionIntervalRef.current) {
        clearInterval(predictionIntervalRef.current);
      }
    };
  }, [currentPose, learnMode, targetPose]); // Re-run when currentPose, learnMode or targetPose changes

  const isComplete = currentPose === POSE_ORDER.length - 1 && progress >= 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 overflow-hidden">
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
            {!learnMode && (
              <>
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
              </>
            )}
            {learnMode && (
              <div className="text-right">
                <div className="text-purple-300 text-sm">Learn Mode</div>
                <div className="text-white text-2xl font-bold">Practice {targetPose && POSE_DISPLAY_NAMES[targetPose.toLowerCase()]}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Video Feed - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-black rounded-3xl overflow-hidden shadow-2xl h-[500px] lg:h-[700px] xl:h-[800px]"
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain transform scale-x-[-1]"
          />
            
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur">
              <div className="text-center">
                <CameraIcon className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
                <div className="text-white text-xl">Initializing camera...</div>
                <div className="text-purple-200 text-sm mt-2">Please allow camera access</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* No Pose Detected Message */}
        {!detectedPose && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-8 mb-6 border-2 border-yellow-400/50 shadow-2xl max-w-4xl mx-auto">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-white text-3xl font-bold mb-4">No Pose Detected</h2>
              <div className="space-y-2 text-purple-200">
                <p>• Stand in clear view of the camera</p>
                <p>• Ensure your full body is visible in the frame</p>
                <p>• Make sure there is good lighting</p>
                <p>• Position yourself 5-6 feet away from the camera</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Large Display Below Camera - Only when pose is detected */}
        {detectedPose && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            {/* Main Pose Display */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-8 mb-6 border-2 border-cyan-400/50 shadow-2xl max-w-6xl mx-auto">
              <p className="text-cyan-300 text-2xl mb-3 font-semibold">You&apos;re doing:</p>
              <h1 className="text-white text-6xl lg:text-8xl font-black mb-6">{detectedPose}</h1>
              
              {/* Accuracy Badge */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className={`${confidence >= 0.8 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} px-10 py-5 rounded-full shadow-lg`}>
                  <p className="text-white text-lg font-bold mb-1">Accuracy</p>
                  <p className="text-white text-5xl font-black">{(confidence * 100).toFixed(1)}%</p>
                </div>
                
                {confidence >= 0.8 ? (
                  <CheckCircle className="w-16 h-16 text-green-400" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-yellow-400" />
                )}
              </div>
              
              <p className="text-2xl font-bold">
                {confidence >= 0.9 ? '🔥 Excellent Form!' : confidence >= 0.8 ? '✨ Keep it up!' : '💪 Getting there!'}
              </p>
            </div>

            {/* Stats Grid */}
            {learnMode ? (
              // Learn Mode: Show only target pose info and steps
              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                    <p className="text-purple-300 text-sm mb-2 font-semibold">Target Pose</p>
                    <h2 className="text-white text-3xl font-bold">{targetPose && POSE_DISPLAY_NAMES[targetPose.toLowerCase()]}</h2>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                    <p className="text-purple-300 text-sm mb-2 font-semibold">Your Accuracy</p>
                    <div className="flex items-center justify-center gap-3">
                      <h2 className="text-white text-3xl font-bold">
                        {isCorrect ? (confidence * 100).toFixed(1) : '0.0'}%
                      </h2>
                      {isCorrect && confidence >= 0.8 ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* How to do this pose */}
                <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-indigo-400/50 shadow-2xl">
                  <h3 className="text-white text-2xl font-bold mb-4 flex items-center gap-3">
                    <BookOpen className="w-7 h-7 text-yellow-400" />
                    How to do {targetPose && POSE_DISPLAY_NAMES[targetPose.toLowerCase()]}
                  </h3>
                  <p className="text-purple-200 text-xl leading-relaxed">
                    {targetPose && POSE_DESCRIPTIONS[targetPose.toLowerCase()]}
                  </p>
                  <div className="mt-6 bg-white/10 rounded-xl p-4">
                    <p className="text-purple-300 text-sm font-semibold mb-2">💡 Tip:</p>
                    <p className="text-white">
                      {isCorrect 
                        ? 'Great job! Hold this pose steady to improve your accuracy score.' 
                        : 'Try to match the target pose description above. The AI will guide you!'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Practice Mode: Show full sequence stats
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                  <p className="text-purple-300 text-sm mb-2 font-semibold">Current Pose</p>
                  <h2 className="text-white text-3xl font-bold">{detectedPose}</h2>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                  <p className="text-purple-300 text-sm mb-2 font-semibold">Confidence Score</p>
                  <div className="flex items-center justify-center gap-3">
                    <h2 className="text-white text-3xl font-bold">{(confidence * 100).toFixed(1)}%</h2>
                    {confidence >= 0.8 ? (
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-yellow-400" />
                    )}
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                  <p className="text-purple-300 text-sm mb-2 font-semibold">Sequence Progress</p>
                  <h2 className="text-white text-3xl font-bold">{currentPose + 1} / {POSE_ORDER.length}</h2>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
