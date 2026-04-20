from .bicep_curl import BicepCurl
from .lat_pulldown import LatPulldown
from .squat import Squat
from .shoulder_press import ShoulderPress
from .deadlift import Deadlift
from .plank import Plank

EXERCISE_CLASSES = {
    "bicep_curl": BicepCurl,
    "lat_pulldown": LatPulldown,
    "squat": Squat,
    "shoulder_press": ShoulderPress,
    "deadlift": Deadlift,
    "plank": Plank,
}
