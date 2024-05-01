from vosk import Model, KaldiRecognizer
import wave
import pyaudio


# Load model
model = Model("sound_models/vosk-model-small-cs-0.4-rhasspy")

# Create recognizer
rec = KaldiRecognizer(model, 16000)

# Load audio file
# wf = wave.open("rec2.wav", "rb")
# data = wf.readframes(16000)

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=8000)

# Perform speech recognition
while True:
    data = stream.read(4000)
    if rec.AcceptWaveform(data):
        print(rec.Result())