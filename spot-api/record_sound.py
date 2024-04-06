import threading
import speech_recognition as sr
import queue
import time




class RecordSound:
    
    def __init__(self):
        self.r = sr.Recognizer()
        self.q = queue.Queue()
        self.buffer1 = sr.AudioData(b'', 16000, 2)
        self.previously_heard = []
        
        
        
        self.words = {}
        
        listen_thread = threading.Thread(target=self.listen)
        process_thread = threading.Thread(target=self.recognize_and_process)

        listen_thread.start()
        process_thread.start()

    def listen(self):

        with sr.Microphone() as source:
            print("Sound listening started")
            while True:

                audio = self.r.record(source, duration=2)
                
                # 2 current secs + past 4 secs
                self.q.put(sr.AudioData(self.buffer1.get_raw_data(16000, 2) + audio.get_raw_data(16000, 2) , 16000, 2))

                self.buffer1 = audio

    def recognize_and_process(self):
        while True:
            if not self.q.empty():
                audio = self.q.get()
                try:
                    # Using google speech recognition
                    text = self.r.recognize_google(audio, language='cs-CZ')
                    
                    newly_heard = []
                    for word in text.split(" "):
                        word = word.lower()
                        # Dont add duplicite words from the same sample
                        if word not in self.previously_heard:
                            self.words[word] = time.time()
                            newly_heard.append(word)
                            
                    self.previously_heard = newly_heard
                        
                except Exception as e:
                    pass
                    
                current_time = time.time()
                #print(self.words)         
                self.words = {word: added_time for word, added_time in self.words.items() if current_time - added_time <= 5}

    def heard_words(self, phrase):
        
        for heard_word in phrase.split(" "):
            if heard_word not in self.words:
                return False
            else:
                #remove word
                self.words = {word: added_time for word, added_time in self.words.items() if word != heard_word}
        
        return True
    