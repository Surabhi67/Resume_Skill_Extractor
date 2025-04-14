# import pymupdf 
# import tkinter as tk
# from tkinter import filedialog
# import os
# from llm import askllm

# base_dir = os.path.dirname(__file__)
# output_path = os.path.join(base_dir, "output.txt")



# # Open file dialog to select a PDF
# root = tk.Tk()
# root.withdraw()  # hide the tkinter main window
# file_path = filedialog.askopenfilename(
#     title="Select PDF",
#     filetypes=[("PDF files", "*.pdf")]
# )

# async def extract_text(file):
#     doc = pymupdf.open(file_path) # open a document
#     out = open(output_path, "wb") # create a text output
#     for page in doc: # iterate the document pages
#         text = page.get_text().encode("utf8") # get plain text (is in UTF-8)
#         out.write(text) # write text of page
#         out.write(bytes((12,))) # write page delimiter (form feed 0x0C)
        
#     print(text)
#     askllm(text)

#     out.close()