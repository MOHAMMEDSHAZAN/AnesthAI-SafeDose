from PIL import Image

im1 = Image.open('anesth_ai_ieee/figures_polished/fig1_architecture_submission.png')
# If scaled to 3.4 inches at 300 DPI, width = 1020px.
# Original is 2475x1650.
# Let's see: 1020 / 2475 = 0.41x scale.
print("Fig 1 at column width (3.4 in) would be 1020x680.")
