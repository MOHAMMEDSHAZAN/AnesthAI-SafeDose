# Let's inspect the exact HTML content of each section in test_max_h_2.25.html
with open(r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\test_max_h_2.25.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

# Let's see the sections and their character lengths
sections = [
    'I. Introduction',
    'II. Literature Survey',
    'Table I',
    'III. System Design and Clinical Workflow',
    'Fig. 1',
    'A. Modular Implementation and Clinical UI Modules',
    'B. Three-Phase Perioperative Workflow',
    'Fig. 2',
    'IV. Datasets and Leakage-Controlled Methodology',
    'Table II',
    'A. Benchmark Clinical Repositories',
    'B. Rigorous Preprocessing and Feature Pipeline',
    'C. Leakage Prevention Protocol',
    'D. Operational Machine Learning Architectures',
    'Table III',
    'E. Explainable AI (XAI) Attribution',
    'V. Clinical Calculation, Safety and XAI',
    'A. Anesthesia Dose Calculation Decision Support',
    'Fig. 3',
    'B. Deterministic Physiological Fluid Engine',
    'C. Clinician-Confirmed ASA Physical Status Classification',
    'D. Intraoperative Safety Monitoring and Checklists',
    'Fig. 4',
    'E. Security, Role-Based Access, and Emergency Break-Glass',
    'Fig. 5',
    'VI. Results and Evaluation',
    'Table IV',
    'A. Production Model Optimization and Benchmarking',
    'Table V',
    'Fig. 6',
    'B. Authentic MIT-BIH Revalidation and Confusion Matrix',
    'C. Probability Calibration and Clinical Utility',
    'Table VI',
    'Fig. 7',
    'VII. Limitations and Future Work',
    'VIII. Conclusion',
    'References'
]

print(f'Total key blocks tracked: {len(sections)}')
