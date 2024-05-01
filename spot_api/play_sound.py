from pydub import AudioSegment
from pydub.playback import play


directory = "sounds/"

class PlaySound:

    def play(self, file, extension = "wav"):

        song = AudioSegment.from_mp3(directory + file +"." + extension)
        
        play(song)
        


