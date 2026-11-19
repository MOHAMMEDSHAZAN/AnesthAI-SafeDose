with open('test_build.py', 'r', encoding='utf-8') as f:
    text = f.read()

p5_start = text.find('<!-- PAGE 5 -->')
print(text[p5_start:p5_start + 600])
