import os

def bundle():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
        
    with open('styles.css', 'r', encoding='utf-8') as f:
        css = f.read()
        
    with open('app.js', 'r', encoding='utf-8') as f:
        js = f.read()
        
    # Replace external links with inline content
    html = html.replace('<link rel="stylesheet" href="styles.css">', f'<style>\n{css}\n</style>')
    html = html.replace('<script src="app.js"></script>', f'<script>\n{js}\n</script>')
    
    with open('Nexus_LMS_Bundled.html', 'w', encoding='utf-8') as f:
        f.write(html)
        
    print("Successfully created Nexus_LMS_Bundled.html")

if __name__ == '__main__':
    bundle()
