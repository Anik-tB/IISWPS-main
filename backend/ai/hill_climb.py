"""
Hill Climbing Algorithm
For machine safety parameter optimization
"""

import numpy as np
from typing import Dict, Tuple, Any
import random


class HillClimbingOptimizer:
    """Hill Climbing optimizer for machine safety parameters"""

    def __init__(self, max_iterations: int = 100, step_size: float = 0.5):
        """
        Initialize Hill Climbing optimizer

        Args:
            max_iterations: Maximum number of iterations
            step_size: Step size for parameter adjustments
        """
        self.max_iterations = max_iterations
        self.step_size = step_size
        self.random_state = random.Random(42)

    def safety_function(self, temperature: float, vibration: float, load: float) -> float:
        """
        Safety score function (higher is better)

        Optimal ranges:
        - Temperature: 65-75°F
        - Vibration: 2.0-3.5
        - Load: 0.4-0.6

        Args:
            temperature: Machine temperature
            vibration: Vibration level
            load: Load percentage

        Returns:
            Safety score (0.0 to 1.0)
        """
        # Normalize each parameter to 0-1 safety score
        # Temperature: optimal around 70°F
        temp_score = 1.0 - abs(temperature - 70) / 50.0
        temp_score = max(0.0, min(1.0, temp_score))

        # Vibration: optimal around 2.5
        vib_score = 1.0 - abs(vibration - 2.5) / 4.0
        vib_score = max(0.0, min(1.0, vib_score))

        # Load: optimal around 0.5
        load_score = 1.0 - abs(load - 0.5) / 0.5
        load_score = max(0.0, min(1.0, load_score))

        # Combined safety score (weighted average)
        safety_score = 0.4 * temp_score + 0.3 * vib_score + 0.3 * load_score

        return safety_score

    def optimize(self, initial_temp: float, initial_vib: float, initial_load: float,
                 constraints: Dict[str, Tuple[float, float]] = None,
                 track_history: bool = False) -> Tuple[Dict[str, float], float, Dict[str, Any]]:
        """
        Optimize machine parameters using Hill Climbing with constraints and history tracking

        Args:
            initial_temp: Initial temperature
            initial_vib: Initial vibration
            initial_load: Initial load
            constraints: Optional custom constraints dict: {"temperature": (min, max), ...}
            track_history: Whether to track optimization history

        Returns:
            Tuple of (optimized_parameters_dict, best_safety_score, metadata)
        """
        # Current state
        current_temp = initial_temp
        current_vib = initial_vib
        current_load = initial_load
        current_score = self.safety_function(current_temp, current_vib, current_load)

        # Best state found
        best_temp = current_temp
        best_vib = current_vib
        best_load = current_load
        best_score = current_score

        # Optimization bounds (use constraints if provided)
        if constraints:
            temp_min, temp_max = constraints.get("temperature", (50.0, 100.0))
            vib_min, vib_max = constraints.get("vibration", (1.0, 7.0))
            load_min, load_max = constraints.get("load", (0.2, 1.0))
        else:
            temp_min, temp_max = 50.0, 100.0
            vib_min, vib_max = 1.0, 7.0
            load_min, load_max = 0.2, 1.0

        # History tracking
        history = []
        convergence_iteration = None
        improvement_count = 0

        # Hill climbing iterations
        for iteration in range(self.max_iterations):
            # Generate neighbors (small random adjustments)
            neighbors = []

            for _ in range(10):  # Try 10 random neighbors
                # Random adjustments
                delta_temp = self.random_state.uniform(-self.step_size * 5, self.step_size * 5)
                delta_vib = self.random_state.uniform(-self.step_size, self.step_size)
                delta_load = self.random_state.uniform(-self.step_size * 0.1, self.step_size * 0.1)

                # Apply bounds
                new_temp = max(temp_min, min(temp_max, current_temp + delta_temp))
                new_vib = max(vib_min, min(vib_max, current_vib + delta_vib))
                new_load = max(load_min, min(load_max, current_load + delta_load))

                new_score = self.safety_function(new_temp, new_vib, new_load)
                neighbors.append((new_temp, new_vib, new_load, new_score))

            # Select best neighbor
            best_neighbor = max(neighbors, key=lambda x: x[3])

            # Track history if requested
            if track_history:
                history.append({
                    "iteration": iteration,
                    "temperature": round(current_temp, 2),
                    "vibration": round(current_vib, 2),
                    "load": round(current_load, 3),
                    "score": round(current_score, 4),
                    "best_score": round(best_score, 4)
                })

            # If better, move to it
            if best_neighbor[3] > current_score:
                current_temp, current_vib, current_load, current_score = best_neighbor
                improvement_count += 1

                # Update global best
                if current_score > best_score:
                    best_temp = current_temp
                    best_vib = current_vib
                    best_load = current_load
                    best_score = current_score
                    convergence_iteration = iteration
            else:
                # No improvement found, stop or continue with small probability
                if self.random_state.random() < 0.1:  # 10% chance to continue
                    current_temp, current_vib, current_load, current_score = best_neighbor
                else:
                    break  # Local optimum reached

        metadata = {
            "iterations": iteration + 1,
            "improvements": improvement_count,
            "convergence_iteration": convergence_iteration,
            "initial_score": round(self.safety_function(initial_temp, initial_vib, initial_load), 4),
            "final_score": round(best_score, 4),
            "improvement": round(best_score - self.safety_function(initial_temp, initial_vib, initial_load), 4),
            "improvement_percent": round(((best_score - self.safety_function(initial_temp, initial_vib, initial_load)) /
                                        max(self.safety_function(initial_temp, initial_vib, initial_load), 0.01)) * 100, 2)
        }

        if track_history:
            metadata["history"] = history

        return {
            "temperature": round(best_temp, 2),
            "vibration": round(best_vib, 2),
            "load": round(best_load, 3)
        }, best_score, metadata

