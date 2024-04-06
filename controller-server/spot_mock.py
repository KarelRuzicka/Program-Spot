import time


import os   
import sys  
original_sys_path = sys.path.copy()
parent_dir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
sister_dir = os.path.join(parent_dir, 'spot-api')

sys.path.insert(0, sister_dir)
from record_sound import RecordSound
from play_sound import PlaySound
#sys.path = original_sys_path

class SpotMock:
    
    def __init__(self):
        self.record = RecordSound()
        self.play = PlaySound()
        
    
    def activate(self) -> bool:
        time.sleep(0.1)
        return True
    
    def deactivate(self) -> bool:
        time.sleep(0.1)
        return True
    
    def sit(self) -> bool:
        time.sleep(0.4)
        return True
    
    def stand(self) -> bool:
        time.sleep(0.4)
        return True
    
    def get_obstacle_distance(self, direction) -> int:
        time.sleep(0.2)
        return 6
    
    def move_to_absolute(self, x:int, y:int) -> bool:
        time.sleep(3)
        return True
    
    def make_sound(self, sound:str) -> bool:
        self.play.play(sound)
        return True
    
    def heard_phrase(self, phrase) -> bool:
        if self.record.heard_words(phrase):
            return '1'
        else:   
            return '0'
