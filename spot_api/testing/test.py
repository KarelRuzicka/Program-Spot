import math

x = 0
y = 0

dx = 10
dy = -10
yaw = math.radians(270)

# -yaw??
       
x_new = x + dx * math.cos(yaw) - dy * math.sin(yaw)
y_new = y + dx * math.sin(yaw) + dy * math.cos(yaw)

# Round to four decimal places
x_new = round(x_new, 4)
y_new = round(y_new, 4)

print(x_new, y_new)