#!/usr/bin/env python3
"""
Celery worker startup script
"""

import os
import sys
from celery_app import celery_app

if __name__ == '__main__':
    # Set up logging
    import logging
    logging.basicConfig(level=logging.INFO)
    
    # Start the worker
    celery_app.start()