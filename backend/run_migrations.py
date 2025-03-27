#!/usr/bin/env python
import os
import sys
import subprocess

def run_migrations():
    """Run Alembic migrations to update the database schema."""
    try:
        # Change to the correct directory if needed
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        
        # Run Alembic migrations
        print("Running Alembic migrations...")
        result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("Migrations completed successfully!")
            print(result.stdout)
            return True
        else:
            print("Error running migrations:")
            print(result.stderr)
            return False
    
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return False

if __name__ == "__main__":
    success = run_migrations()
    sys.exit(0 if success else 1) 