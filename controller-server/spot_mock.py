import time

class SpotMock:
    
    def activate(self) -> bool:
        time.sleep(0.1)
        return True
    
    def deactivate(self) -> bool:
        time.sleep(0.1)
        return True
    
    def get_obstacle_front(self) -> int:
        time.sleep(0.2)
        return 6
    
    def move_to(self, x:int, y:int) -> bool:
        time.sleep(3)
        return x+y