from PIL import Image
import numpy as np

for p in range(1, 7):
    img = Image.open(f'c:/Users/moham/OneDrive/Desktop/Anasthesia Antigravity/scratch/test_225/page_{p}.png')
    arr = np.array(img.convert('L'))
    h, w = arr.shape
    # Left column: x from 0.05*w to 0.48*w, Right column: x from 0.52*w to 0.95*w
    # Let's find lowest non-white pixel row
    col1 = arr[:, int(0.05*w):int(0.48*w)]
    col2 = arr[:, int(0.52*w):int(0.95*w)]
    
    # Non-white is < 250
    nonwhite_col1 = np.where(col1 < 250)
    nonwhite_col2 = np.where(col2 < 250)
    
    max_r1 = nonwhite_col1[0].max() if len(nonwhite_col1[0]) > 0 else 0
    max_r2 = nonwhite_col2[0].max() if len(nonwhite_col2[0]) > 0 else 0
    
    print(f'Page {p}: total height={h}px | Col 1 bottom={max_r1} (margin={h - max_r1}px) | Col 2 bottom={max_r2} (margin={h - max_r2}px)')
