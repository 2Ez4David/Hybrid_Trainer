with open('js/ui.js', 'r') as f:
    text = f.read()

count_open = text.count('${')
print(f'${{ count: {count_open}')
