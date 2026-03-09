import os
import zipfile
import subprocess
import shutil

def package_frontend():
    frontend_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(frontend_dir, "build")
    zip_filename = os.path.join(frontend_dir, "fronted-built.zip")
    
    if os.path.exists(zip_filename):
        os.remove(zip_filename)
        
    print("Running npm run build...")
    # Run build command (assumes npm is installed and in PATH)
    try:
        subprocess.check_call(["npm", "run", "build"], cwd=frontend_dir, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Error during npm build: {e}")
        return

    if not os.path.exists(build_dir):
        print(f"Error: build directory {build_dir} not found!")
        return
        
    print(f"Creating {zip_filename}...")
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(build_dir):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, build_dir)
                # Ensure forward slashes for cross-platform compatibility
                zip_path = rel_path.replace(os.sep, '/')
                z.write(abs_path, zip_path)
                
    print(f"Successfully created {zip_filename}")

if __name__ == "__main__":
    package_frontend()
