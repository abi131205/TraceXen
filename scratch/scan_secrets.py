import os

skip_dirs = {'.git', 'node_modules', 'dist', 'venv', '.venv', '__pycache__'}
leaks = []

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in skip_dirs]
    for file in files:
        if file in ['.env']:
            continue
        filepath = os.path.join(root, file)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for idx, line in enumerate(lines, 1):
                    if 'TG_SECRET' in line and '=' in line:
                        # Check if it has a non-placeholder value assigned
                        if not any(ph in line for ph in [
                            'TG_SECRET =', 'TG_SECRET=', 'os.getenv', 'getattr', 
                            'your_tigergraph_secret_here', '<', '""', "''", 'process.env', 'Optional'
                        ]):
                            leaks.append((filepath, idx, line.strip()))
        except Exception as e:
            pass

print(f"Total potential secret leaks found: {len(leaks)}")
for path, line_no, line in leaks:
    print(f"Match in {path}:{line_no} -> {line[:40]}...")
