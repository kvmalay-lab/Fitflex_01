"""
One-Euro Filter for smooth angle calculations.
Reduces jitter while preserving fast movements.
"""

import math


class OneEuroFilter:
    def __init__(self, freq=30.0, mincutoff=1.0, beta=0.0, dcutoff=1.0):
        self.freq = freq
        self.mincutoff = mincutoff
        self.beta = beta
        self.dcutoff = dcutoff
        self.last_value = None
        self.last_dx = 0.0

    def _alpha(self, cutoff):
        te = 1.0 / self.freq
        tau = 1.0 / (2 * math.pi * cutoff)
        return 1.0 / (1.0 + tau / te)

    def _low_pass_filter(self, value, last_value, cutoff):
        alpha = self._alpha(cutoff)
        return alpha * value + (1 - alpha) * last_value

    def filter(self, value):
        if self.last_value is None:
            self.last_value = value
            self.last_dx = 0.0
            return value
        dx = (value - self.last_value) * self.freq
        edx = self._low_pass_filter(dx, self.last_dx, self.dcutoff)
        cutoff = self.mincutoff + self.beta * abs(edx)
        self.last_value = self._low_pass_filter(value, self.last_value, cutoff)
        self.last_dx = edx
        return self.last_value

    def reset(self):
        self.last_value = None
        self.last_dx = 0.0
