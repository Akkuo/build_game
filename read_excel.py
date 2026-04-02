import pandas as pd
import sys

file_path = r"c:\Users\akkuo\.gemini\antigravity\build_Game\FarmJam_規格書.xlsx"

try:
    print("Loading Excel file...")
    xl = pd.ExcelFile(file_path)
    print("Sheets:", xl.sheet_names)
    
    for sheet in xl.sheet_names[:5]: # limit to 5 sheets to avoid huge output
        print(f"\n======== Sheet: {sheet} ========")
        df = pd.read_excel(file_path, sheet_name=sheet, nrows=20)
        print(df.to_markdown())
except Exception as e:
    print(f"Error: {e}")
