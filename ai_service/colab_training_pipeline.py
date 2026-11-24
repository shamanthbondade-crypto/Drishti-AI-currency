"""
=============================================================================
DRISHTI AI - GOOGLE COLAB TRAINING PIPELINE
=============================================================================
Target: Indian Rupee Currency Banknote Classification
Classes (6): ['10', '20', '50', '100', '200', '500']
Architecture: MobileNetV2 / Custom CNN with Data Augmentation
Author: Drishti AI Engineering Team

Instructions for Google Colab:
1. Open https://colab.research.google.com
2. Set Runtime > Change runtime type > GPU (T4 GPU recommended)
3. Upload your Indian Currency Dataset or mount Google Drive:
   drive.mount('/content/drive')
4. Run this script to train, evaluate, and save the model as 'currency_cnn_model.keras'.
5. Download 'currency_cnn_model.keras' and place in 'ai_service/models/'.
=============================================================================
"""

import os
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import matplotlib.pyplot as plt

# 1. Hyperparameters & Configuration
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 25
NUM_CLASSES = 6
CLASSES = ['10', '20', '50', '100', '200', '500']
DATASET_DIR = '/content/dataset'  # Update with your dataset path

print(f"TensorFlow Version: {tf.__version__}")
print(f"GPU Available: {len(tf.config.list_physical_devices('GPU')) > 0}")

# 2. Data Loading & Splitting
def load_data(data_dir):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="training",
        seed=1337,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset="validation",
        seed=1337,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical'
    )
    return train_ds, val_ds

# 3. Data Augmentation Pipeline
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.15),
    layers.RandomZoom(0.15),
    layers.RandomContrast(0.1),
    layers.RandomBrightness(0.1),
], name="data_augmentation")

# 4. Model Architecture (Transfer Learning with MobileNetV2)
def build_model():
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False  # Freeze base feature extractor

    inputs = keras.Input(shape=(224, 224, 3))
    x = data_augmentation(inputs)
    # MobileNetV2 expects [-1, 1] input range
    x = layers.Rescaling(1.0 / 127.5, offset=-1.0)(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(NUM_CLASSES, activation='softmax')(x)

    model = keras.Model(inputs, outputs, name="drishti_currency_mobilenetv2")
    return model, base_model

# 5. Training Loop
def train(model, base_model, train_ds, val_ds):
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    callbacks = [
        keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
        keras.callbacks.ModelCheckpoint("currency_cnn_model.keras", save_best_only=True),
        keras.callbacks.ReduceLROnPlateau(factor=0.2, patience=2)
    ]

    print("\n--- Phase 1: Training Classification Head ---")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=15,
        callbacks=callbacks
    )

    print("\n--- Phase 2: Fine-Tuning Top Layers ---")
    base_model.trainable = True
    # Freeze bottom layers, fine-tune top 30 layers
    for layer in base_model.layers[:-30]:
        layer.trainable = False

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    history_fine = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        callbacks=callbacks
    )

    return model

if __name__ == "__main__":
    if os.path.exists(DATASET_DIR):
        train_ds, val_ds = load_data(DATASET_DIR)
        model, base_model = build_model()
        trained_model = train(model, base_model, train_ds, val_ds)
        trained_model.save("currency_cnn_model.keras")
        print("\nSUCCESS! Model saved as 'currency_cnn_model.keras'.")
    else:
        print(f"Please prepare your dataset in '{DATASET_DIR}' with subfolders: 10, 20, 50, 100, 200, 500.")
