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




def listen():
    global buffer1, buffer2
    print("Listening thread started")
    with sr.Microphone() as source:
        while True:
            print("Listening...")
            # Listen to the audio for a limited time
            audio = r.record(source, duration=2)
            
            print("Stop..")
            # Append the buffers to the audio data
            #audio = sr.AudioData(buffer1.frame_data + buffer2.frame_data + audio.frame_data, 16000, 2)
            q.put(audio)
            # Update the buffers
            buffer1, buffer2 = buffer2, audio
            
     
        
def process():
    while True:
        if not q.empty():
            print("Playing...")
            audio = q.get()
            audio_segment = AudioSegment.from_wav(io.BytesIO(audio.get_wav_data()))
            play(audio_segment)

def recognize_and_process():
    while True:
        if not q.empty():
            audio = q.get()
            
            audio_segment = AudioSegment.from_wav(io.BytesIO(audio.get_wav_data()))
            play(audio_segment)
            try:
                # Using google speech recognition
                text = r.recognize_google(audio, language='cs-CZ')
                print("You said : {}".format(text))
            except Exception as e:
                print("Sorry, I did not get that: {}".format(e))


listen_thread = threading.Thread(target=listen)
process_thread = threading.Thread(target=process)

listen_thread.start()
process_thread.start()

listen_thread.join()
process_thread.join()