

import speech_recognition as sr
# Initialize recognizer class (for recognizing the speech)
r = sr.Recognizer()


with sr.Microphone() as source:
    while True:  
        print("Listening...")
        # Listen to the audio
        audio = r.listen(source)
        
        try:
            # Using google speech recognition
            print("Recognizing...")
            text = r.recognize_google(audio, language='cs-CZ')
            print("You said : {}".format(text))
            
        except Exception as e:
            print("Sorry, I did not get that")