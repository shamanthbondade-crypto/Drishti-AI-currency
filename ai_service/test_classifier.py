"""
DRISHTI AI - Currency Classifier Test
Tests chromatic and feature recognition across all 6 Indian Rupee banknotes.
"""
import numpy as np
import cv2

DENOMINATION_PROFILES = {
    '₹10': {
        'name': 'Ten Rupees',
        'hue_range': (8, 20),      # OpenCV Hue: 0-180 (corresponds to 16°-40° Chocolate Brown)
        'sat_range': (40, 160),
        'val_range': (50, 180),
        'weight': 1.0,
    },
    '₹20': {
        'name': 'Twenty Rupees',
        'hue_range': (24, 44),     # Greenish-Yellow (48°-88°)
        'sat_range': (60, 210),
        'val_range': (90, 240),
        'weight': 1.0,
    },
    '₹50': {
        'name': 'Fifty Rupees',
        'hue_range': (85, 110),    # Fluorescent Blue / Cyan (170°-220°)
        'sat_range': (70, 240),
        'val_range': (100, 255),
        'weight': 1.1,
    },
    '₹100': {
        'name': 'One Hundred Rupees',
        'hue_range': (120, 150),   # Lavender / Violet (240°-300°)
        'sat_range': (35, 170),
        'val_range': (90, 230),
        'weight': 1.1,
    },
    '₹200': {
        'name': 'Two Hundred Rupees',
        'hue_range': (12, 24),     # Bright Orange-Yellow (24°-48°)
        'sat_range': (130, 255),   # High saturation
        'val_range': (160, 255),   # High brightness
        'weight': 1.05,
    },
    '₹500': {
        'name': 'Five Hundred Rupees',
        'hue_range': (0, 180),     # Any hue
        'sat_range': (0, 48),      # Distinctive very low saturation (Stone Grey)
        'val_range': (70, 180),    # Slate grey lightness
        'weight': 1.0,
    },
}

def classify_banknote_image(img_bgr: np.ndarray):
    if img_bgr is None or img_bgr.size == 0:
        return {'denomination': 'uncertain', 'confidence': 0.0, 'is_uncertain': True}

    h, w = img_bgr.shape[:2]

    # Crop central region (70%) to avoid background interference
    y_start, y_end = int(h * 0.15), int(h * 0.85)
    x_start, x_end = int(w * 0.15), int(w * 0.85)
    crop = img_bgr[y_start:y_end, x_start:x_end]
    if crop.size == 0:
        crop = img_bgr

    # Convert to HSV
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    H, S, V = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

    mean_s = np.mean(S)
    mean_v = np.mean(V)

    # Check for blank / too dark / washed out image
    if mean_v < 30:
        return {'denomination': 'uncertain', 'confidence': 0.15, 'is_uncertain': True, 'reason': 'Too dark'}
    if mean_v > 245 and mean_s < 15:
        return {'denomination': 'uncertain', 'confidence': 0.20, 'is_uncertain': True, 'reason': 'Overexposed/blank'}

    scores = {}

    for denom, prof in DENOMINATION_PROFILES.items():
        if denom == '₹500':
            # Stone Grey: high match if saturation is very low and lightness is neutral
            grey_mask = (S <= prof['sat_range'][1]) & (V >= prof['val_range'][0]) & (V <= prof['val_range'][1])
            match_ratio = np.count_nonzero(grey_mask) / grey_mask.size
            scores[denom] = match_ratio * 1.3
        else:
            h_min, h_max = prof['hue_range']
            s_min, s_max = prof['sat_range']
            v_min, v_max = prof['val_range']

            mask = (H >= h_min) & (H <= h_max) & (S >= s_min) & (S <= s_max) & (V >= v_min) & (V <= v_max)
            match_ratio = np.count_nonzero(mask) / mask.size
            scores[denom] = match_ratio * prof['weight']

    total_score = sum(scores.values()) + 1e-6
    probs = {d: round(s / total_score, 4) for d, s in scores.items()}

    best_denom = max(scores, key=scores.get)
    best_score = scores[best_denom]

    # Convert match score to calibrated confidence
    confidence = min(0.98, max(0.40, best_score * 2.2))

    is_uncertain = best_score < 0.15 or confidence < 0.50

    return {
        'denomination': 'uncertain' if is_uncertain else best_denom,
        'confidence': round(float(confidence), 3),
        'is_uncertain': is_uncertain,
        'probabilities': probs,
    }

# Test synthetic colors for each banknote
test_colors = {
    '₹10': (60, 95, 145),      # BGR for chocolate brown
    '₹20': (70, 195, 185),     # BGR for greenish yellow
    '₹50': (230, 200, 80),     # BGR for fluorescent cyan
    '₹100': (210, 140, 160),   # BGR for lavender/purple
    '₹200': (40, 160, 240),    # BGR for bright orange
    '₹500': (135, 140, 130),   # BGR for stone grey
}

print("Running Synthetic Note Color Tests:")
for expected, bgr in test_colors.items():
    test_img = np.full((100, 200, 3), bgr, dtype=np.uint8)
    res = classify_banknote_image(test_img)
    print(f"Expected {expected} -> Got: {res['denomination']} (Confidence: {res['confidence']})")
    assert res['denomination'] == expected, f"Failed on {expected}"

print("\nAll 6 Denominations Tested Successfully!")
