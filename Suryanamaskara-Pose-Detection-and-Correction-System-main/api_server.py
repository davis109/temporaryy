"""
Flask API server for Suryanamaskara Pose Detection
Serves predictions from the trained model to the Next.js frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import joblib
import base64
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Get the directory where this script is located
HERE = os.path.dirname(os.path.abspath(__file__))

# Load trained model and reference keypoints
model = joblib.load(os.path.join(HERE, 'pose_classifier_rf.pkl'))
reference_keypoints = joblib.load(os.path.join(HERE, 'reference_keypoints.pkl'))

# Initialize MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Pose order for Suryanamaskara
POSE_ORDER = [
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
]

# Angle-based corrections dictionary (from correc.py)
POSE_CORRECTIONS_ANGLES = {
    "pranamasana": {
        "elbow_angle": (170, 190, "Keep arms straight together"),
    },
    "hasta_utthanasana": {
        "elbow_angle": (170, 190, "Arms straight up"),
        "back_angle": (190, 230, "Arch back slightly"),
    },
    "padahastasana": {
        "hip_angle": (50, 100, "Bend forward fully"),
    },
    "ashwa_sanchalanasana": {
        "front_knee": (80, 100, "Bend front knee to ~90°"),
        "back_leg": (160, 190, "Keep back leg straight"),
    },
    "kumbhakasana": {
        "body_line": (160, 180, "Keep body straight like plank"),
    },
    "ashtanga_namaskara": {
        "elbow_angle": (80, 110, "Bend elbows ~90°"),
    },
    "bhujangasana": {
        "back_angle": (90, 120, "Lift chest higher"),
        "elbow_angle": (160, 190, "Keep arms straight"),
    },
    "adho_mukh_svanasana": {
        "hip_angle": (70, 110, "Push hips up to form inverted V"),
    },
}

# Basic descriptions for fallback
POSE_CORRECTIONS = {
    "Pranamasana": {
        "description": "Prayer Pose - Stand with palms together at chest",
        "corrections": [
            "Keep your palms together at chest level",
            "Stand straight with feet together",
            "Relax your shoulders"
        ]
    },
    "Hasta Utthanasana": {
        "description": "Raised Arms - Arms up, arch back slightly",
        "corrections": [
            "Raise arms straight up",
            "Arch your back slightly",
            "Look up at your hands"
        ]
    },
    "Padahastasana": {
        "description": "Forward Bend - Touch toes, bend forward",
        "corrections": [
            "Bend forward from the hips",
            "Try to touch your toes",
            "Keep your legs straight"
        ]
    },
    "Ashwa Sanchalanasana": {
        "description": "Lunge - One leg back, knee down",
        "corrections": [
            "Step one leg back",
            "Keep front knee at 90 degrees",
            "Look up and arch your back"
        ]
    },
    "Kumbhakasana": {
        "description": "Plank - Straight body like a plank",
        "corrections": [
            "Keep body straight like a plank",
            "Don't let hips sag",
            "Engage your core"
        ]
    },
    "Ashtanga Namaskara": {
        "description": "Eight Point Pose - Chest and knees down",
        "corrections": [
            "Lower chest and knees to ground",
            "Keep hips raised",
            "Chin should touch the ground"
        ]
    },
    "Bhujangasana": {
        "description": "Cobra - Chest up, arms straight",
        "corrections": [
            "Lift chest up",
            "Keep elbows slightly bent",
            "Look upward"
        ]
    },
    "Adho Mukh Svanasana": {
        "description": "Downward Dog - Inverted V shape",
        "corrections": [
            "Form an inverted V shape",
            "Push hips up and back",
            "Keep heels down"
        ]
    }
}

def extract_features(landmarks):
    """Extract features from MediaPipe landmarks for model prediction"""
    if landmarks is None:
        return None
    
    features = []
    for landmark in landmarks.landmark:
        features.extend([landmark.x, landmark.y, landmark.z, landmark.visibility])
    
    return np.array(features).reshape(1, -1)

def calculate_angle(a, b, c):
    """Calculate angle between three points (from correc.py)"""
    a = np.array([a.x, a.y])
    b = np.array([b.x, b.y])
    c = np.array([c.x, c.y])
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    
    return angle

def check_pose_corrections(pose_name, landmarks):
    """
    Check angle-based corrections for a pose (from correc.py)
    Returns list of correction feedback messages
    """
    pose_name_norm = pose_name.lower().replace(" ", "_")
    
    if pose_name_norm not in POSE_CORRECTIONS_ANGLES:
        return []
    
    feedback = []
    lm = landmarks.landmark
    
    for check, (low, high, message) in POSE_CORRECTIONS_ANGLES[pose_name_norm].items():
        angle = None
        
        try:
            if check == "elbow_angle":
                angle = calculate_angle(
                    lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value],
                    lm[mp_pose.PoseLandmark.LEFT_ELBOW.value],
                    lm[mp_pose.PoseLandmark.LEFT_WRIST.value]
                )
            elif check == "front_knee":
                angle = calculate_angle(
                    lm[mp_pose.PoseLandmark.LEFT_HIP.value],
                    lm[mp_pose.PoseLandmark.LEFT_KNEE.value],
                    lm[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                )
            elif check == "hip_angle":
                angle = calculate_angle(
                    lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value],
                    lm[mp_pose.PoseLandmark.LEFT_HIP.value],
                    lm[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                )
            elif check == "back_angle":
                angle = calculate_angle(
                    lm[mp_pose.PoseLandmark.LEFT_HIP.value],
                    lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value],
                    lm[mp_pose.PoseLandmark.LEFT_WRIST.value]
                )
            elif check == "body_line":
                angle = calculate_angle(
                    lm[mp_pose.PoseLandmark.LEFT_SHOULDER.value],
                    lm[mp_pose.PoseLandmark.LEFT_HIP.value],
                    lm[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                )
            elif check == "back_leg":
                angle = calculate_angle(
                    lm[mp_pose.PoseLandmark.LEFT_HIP.value],
                    lm[mp_pose.PoseLandmark.LEFT_KNEE.value],
                    lm[mp_pose.PoseLandmark.LEFT_ANKLE.value]
                )
            
            if angle is not None:
                if not (low <= angle <= high):
                    feedback.append(f"{message} (angle: {int(angle)}°)")
        except Exception as e:
            print(f"Error calculating {check}: {e}")
            continue
    
    return feedback


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'mediapipe_ready': pose is not None
    })

@app.route('/api/predict', methods=['POST'])
def predict_pose():
    """
    Predict pose from image frame
    Expects: { "image": "base64_encoded_image_string" }
    Returns: { "pose": "Pranamasana", "confidence": 0.95, "corrections": [...] }
    """
    try:
        data = request.json
        
        # Decode base64 image
        image_str = data['image']
        # Remove data URL prefix if present
        if ',' in image_str:
            image_str = image_str.split(',')[1]
        
        image_data = base64.b64decode(image_str)
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({
                'success': False,
                'message': 'Failed to decode image',
                'pose': None
            }), 400
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = pose.process(frame_rgb)
        
        if not results.pose_landmarks:
            return jsonify({
                'success': False,
                'message': 'No pose detected',
                'pose': 'Unknown'
            })
        
        # Extract features
        features = extract_features(results.pose_landmarks)
        
        if features is None:
            return jsonify({
                'success': False,
                'message': 'Could not extract features',
                'pose': 'Unknown'
            })
        
        # Predict pose
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        raw_confidence = float(np.max(probabilities))
        
        # Boost confidence to make it more lenient (scale from 0.3-1.0 to 0.6-1.0)
        # Formula: new_conf = 0.6 + (raw_conf * 0.4)
        # This ensures minimum 60% confidence and scales up from there
        confidence = min(0.6 + (raw_confidence * 0.55), 0.99)
        
        # Model returns the pose name directly (string)
        pose_name = str(prediction).lower()  # Keep lowercase for matching
        
        # Capitalize for display
        pose_name_display = " ".join(word.capitalize() for word in pose_name.split())
        
        # Get angle-based corrections from correc.py logic
        angle_corrections = check_pose_corrections(pose_name, results.pose_landmarks)
        
        # Get basic corrections as fallback
        corrections_info = POSE_CORRECTIONS.get(pose_name_display, {})
        basic_corrections = corrections_info.get('corrections', [])
        
        # Use angle corrections if available, otherwise use basic corrections
        final_corrections = angle_corrections if angle_corrections else basic_corrections
        
        # Add "Good alignment" message if no corrections needed
        if not angle_corrections and pose_name:
            alignment_status = "✔ Good Alignment"
        else:
            alignment_status = "Adjust your pose"
        
        # Calculate some angles for feedback (example)
        landmarks = results.pose_landmarks.landmark
        
        return jsonify({
            'success': True,
            'pose': pose_name,  # lowercase for matching
            'pose_display': pose_name_display,
            'confidence': confidence,
            'description': corrections_info.get('description', ''),
            'corrections': final_corrections,
            'alignment_status': alignment_status,
            'has_angle_corrections': len(angle_corrections) > 0,
            'landmarks': [[lm.x, lm.y, lm.z, lm.visibility] for lm in landmarks]
        })
        
    except Exception as e:
        print(f"ERROR in predict_pose: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': str(e),
            'pose': 'Unknown'
        }), 500

@app.route('/api/poses', methods=['GET'])
def get_poses():
    """Get list of all poses in the sequence"""
    return jsonify({
        'poses': POSE_ORDER,
        'total': len(POSE_ORDER)
    })

@app.route('/api/start-correc', methods=['POST'])
def start_correc():
    """
    Launch the correc.py script (Advanced Correction System)
    This runs the original correction system with OpenCV window
    """
    try:
        import subprocess
        import sys
        
        correc_path = os.path.join(HERE, 'correc.py')
        bat_file = os.path.join(HERE, 'run_correc.bat')
        
        if not os.path.exists(correc_path):
            return jsonify({
                'success': False,
                'message': f'correc.py not found at {correc_path}'
            }), 404
        
        # For Windows, just launch the batch file - SIMPLEST METHOD
        if os.name == 'nt':
            # Double-click the batch file
            os.startfile(bat_file)
            pid = "Windows batch"
        else:
            # For Unix-like systems
            python_exe = sys.executable
            process = subprocess.Popen(
                [python_exe, correc_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            pid = process.pid
        
        return jsonify({
            'success': True,
            'message': '🎯 Advanced Correction System launched!',
            'pid': pid,
            'note': 'A new window should open. Press Q in the OpenCV window to exit.',
            'python_used': sys.executable
        })
        
    except Exception as e:
        print(f"ERROR starting correc.py: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Suryanamaskara Pose Detection API Server...")
    print("📊 Model loaded successfully!")
    print("🎯 Server running on http://localhost:5000")
    print("\n📝 Available endpoints:")
    print("   GET  /api/health       - Health check")
    print("   POST /api/predict      - Predict pose from image")
    print("   GET  /api/poses        - Get all poses in sequence")
    print("   POST /api/start-correc - Launch Advanced Correction System (correc.py)")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
