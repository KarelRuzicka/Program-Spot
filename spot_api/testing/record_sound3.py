import threading
import speech_recognition as sr
import concurrent.futures
import queue
from pydub import AudioSegment
from pydub.playback import play
import io

# Initialize recognizer class (for recognizing the speech)
r = sr.Recognizer()

# Shared queue for communication between threads
q = queue.Queue()

# Buffers to store the last two audio samples
buffer1 = buffer2 = sr.AudioData(b'', 16000, 2)



with sr.Microphone() as source:
    while True:
        print("Listening...")
        # Listen to the audio for a limited time
        audio = r.record(source, duration=2)
        # Append the buffers to the audio data
        
        # 2 current seconds + 4 previous seconds
        q.put(sr.AudioData(buffer1.get_raw_data(16000, 2) + buffer2.get_raw_data(16000, 2) + audio.get_raw_data(16000, 2) , 16000, 2))
        # Update the buffers
    
        buffer1, buffer2 = buffer2, audio
        
        if not q.empty():
            print("Playing...")
            audio = q.get()
            audio_segment = AudioSegment.from_wav(io.BytesIO(audio.get_wav_data()))
            play(audio_segment)