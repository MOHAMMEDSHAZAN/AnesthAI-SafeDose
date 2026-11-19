import pypdfium2
import numpy as np

pdf = pypdfium2.PdfDocument('AnesthAI_IEEE_Final.pdf')
print('TOTAL PAGES:', len(pdf))

for i, page in enumerate(pdf):
    pix = page.render(scale=2).to_pil()
    arr = np.array(pix.convert('L'))
    h, w = arr.shape
    mid = w // 2
    
    left_ink = np.where(arr[:, :mid-20] < 240)
    right_ink = np.where(arr[:, mid+20:] < 240)
    
    l_top = left_ink[0].min() if len(left_ink[0]) > 0 else 0
    l_bot = left_ink[0].max() if len(left_ink[0]) > 0 else 0
    r_top = right_ink[0].min() if len(right_ink[0]) > 0 else 0
    r_bot = right_ink[0].max() if len(right_ink[0]) > 0 else 0
    
    all_ink = np.where(arr < 240)
    top = all_ink[0].min() if len(all_ink[0]) > 0 else 0
    bot = all_ink[0].max() if len(all_ink[0]) > 0 else 0
    
    diff = abs(l_bot - r_bot)
    gap = h - bot
    print(f"Page {i+1}: Content Y=[{top} to {bot}] / {h}px | Left lowest={l_bot}, Right lowest={r_bot} | diff={diff}px | bottom gap={gap}px")
