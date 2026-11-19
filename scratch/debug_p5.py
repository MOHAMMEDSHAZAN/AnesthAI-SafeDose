import re
from extract_pages import p5

sec6_pos = p5.find('<h2 class="sec-heading">VI. Results and Evaluation</h2>')
print("sec6_pos:", sec6_pos)
print("p5 snippet around sec6_pos:")
print(p5[sec6_pos : sec6_pos + 400])
