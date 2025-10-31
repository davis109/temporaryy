# Suryanamaskara Pose Detection System - Setup Guide

## ✅ Directory Paths Updated

All hardcoded directory paths have been updated to use relative paths based on the current file location. The project will now work on your system.

## 📁 Project Structure

Your project should have the following structure:
```
Suryanamaskara-Pose-Detection-and-Correction-System-main/
├── train/              # Training dataset (organized by pose folders)
├── valid/              # Validation dataset (organized by pose folders)
├── test/               # Test dataset (organized by pose folders)
├── models/             # Saved model files (created automatically)
├── organize_dataset.py # Step 1: Organize your dataset from COCO format
├── extract_landmarks.py # Step 2: Extract landmarks from images
├── compute_reference_keypoints.py # Step 3: Compute reference keypoints
├── train_pose_model.py # Step 4: Train the pose classifier model
├── correc.py          # ⭐ DETECTION + CORRECTION system
├── real_ex.py         # ⭐ DETECTION ONLY system
├── pose_landmarks.csv # Generated landmarks data
├── reference_keypoints.pkl # Reference pose keypoints
└── pose_classifier_rf.pkl # Trained model
```

## 🎯 Main Scripts

### 1. **correc.py** - Detection + Correction System
- **Purpose**: Real-time pose detection AND correction feedback
- **Features**:
  - Detects which Suryanamaskara pose you're performing
  - Provides real-time correction feedback if your pose is incorrect
  - Guides you through the complete Suryanamaskara sequence (12 poses)
  - Shows angle measurements and alignment suggestions
- **Use Case**: For yoga practice with guidance and corrections
- **Output**: 
  - Live video with pose detection
  - On-screen correction messages
  - Progress through pose sequence

### 2. **real_ex.py** - Detection Only System
- **Purpose**: Real-time pose detection without corrections
- **Features**:
  - Detects which Suryanamaskara pose you're performing
  - Simpler sequence (8 poses instead of 12)
  - No correction feedback - just identifies poses
  - Highlights key joints
- **Use Case**: For pose recognition testing or simple pose tracking
- **Output**:
  - Live video with pose detection
  - Pose name display
  - Joint highlighting

## 🚀 Setup Steps

### 1. Install Required Packages
```bash
pip install opencv-python mediapipe numpy pandas scikit-learn joblib
```

### 2. Prepare Your Dataset
Place your dataset images in the following structure:
```
train/
  pranamasana/
  hasta_utthanasana/
  padahastasana/
  ...
valid/
  pranamasana/
  ...
test/
  pranamasana/
  ...
```

### 3. Run the Training Pipeline (in order)
```bash
# If you have COCO format annotations, organize first:
python organize_dataset.py

# Extract landmarks from all images:
python extract_landmarks.py

# Compute reference keypoints:
python compute_reference_keypoints.py

# Train the model:
python train_pose_model.py
```

### 4. Run the Detection Systems

**For Detection + Correction:**
```bash
python correc.py
```

**For Detection Only:**
```bash
python real_ex.py
```

## 📝 Changes Made

All files have been updated with the following changes:

1. **compute_reference_keypoints.py**
   - ✅ Changed from hardcoded path to relative path using `os.path.join(HERE, "train")`
   - ✅ Output file now uses relative path

2. **extract_landmarks.py**
   - ✅ Changed from hardcoded `BASE_PATH` to use current directory
   - ✅ CSV output path now uses `os.path.join()`

3. **organize_dataset.py**
   - ✅ Changed from hardcoded `base_dir` to use current directory

4. **train_pose_model.py**
   - ✅ CSV input path now uses relative path
   - ✅ Model saves to both `models/` directory and root for compatibility

5. **correc.py** & **real_ex.py**
   - ✅ Already using relative paths (no changes needed)

## 🎮 Usage Instructions

### Camera Controls
- **ESC or Q**: Quit the application
- Camera needs to be connected and accessible

### Pose Sequence (correc.py - 12 poses)
1. Pranamasana
2. Hasta Utthanasana
3. Padahastasana
4. Ashwa Sanchalanasana
5. Kumbhakasana
6. Ashtanga Namaskara
7. Bhujangasana
8. Adho Mukh Svanasana
9. Ashwa Sanchalanasana
10. Padahastasana
11. Hasta Utthanasana
12. Pranamasana

### Pose Sequence (real_ex.py - 8 poses)
1. Pranamasana
2. Hasta Utthanasana
3. Padahastasana
4. Ashwa Sanchalanasana
5. Kumbhakasana
6. Ashtanga Namaskara
7. Bhujangasana
8. Adho Mukh Svanasana

## 🔧 Troubleshooting

1. **"Model file not found"**: Make sure you've run `train_pose_model.py` first
2. **"CSV file not found"**: Make sure you've run `extract_landmarks.py` first
3. **"No dataset found"**: Check that your train/valid/test folders exist and contain images
4. **Camera issues**: Ensure your webcam is connected and not being used by another application
5. **Import errors**: Install all required packages with pip

## 💡 Tips

- Ensure good lighting for better pose detection
- Stand at an appropriate distance from the camera (full body visible)
- The correction system (correc.py) requires you to hold each pose for a few seconds
- Practice with detection-only mode (real_ex.py) first to get familiar with the system

---
**Updated on**: October 30, 2025
**All directory paths**: Now using relative paths for portability
