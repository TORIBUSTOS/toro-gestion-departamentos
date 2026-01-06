from pypdf import PdfReader
import os
import sys

# Ruta al archivo
pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Asuncion 1415 - PB A.pdf")

if not os.path.exists(pdf_path):
    print(f"Error: {pdf_path} no existe.")
    sys.exit(1)

try:
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    print("--- INICIO TEXTO CONTRATO ---")
    print(text)
    print("--- FIN TEXTO CONTRATO ---")

except Exception as e:
    print(f"Error leyendo PDF: {e}")
