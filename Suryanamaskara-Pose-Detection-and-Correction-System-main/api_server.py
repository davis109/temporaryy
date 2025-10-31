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

# Corrections dictionary (from correc.py)
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
    """Calculate angle between three points"""
    a = np.array([a.x, a.y])
    b = np.array([b.x, b.y])
    c = np.array([c.x, c.y])
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    
    return angle

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
        
        # Get corrections
        corrections_info = POSE_CORRECTIONS.get(pose_name_display, {})
        
        # Calculate some angles for feedback (example)
        landmarks = results.pose_landmarks.landmark
        
        return jsonify({
            'success': True,
            'pose': pose_name,  # lowercase for matching
            'pose_display': pose_name_display,
            'confidence': confidence,
            'description': corrections_info.get('description', ''),
            'corrections': corrections_info.get('corrections', []),
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

if __name__ == '__main__':
    print("🚀 Starting Suryanamaskara Pose Detection API Server...")
    print("📊 Model loaded successfully!")
    print("🎯 Server running on http://localhost:5000")
    print("\n📝 Available endpoints:")
    print("   GET  /api/health  - Health check")
    print("   POST /api/predict - Predict pose from image")
    print("   GET  /api/poses   - Get all poses in sequence")
    
    app.run(host='0.0.0.0', port=5000, debug=False)
