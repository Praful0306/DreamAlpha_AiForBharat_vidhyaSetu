import os
import zipfile

def zip_project(source_dir, output_filename):
    # Dirs to skip to keep the zip small
    exclude_dirs = {
        'node_modules',
        '.venv',
        'venv',
        'build',
        '__pycache__',
        '.git',
        '.pytest_cache',
        'lambda_package'
    }
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # In-place modification to skip exclude_dirs
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Skip .zip files and the script itself
                if file.endswith('.zip') or file == 'zip_project.py':
                    continue
                file_path = os.path.join(root, file)
                archive_path = os.path.relpath(file_path, source_dir)
                try:
                    zipf.write(file_path, archive_path)
                except Exception as e:
                    pass

if __name__ == '__main__':
    source = r'c:\Users\ASUS\Downloads\DreamAlpha_AiForBharat_vidhyaSetu-main (2)\DreamAlpha_AiForBharat_vidhyaSetu-main\vidhyaSetu'
    output = os.path.join(source, 'vidya_setu_full_project.zip')
    zip_project(source, output)
    size_mb = os.path.getsize(output) / (1024 * 1024)
    print(f"Successfully created: {output}")
    print(f"Size: {size_mb:.2f} MB")
