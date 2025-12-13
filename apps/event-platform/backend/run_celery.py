#!/usr/bin/env python3
"""
Celery management script for running workers and beat scheduler
"""

import os
import sys
import subprocess
import argparse
import signal
import time
from pathlib import Path

def run_worker(queues=None, concurrency=4):
    """Run Celery worker"""
    cmd = [
        'celery', '-A', 'celery_app', 'worker',
        '--loglevel=info',
        f'--concurrency={concurrency}'
    ]
    
    if queues:
        cmd.extend(['--queues', ','.join(queues)])
    
    print(f"Starting Celery worker: {' '.join(cmd)}")
    return subprocess.Popen(cmd)

def run_beat():
    """Run Celery beat scheduler"""
    cmd = [
        'celery', '-A', 'celery_app', 'beat',
        '--loglevel=info'
    ]
    
    print(f"Starting Celery beat: {' '.join(cmd)}")
    return subprocess.Popen(cmd)

def run_flower(port=5555):
    """Run Celery Flower monitoring tool"""
    cmd = [
        'celery', '-A', 'celery_app', 'flower',
        f'--port={port}'
    ]
    
    print(f"Starting Celery Flower: {' '.join(cmd)}")
    return subprocess.Popen(cmd)

def main():
    parser = argparse.ArgumentParser(description='Celery management script')
    parser.add_argument('command', choices=['worker', 'beat', 'flower', 'all'], 
                       help='Command to run')
    parser.add_argument('--queues', nargs='+', 
                       help='Queues for worker to process (default: all)')
    parser.add_argument('--concurrency', type=int, default=4,
                       help='Worker concurrency (default: 4)')
    parser.add_argument('--flower-port', type=int, default=5555,
                       help='Flower port (default: 5555)')
    
    args = parser.parse_args()
    
    processes = []
    
    def signal_handler(sig, frame):
        print("\nShutting down Celery processes...")
        for process in processes:
            process.terminate()
        
        # Wait for processes to terminate
        for process in processes:
            process.wait()
        
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        if args.command == 'worker':
            processes.append(run_worker(args.queues, args.concurrency))
        elif args.command == 'beat':
            processes.append(run_beat())
        elif args.command == 'flower':
            processes.append(run_flower(args.flower_port))
        elif args.command == 'all':
            processes.append(run_worker(args.queues, args.concurrency))
            processes.append(run_beat())
            processes.append(run_flower(args.flower_port))
        
        # Wait for all processes
        for process in processes:
            process.wait()
            
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)

if __name__ == '__main__':
    main()