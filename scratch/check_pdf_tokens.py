import pypdf

reader = pypdf.PdfReader('AnesthAI_IEEE_Final.pdf')
full_text = ''
for i, page in enumerate(reader.pages):
    t = page.extract_text() or ''
    full_text += f'\n--- Page {i+1} ---\n' + t

for token in ['??', '[?]', 'TODO', 'UNDEFINED', 'NaN', 'REF_ERROR']:
    cnt = full_text.count(token)
    print(f'Token "{token}": {cnt} occurrences')

print("\n--- Sequential Tables ---")
for tbl in ['Table I', 'Table II', 'Table III', 'Table IV', 'Table V', 'Table VI']:
    print(f'{tbl} in text: {full_text.count(tbl)}')

print("\n--- Sequential Figures ---")
for fig in ['Fig. 1', 'Fig. 2', 'Fig. 3', 'Fig. 4', 'Fig. 5', 'Fig. 6', 'Fig. 7']:
    print(f'{fig} in text: {full_text.count(fig)}')

