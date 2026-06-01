import subprocess
import os
import time

def run_all():
    print("Starting VeritasAI...")
    
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")
    
    # Start Backend
    print("-> Starting Python Backend on port 5000...")
    backend_process = subprocess.Popen(["python", "app.py"], cwd=backend_dir)
    
    # Start Frontend
    print("-> Starting React Frontend on port 5173...")
    frontend_process = subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir, shell=True)
    
    print("\n=======================================================")
    print("✅ BOTH SERVERS ARE RUNNING!")
    print("Open your browser to: http://localhost:5173/")
    print("Press CTRL+C here to stop everything.")
    print("=======================================================\n")
    
    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Done.")

if __name__ == "__main__":
    run_all()
