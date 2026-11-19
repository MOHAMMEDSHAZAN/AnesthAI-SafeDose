import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def test_cascade_p4_p5():
    with open('test_build.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Move Section V-E text paragraph to bottom of Page 4:
    ve_text = """    <h3 class="subsec-heading">E. Security, Role-Based Access, and Emergency Break-Glass</h3>
    <p class="no-indent">System security is governed by role-based access control (RBAC), restricting clinical configuration, patient telemetry, and audit log inspection. For acute emergencies requiring immediate clinical access, the platform implements an audited Emergency Break-Glass workflow (Fig. 5). Activating Break-Glass grants temporary scoped access while mandating clinical justification (&ge;10 characters), logging attending credentials and timestamps, and presenting quick-dial links to Indian national emergency services (112 &mdash; National Emergency Number; 108 &mdash; Ambulance / EMS). The system provides clinical decision support; it does not perform automated emergency dispatch or autonomous intervention.</p>"""

    # Add to Page 4 before closing
    p4_end = content.find('<!-- PAGE 5 -->')
    p4_close = content.rfind('</div>\n</div>', 0, p4_end)
    content = content[:p4_close] + ve_text + "\n  " + content[p4_close:]

    # Remove heading from Page 5 top, leave Fig 5 box with subsec-heading
    old_p5_top = """    <h3 class="subsec-heading" style="margin-top: 0;">E. Security, Role-Based Access, and Emergency Break-Glass</h3>
    <p class="no-indent">System security is governed by role-based access control (RBAC), restricting clinical configuration, patient telemetry, and audit log inspection. For acute emergencies requiring immediate clinical access, the platform implements an audited Emergency Break-Glass workflow (Fig. 5). Activating Break-Glass grants temporary scoped access while mandating clinical justification (&ge;10 characters), logging attending credentials and timestamps, and presenting quick-dial links to Indian national emergency services (112 &mdash; National Emergency Number; 108 &mdash; Ambulance / EMS). The system provides clinical decision support; it does not perform automated emergency dispatch or autonomous intervention.</p>"""

    content = content.replace(old_p5_top, """    <h3 class="subsec-heading" style="margin-top: 0;">E. Emergency Break-Glass Architecture</h3>""")

    with open('test_build.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Running test_build.py after Page 4/5 adjustment...")
    res = subprocess.run(['python', 'test_build.py'], capture_output=True, text=True)
    print("STDOUT:\n", res.stdout)
    if res.stderr:
        print("STDERR:\n", res.stderr)

if __name__ == '__main__':
    test_cascade_p4_p5()
