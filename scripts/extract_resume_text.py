from pdfminer.high_level import extract_text
from pathlib import Path

pdf_path = Path(__file__).resolve().parents[1] / 'assets' / 'SHOEB-Python.pdf'
out_path = Path(__file__).resolve().parents[1] / 'assets' / 'resume_text.txt'

try:
    text = extract_text(str(pdf_path))
    out_path.write_text(text, encoding='utf-8')
    print(f"Wrote extracted text to: {out_path}")
except Exception as e:
    print('Error extracting text:', e)
