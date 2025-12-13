"""Pytest configuration and fixtures."""
from hypothesis import settings

# Configure Hypothesis to run 100 examples per property test
settings.register_profile("default", max_examples=100)
settings.load_profile("default")
