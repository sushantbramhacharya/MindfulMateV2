from flask import Blueprint, request, jsonify
from app.config.JWTConfig import JWTConfig
import joblib
import datetime

prediction_bp = Blueprint('prediction', __name__)

# Load the pre-trained pipeline (vectorizer + SVC)
try:
    model = joblib.load('app/ml_model/svc_model.joblib')  # Your pipeline
    class_labels = ['Anxiety', 'Bipolar', 'Depression',
                    'Normal', 'Personality disorder',
                    'Stress', 'Suicidal']
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

# Define base messages
prediction_messages = {
    'Anxiety': 'It seems you might be experiencing some anxiety. Consider reaching out to a mental health professional for support.',
    'Bipolar': 'Your text suggests indicators of bipolar disorder. It\'s important to consult with a specialist for an accurate diagnosis and treatment plan.',
    'Depression': 'There are signs of depression in your text. Please consider seeking help from a therapist or doctor.',
    'Normal': 'Based on your input, your mental state appears to be within a typical range. Keep taking care of yourself!',
    'Personality disorder': 'Your text may indicate aspects of a personality disorder. A mental health expert can provide clarity and guidance.',
    'Stress': 'It looks like you might be under stress. Finding healthy coping mechanisms or seeking support could be beneficial.',
    'Suicidal': 'Your text contains concerning indicators related to suicidal thoughts. Please reach out for immediate help. You can call a crisis hotline or emergency services in your area. You are not alone.'
}

# General recommendations
general_recommendations_text = {
    'music': 'Listening to music can influence mood and provide comfort.',
    'meditation': 'Practicing mindfulness or meditation can help with self-awareness and emotional regulation.',
    'physical_exercise': 'Engaging in physical activity, even light movement, can positively impact mental well-being.',
    'breathing_exercise': 'Simple breathing exercises can help calm the nervous system and reduce immediate distress.'
}

# Category-specific overrides
category_specific_recommendations_text = {
    'Anxiety': {
        'music': 'Specifically, calming music can help soothe your nerves.',
        'meditation': 'Mindfulness meditation can be very effective in managing anxious thoughts.',
        'physical_exercise': 'Light physical exercise, like walking or yoga, can effectively reduce anxiety.',
        'breathing_exercise': 'Try deep breathing exercises, such as 4-7-8 breathing, to calm your mind and body.'
    },
    'Depression': {
        'music': 'Uplifting or inspiring music might help improve your mood.',
        'meditation': 'Guided meditation focusing on self-compassion and acceptance can be beneficial.',
        'physical_exercise': 'Regular physical activity, even short walks outdoors, can significantly boost mood and energy.',
        'breathing_exercise': 'Controlled breathing can help regulate emotions and reduce feelings of overwhelm, offering a sense of control.'
    },
    'Stress': {
        'music': 'Relaxing music is excellent for alleviating tension and promoting calmness.',
        'meditation': 'Short meditation sessions can help clear your mind and effectively reduce stress.',
        'physical_exercise': 'Vigorous physical activity is a great way to relieve stress and release pent-up tension.',
        'breathing_exercise': 'Practice slow, deep breathing to activate your body\'s natural relaxation response and manage stress.'
    },
    'Normal': {
        'music': 'Continue enjoying music to maintain a positive outlook and enhance daily activities.',
        'meditation': 'Regular meditation can help maintain mental clarity, improve focus, and prevent future stress.',
        'physical_exercise': 'Keep up with your physical exercise routines for continued overall well-being and energy.',
        'breathing_exercise': 'Continue practicing breathing exercises to enhance focus, deepen relaxation, and improve resilience.'
    },
    'Bipolar': {
        'overall_note': 'These general well-being practices might be helpful as part of a broader treatment plan. Always discuss any new activities with your mental health professional.'
    },
    'Personality disorder': {
        'overall_note': 'These general well-being practices might offer complementary support. It is crucial to engage in these under the guidance of your mental health professional.'
    },
    'Suicidal': {
        'overall_note': 'While these activities can support general well-being, immediate professional intervention is paramount. Please prioritize connecting with help lines or emergency services. Any engagement with these practices should be discussed with a professional.'
    }
}

# Button list
standard_buttons = [
    {"label": "Music", "type": "music"},
    {"label": "Meditation", "type": "meditation"},
    {"label": "Exercise", "type": "exercise"},
    {"label": "Breathing", "type": "breathing"},
]

category_buttons_mapping = {
    label: standard_buttons for label in class_labels
}

@prediction_bp.route('/predict', methods=['POST'])
@JWTConfig.token_required
def predict_mental_health(current_user):
    if not model:
        return jsonify({'error': 'Model not loaded'}), 503

    data = request.get_json()
    input_text = data.get('text')

    if not input_text or not isinstance(input_text, str):
        return jsonify({'error': 'Valid text input is required'}), 400

    try:
        response_label = model.predict([input_text])
        predicted_label = response_label[0] if response_label else 'Unknown'

        # Base message
        base_message = prediction_messages.get(predicted_label, 'We processed your text, but could not provide a specific mental health assessment. Please consult a professional.')

        # Build recommendations section in Markdown
        recommendations_md = []
        category_overrides = category_specific_recommendations_text.get(predicted_label, {})

        if 'overall_note' in category_overrides:
            recommendations_md.append(f"⚠️ *{category_overrides['overall_note']}*\n")

        recommendations_md.append("**You might also find these general well-being practices helpful:**\n")

        for key, default_text in general_recommendations_text.items():
            rec_text = category_overrides.get(key, default_text)
            recommendations_md.append(f"- **{key.replace('_', ' ').title()}**: {rec_text}")

        # Combine base and recommendations
        final_message = f"{base_message}\n\n" + "\n".join(recommendations_md)

        buttons_to_send = category_buttons_mapping.get(predicted_label, [])

        return jsonify({
            'prediction': predicted_label,
            'message': final_message,
            'recommendation_buttons': buttons_to_send
        }), 200

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500
