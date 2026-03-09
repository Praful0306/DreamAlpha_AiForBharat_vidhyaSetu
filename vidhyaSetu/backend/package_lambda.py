import os
import zipfile
import subprocess
import shutil
import sys

def package_lambda():
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(backend_dir, "dist")
    zip_filename = os.path.join(backend_dir, "backend-lambda.zip")
    
    # Clean up previous builds
    if os.path.exists(dist_dir):
        shutil.rmtree(dist_dir)
    os.makedirs(dist_dir)
    
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
        
    print(f"Installing dependencies to {dist_dir}...")
    # Install dependencies targeting AWS Lambda (Linux x86_64, Python 3.12)
    # We use --platform manylinux2014_x86_64 to get the correct binaries for pydantic-core
    subprocess.check_call([
        sys.executable, "-m", "pip", "install", 
        "-r", os.path.join(backend_dir, "requirements.txt"),
        "-t", dist_dir,
        "--platform", "manylinux2014_x86_64",
        "--only-binary=:all:",
        "--python-version", "3.12"
    ])
    
    print("Copying app code...")
    # Copy all app files and folders
    shutil.copytree(os.path.join(backend_dir, "app"), os.path.join(dist_dir, "app"), dirs_exist_ok=True)
    shutil.copy(os.path.join(backend_dir, "main.py"), os.path.join(dist_dir, "main.py"))
    
    print(f"Creating {zip_filename}...")
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                # Create a relative path for the zip entry
                rel_path = os.path.relpath(abs_path, dist_dir)
                # FORCE FORWARD SLASHES for Linux compatibility (Lambda)
                zip_path = rel_path.replace(os.sep, '/')
                z.write(abs_path, zip_path)
                
    print(f"Successfully created {zip_filename}")
    # Clean up dist folder after zipping
    shutil.rmtree(dist_dir)

if __name__ == "__main__":
    package_lambda()
