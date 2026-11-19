import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def test_cascade():
    with open('test_build.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Move IV-D introductory paragraph from Page 4 to bottom of Page 3 (after IV-C)
    # The paragraph:
    p_ivd = """    <h3 class="subsec-heading">D. Operational Machine Learning Architectures</h3>
    <p class="no-indent">Rather than enforcing a single learning algorithm across heterogeneous clinical modalities, Anesth AI deploys task-specific champion architectures selected via systematic empirical evaluation (Table III) [6], [9], [13]–[15], [17], [19]: Intraoperative hemodynamics (Hypotension, Hypoxia, Tachycardia) use HistGradientBoosting [6], [8] due to its native handling of missing values, rapid inference latency, and robust leaf-wise histogram binning across continuous surgical telemetry vectors comprising backward rolling summary statistics (mean, median, standard deviation, min, max, linear slope over 5-minute windows [t - 300s, t]); LightGBM: Deployed for Arrhythmia Detection and Fluid Recommendation, providing fast leaf-wise tree growth, native categorical support, exact TreeSHAP attribution compatibility, and strong probability calibration across high-dimensional feature spaces; CatBoost: Selected for Emergency Severity Assessment due to its specialized handling of high-cardinality categorical variables (chief complaints, arrival modes, insurance types) using ordered target encoding and symmetric oblivious decision trees that resist overfitting; ClinicalCNN (1D-CNN): Engineered for Bradycardia telemetry classification, employing three 1D convolutional layers (kernel sizes 3 and 5, filter depth 64–128) with batch normalization, ReLU activation, max-pooling, and dropout (0.25) to capture localized morphological waveform shifts; ClinicalLSTM: Deployed for Surgical Blood Loss prediction, utilizing a two-layer bidirectional Long Short-Term Memory network (hidden dimension 64, dropout 0.20) to capture cumulative fluid shift dependencies; and ClinicalGRU: Utilized for ICU Admission and In-Hospital Mortality, leveraging a two-layer Gated Recurrent Unit network (hidden dimension 64, dropout 0.20) with masked loss functions for efficient sequential learning over irregularly sampled inpatient laboratory trajectories (seq_len=24). Non-validated demonstration modules (Airway, RiskPrediction, PONV, PACU, DrugSafety, prototype_baseline) are maintained strictly as non-validated prototype software modules and are excluded from scientific benchmark claims.</p>"""

    # Remove it from Page 4:
    # Page 4 currently starts with:
    # <div class="page">
    #   <div class="two-col">
    #     <h3 class="subsec-heading" style="margin-top: 0;">D. Operational Machine Learning Architectures</h3>
    #     <p class="no-indent">Rather than enforcing ... claims.</p>
    #     <div class="table-title">Table III: Ten Operational Production Clinical Tasks</div>
    
    # We remove the heading and paragraph from Page 4 and keep Table III on Page 4 with subsec-heading
    old_p4_top = """    <h3 class="subsec-heading" style="margin-top: 0;">D. Operational Machine Learning Architectures</h3>
    <p class="no-indent">Rather than enforcing a single learning algorithm across heterogeneous clinical modalities, Anesth AI deploys task-specific champion architectures selected via systematic empirical evaluation (Table III) [6], [9], [13]–[15], [17], [19]: Intraoperative hemodynamics (Hypotension, Hypoxia, Tachycardia) use HistGradientBoosting [6], [8] due to its native handling of missing values, rapid inference latency, and robust leaf-wise histogram binning across continuous surgical telemetry vectors comprising backward rolling summary statistics (mean, median, standard deviation, min, max, linear slope over 5-minute windows [t - 300s, t]); LightGBM: Deployed for Arrhythmia Detection and Fluid Recommendation, providing fast leaf-wise tree growth, native categorical support, exact TreeSHAP attribution compatibility, and strong probability calibration across high-dimensional feature spaces; CatBoost: Selected for Emergency Severity Assessment due to its specialized handling of high-cardinality categorical variables (chief complaints, arrival modes, insurance types) using ordered target encoding and symmetric oblivious decision trees that resist overfitting; ClinicalCNN (1D-CNN): Engineered for Bradycardia telemetry classification, employing three 1D convolutional layers (kernel sizes 3 and 5, filter depth 64–128) with batch normalization, ReLU activation, max-pooling, and dropout (0.25) to capture localized morphological waveform shifts; ClinicalLSTM: Deployed for Surgical Blood Loss prediction, utilizing a two-layer bidirectional Long Short-Term Memory network (hidden dimension 64, dropout 0.20) to capture cumulative fluid shift dependencies; and ClinicalGRU: Utilized for ICU Admission and In-Hospital Mortality, leveraging a two-layer Gated Recurrent Unit network (hidden dimension 64, dropout 0.20) with masked loss functions for efficient sequential learning over irregularly sampled inpatient laboratory trajectories (seq_len=24). Non-validated demonstration modules (Airway, RiskPrediction, PONV, PACU, DrugSafety, prototype_baseline) are maintained strictly as non-validated prototype software modules and are excluded from scientific benchmark claims.</p>"""

    # Add to Page 3 before </div>\n</div>\n\n<!-- PAGE 4 -->
    p3_end = content.find('<!-- PAGE 4 -->')
    # Find the closing </div>\n</div> of page 3
    p3_close = content.rfind('</div>\n</div>', 0, p3_end)

    content = content[:p3_close] + p_ivd + "\n  " + content[p3_close:]

    # Now replace old_p4_top in Page 4 with just subsec-heading style="margin-top: 0;"
    content = content.replace(old_p4_top, """    <h3 class="subsec-heading" style="margin-top: 0;">D. Operational Machine Learning Architectures (Cont.)</h3>""")

    # Save and test
    with open('test_build.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Running test_build.py after Page 3/4 adjustment...")
    res = subprocess.run(['python', 'test_build.py'], capture_output=True, text=True)
    print("STDOUT:\n", res.stdout)
    if res.stderr:
        print("STDERR:\n", res.stderr)

if __name__ == '__main__':
    test_cascade()
