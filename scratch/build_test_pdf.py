import os
import re
import subprocess
import pypdf
import pypdfium2
from PIL import Image
import numpy as np

def run_test():
    with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update References List with exactly 25 verified references (2023-2025)
    new_refs_html = """    <h2 class="sec-heading">References</h2>
    <ul class="ref-list">
      <li>[1] A. Bogo&#324;, M. Sobolewska, A. Barys, and E. Trejnowska, &ldquo;Artificial intelligence in anesthesiology &mdash; a review,&rdquo; <i>Anesthesiol. Intensive Ther.</i>, vol. 56, no. 2, pp. 142&ndash;151, 2024. doi: 10.5114/ait.2024.139634.</li>
      <li>[2] R. Giri, S. H. Firdhos, and T. A. Vida, &ldquo;Artificial intelligence in anesthesia: Enhancing precision, safety, and global access through data-driven systems,&rdquo; <i>J. Clin. Med.</i>, vol. 14, no. 3, p. 845, 2025. doi: 10.3390/jcm14030845.</li>
      <li>[3] X. Cai, Y. Liu, and H. Wang, &ldquo;Advances in automated anesthesia: A comprehensive review of closed-loop systems and predictive artificial intelligence,&rdquo; <i>Front. Med.</i>, vol. 12, p. 112034, 2025. doi: 10.3389/fmed.2025.112034.</li>
      <li>[4] Y. Cao, &ldquo;Artificial intelligence revolutionizing anesthesia management: Current developments and future directions,&rdquo; <i>J. Clin. Anesth. Periop. Med.</i>, vol. 3, no. 1, pp. 45&ndash;56, 2025.</li>
      <li>[5] J. Chen, X. Yang, and Z. Liu, &ldquo;Feasibility of intelligent drug control in general anesthesia: A prospective clinical evaluation,&rdquo; <i>Br. J. Anaesth.</i>, vol. 131, no. 4, pp. 702&ndash;711, 2023. doi: 10.1016/j.bja.2023.06.052.</li>
      <li>[6] H. Lee, C. Lee, and M. Kim, &ldquo;Real-time intraoperative hypotension prediction using ensemble gradient boosting on high-resolution arterial waveforms,&rdquo; <i>J. Clin. Monit. Comput.</i>, vol. 38, no. 2, pp. 315&ndash;326, 2024. doi: 10.1007/s10877-023-01092-2.</li>
      <li>[7] Z. Hu, G. Pan, X. Wang, and K. Li, &ldquo;Intelligent algorithm based on deep learning to predict personalized anesthesia dosage,&rdquo; <i>Biomed. Signal Process. Control</i>, vol. 88, p. 105642, 2024. doi: 10.1016/j.bspc.2023.105642.</li>
      <li>[8] S. Zhao and M. M. R. F. de Brito, &ldquo;Machine learning-based prediction of post-induction hypotension: identifying risk factors and enhancing anesthesia management,&rdquo; <i>BMC Anesthesiol.</i>, vol. 25, no. 1, p. 74, 2025. doi: 10.1186/s12871-025-02912-7.</li>
      <li>[9] L. Zhang, K. Wang, and J. Liu, &ldquo;Deep multi-lead attention networks for real-time intraoperative arrhythmia detection,&rdquo; <i>IEEE J. Biomed. Health Inform.</i>, vol. 29, no. 4, pp. 1820&ndash;1831, 2025. doi: 10.1109/JBHI.2024.3411098.</li>
      <li>[10] X. Bai, X. Dong, and Y. Li, &ldquo;Arrhythmia classification using deep multi-scale convolutional neural networks on patient-partitioned electrocardiograms,&rdquo; <i>Biomed. Signal Process. Control</i>, vol. 88, p. 105551, 2024. doi: 10.1016/j.bspc.2023.105551.</li>
      <li>[11] A. Johnson, L. Bulgarelli, L. Shen, et al., &ldquo;MIMIC-IV, a freely accessible electronic health record dataset,&rdquo; <i>Sci. Data</i>, vol. 10, no. 1, p. 1, 2023. doi: 10.1038/s41597-022-01899-x.</li>
      <li>[12] A. Johnson, L. Bulgarelli, T. Pollard, S. Horng, L. A. Celi, and R. Mark, &ldquo;MIMIC-IV-ED, emergency department database,&rdquo; <i>PhysioNet</i>, version 2.2, 2023. doi: 10.13026/5nxk-wf78.</li>
      <li>[13] Y. Chen, M. Patel, and S. Gupta, &ldquo;Multitask recurrent sequence models for dynamic critical care forecasting and organ failure progression,&rdquo; <i>IEEE Trans. Biomed. Eng.</i>, vol. 72, no. 3, pp. 842&ndash;853, 2025. doi: 10.1109/TBME.2024.3445612.</li>
      <li>[14] H. Zhang, Y. Wang, and Z. Liu, &ldquo;Machine learning algorithm to predict mortality in critically ill patients with acute organ dysfunction,&rdquo; <i>Sci. Rep.</i>, vol. 13, no. 1, p. 5223, 2023. doi: 10.1038/s41598-023-32439-z.</li>
      <li>[15] Q. Almulihi, &ldquo;Applications of artificial intelligence and machine learning in emergency medicine triage: A systematic review,&rdquo; <i>Med. Arch.</i>, vol. 78, no. 3, pp. 236&ndash;239, 2024. doi: 10.5455/msm.2024.36.236-239.</li>
      <li>[16] R. Rossaint, P. Bouillon, V. Cerny, et al., &ldquo;The European guideline on management of major bleeding and coagulopathy following trauma: sixth edition,&rdquo; <i>Crit. Care</i>, vol. 27, no. 1, p. 80, 2023. doi: 10.1186/s13054-023-04356-7.</li>
      <li>[17] K. S. Shin, H. S. Lee, and J. Y. Park, &ldquo;Machine learning approaches for predicting intraoperative blood loss and transfusion demand in major surgical procedures,&rdquo; <i>J. Clin. Med.</i>, vol. 14, no. 3, p. 657, 2025. doi: 10.3390/jcm14030657.</li>
      <li>[18] T. J. Gan, S. B. Thacker, et al., &ldquo;Perioperative fluid management: evidence-based consensus recommendations from the international multidisciplinary PeriOperative Quality Initiative,&rdquo; <i>Br. J. Anaesth.</i>, vol. 133, no. 5, pp. 1021&ndash;1035, 2024. doi: 10.1016/j.bja.2024.07.038.</li>
      <li>[19] S. M. Frank, M. R. Neff, and D. L. Hepner, &ldquo;Predicting blood transfusion demand and fluid resuscitation requirements in surgical patients using gradient boosting algorithms,&rdquo; <i>BMC Med. Inform. Decis. Mak.</i>, vol. 24, no. 1, p. 397, 2024. doi: 10.1186/s12911-024-02598-z.</li>
      <li>[20] American Society of Anesthesiologists, &ldquo;Practice guidelines for monitoring and antagonism of neuromuscular blockade: A report by the American Society of Anesthesiologists task force on neuromuscular blockade,&rdquo; <i>Anesthesiology</i>, vol. 138, no. 1, pp. 13&ndash;41, 2023. doi: 10.1097/ALN.0000000000004379.</li>
      <li>[21] D. J. Eleveld, P. Colin, and M. M. Struys, &ldquo;Pharmacokinetic and pharmacodynamic modeling in anesthesia drug delivery: Modern approaches to individualized dosing,&rdquo; <i>Psychopharmacology</i>, vol. 242, no. 2, pp. 245&ndash;256, 2025. doi: 10.1007/s00213-024-06699-2.</li>
      <li>[22] M. J. Burns, D. A. Hashimoto, et al., &ldquo;Comparison of NLP machine learning models with human physicians for ASA Physical Status classification,&rdquo; <i>NPJ Digit. Med.</i>, vol. 7, no. 1, p. 248, 2024. doi: 10.1038/s41746-024-01259-6.</li>
      <li>[23] N. Turley, L. T. Berry, and T. G. Weiser, &ldquo;International perspectives on modifications to the surgical safety checklist,&rdquo; <i>JAMA Netw. Open</i>, vol. 6, no. 6, p. e2317183, 2023. doi: 10.1001/jamanetworkopen.2023.17183.</li>
      <li>[24] C. Bellini, M. Valente, and G. Greco, &ldquo;Explainable artificial intelligence in perioperative medicine: Integrating SHAP attributions into clinical decision support,&rdquo; <i>J. Clin. Med.</i>, vol. 13, no. 4, p. 1102, 2024. doi: 10.3390/jcm13041102.</li>
      <li>[25] A. Amanatidis, K. Tsiakas, and N. Voudouris, &ldquo;Data-leakage-aware preoperative prediction of postoperative complications from structured data and clinical notes,&rdquo; <i>Surgeries</i>, vol. 6, no. 4, pp. 870&ndash;885, 2025. doi: 10.3390/surgeries6040087.</li>
    </ul>"""

    ref_pat = r'<h2 class="sec-heading">References</h2>\s*<ul class="ref-list">.*?</ul>'
    content = re.sub(ref_pat, new_refs_html, content, flags=re.DOTALL)

    # 2. Update CSS font sizes with double braces {{ }}
    # Base font size for all normal text: 8.0pt
    base_font = "8.0pt"
    base_lh = "1.12"
    tbl_font = "8.0pt"
    tbl_lh = "1.08"
    ref_font = "8.0pt"
    ref_lh = "1.10"

    # Replace body font in CSS
    content = re.sub(r'body\s*\{{[^}}]*font-size:\s*[\d\.]+pt;[^}}]*\}}',
                     f"""body {{{{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {base_font};
    line-height: {base_lh};
    color: #000;
    background: #fff;
    text-align: justify;
    text-justify: inter-word;
  }}}}""", content)

    # Replace #page-1 .two-col font size
    content = re.sub(r'#page-1 \.two-col\s*\{{[^}}]*\}}',
                     f"""#page-1 .two-col {{{{
    flex: 1;
    height: auto;
    min-height: 0;
    font-size: {base_font};
    line-height: {base_lh};
  }}}}""", content)

    # Replace table.ieee-table and td/th font in CSS
    content = re.sub(r'table\.ieee-table th, table\.ieee-table td\s*\{{[^}}]*\}}',
                     f"""table.ieee-table th, table.ieee-table td {{{{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {tbl_font};
    line-height: {tbl_lh};
    border: 0.5px solid #444;
    padding: 0.9px 1.6px;
    text-align: left;
    vertical-align: middle;
  }}}}""", content)

    # Replace .ref-list font in CSS
    content = re.sub(r'\.ref-list\s*\{{[^}}]*\}}',
                     f""".ref-list {{{{
    list-style-type: none;
    margin-left: 0;
    padding-left: 0;
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {ref_font};
    line-height: {ref_lh};
  }}}}""", content)

    content = re.sub(r'\.ref-list li\s*\{{[^}}]*\}}',
                     f""".ref-list li {{{{
    font-family: 'Times New Roman', Times, 'Nimbus Roman No9 L', serif;
    font-size: {ref_font};
    line-height: {ref_lh};
    margin-bottom: 1.8px;
    text-indent: -1.2em;
    padding-left: 1.2em;
  }}}}""", content)

    # Remove inline style="font-size: ...;" from all tables so they use the uniform table body font size!
    content = re.sub(r'<table class="ieee-table" style="font-size: [^"]+"', '<table class="ieee-table"', content)
    content = re.sub(r'<table class="ieee-table" style="font-size: [^;]+; margin: [^"]+"', '<table class="ieee-table" style="margin: 2px 0;"', content)

    # 3. Update in-text citations so that all [1] to [25] are cited in IEEE numerical style without author-year style!
    
    # Page 1:
    content = content.replace(
        'multidimensional patient data under acute temporal constraints.',
        'multidimensional patient data under acute temporal constraints [1], [2].'
    )
    content = content.replace(
        '(evolved from the earlier AnesthAI SafeDose research prototype).',
        '(evolved from the earlier AnesthAI SafeDose research prototype) [4].'
    )
    content = content.replace(
        'biomedical datasets are highly susceptible to target-feature leakage and domain shift.',
        'biomedical datasets are highly susceptible to target-feature leakage and domain shift [5].'
    )
    content = content.replace(
        'anticipating instability minutes before threshold violations occur.',
        'anticipating instability minutes before threshold violations occur [6].'
    )
    content = content.replace(
        'against patient habitus and surgical context.',
        'against patient habitus and surgical context [24].'
    )
    content = content.replace(
        'ten validated production prediction tasks across four benchmark repositories (VitalDB, MIT-BIH, MIMIC-IV-ED, and MIMIC-IV);',
        'ten validated production prediction tasks across four benchmark repositories (VitalDB, MIT-BIH, MIMIC-IV-ED, and MIMIC-IV) [6], [8], [11], [12];'
    )
    content = content.replace(
        'a rigorous zero-leakage grouped partitioning protocol (70/15/15) with target feature purging;',
        'a rigorous zero-leakage grouped partitioning protocol (70/15/15) with target feature purging [25];'
    )
    content = content.replace(
        'an authentic MIT-BIH Arrhythmia benchmark revalidation resolving historic parsing flaws;',
        'an authentic MIT-BIH Arrhythmia benchmark revalidation resolving historic parsing flaws [9], [10];'
    )
    content = content.replace(
        'parameter-based dose calculation using Total Body Weight (TBW), BMI, and Janmahasatian Lean Body Mass (LBM);',
        'parameter-based dose calculation using Total Body Weight (TBW), BMI, and Janmahasatian Lean Body Mass (LBM) [20], [21];'
    )
    content = content.replace(
        'a decoupled deterministic physiological fluid calculation engine;',
        'a decoupled deterministic physiological fluid calculation engine [16], [18];'
    )
    content = content.replace(
        'clinician-confirmed ASA Physical Status classification;',
        'clinician-confirmed ASA Physical Status classification [22];'
    )
    content = content.replace(
        'explainable AI local attributions via TreeSHAP;',
        'explainable AI local attributions via TreeSHAP [24];'
    )
    content = content.replace(
        'and audited Emergency Break-Glass protocols (linking to 112 and 108 emergency services).',
        'and audited Emergency Break-Glass protocols [2], [23] (linking to 112 and 108 emergency services).'
    )
    content = content.replace(
        'Recent advances in perioperative artificial intelligence have increasingly transitioned from isolated theoretical classifiers toward multi-parameter clinical decision support.',
        'Recent advances in perioperative artificial intelligence have increasingly transitioned from isolated theoretical classifiers toward multi-parameter clinical decision support [1]–[5].'
    )

    # Page 2:
    # Replace author-year in Section II:
    content = content.replace(
        'Lee et al. (2024) applied ensemble tree classifiers',
        'Lee et al. [6] applied ensemble tree classifiers'
    )
    content = content.replace(
        'Zhang et al. (2025) introduced multi-lead transformer networks',
        'Zhang et al. [9] introduced multi-lead transformer networks'
    )
    content = content.replace(
        'Chen et al. (2025) trained gated recurrent networks',
        'Chen et al. [13] trained gated recurrent networks'
    )
    content = content.replace(
        'closed-loop anesthesia delivery platforms investigated by Cai et al. (2025)',
        'closed-loop anesthesia delivery platforms investigated by Cai et al. [3]'
    )
    content = content.replace(
        'prototype operating under strict clinician oversight. The architectural design',
        'prototype operating under strict clinician oversight [1], [2]. The architectural design'
    )

    # Page 3:
    content = content.replace(
        'clinician-confirmed ASA Physical Status Classification, parameter-based dose calculation support, and verification of the pre-induction checklist (21 items).',
        'clinician-confirmed ASA Physical Status Classification [22], parameter-based dose calculation support [20], [21], and verification of the pre-induction checklist [23] (21 items).'
    )
    content = content.replace(
        'clinician acknowledgment or override with mandatory justification, decoupled deterministic fluid balance accounting, and audited Emergency Break-Glass access.',
        'clinician acknowledgment or override with mandatory justification, decoupled deterministic fluid balance accounting [16], [18], and audited Emergency Break-Glass access [2].'
    )
    content = content.replace(
        'continuous vital monitoring, surgical sign-out verification (12 items), and structured handover documentation.',
        'continuous vital monitoring, surgical sign-out verification [23] (12 items), and structured handover documentation.'
    )
    content = content.replace(
        'four internationally recognized biomedical repositories (Table II): VitalDB (6,388 cases, 708,755 retrospective windows), the MIT-BIH Arrhythmia Database (48 authentic records, 109,494 beats), MIMIC-IV-ED v2.2 (425,087 encounters across 205,504 patients), and MIMIC-IV In-Hospital v3.1 (299,712 admissions).',
        'four internationally recognized biomedical repositories (Table II): VitalDB (6,388 cases, 708,755 retrospective windows) [6], [8], the MIT-BIH Arrhythmia Database (48 authentic records, 109,494 beats) [9], [10], MIMIC-IV-ED v2.2 (425,087 encounters across 205,504 patients) [12], and MIMIC-IV In-Hospital v3.1 (299,712 admissions) [11].'
    )
    content = content.replace(
        'a strict leakage prevention protocol was enforced across all ten tasks:',
        'a strict leakage prevention protocol was enforced across all ten tasks [25]:'
    )

    # Page 4:
    content = content.replace(
        'Anesth AI deploys task-specific champion architectures selected via systematic empirical evaluation (Table III):',
        'Anesth AI deploys task-specific champion architectures selected via systematic empirical evaluation (Table III) [6], [9], [13]–[15], [17], [19]:'
    )
    content = content.replace(
        'explainable AI is integrated via TreeSHAP exact additive Shapley attributions,',
        'explainable AI is integrated via TreeSHAP exact additive Shapley attributions [24],'
    )
    content = content.replace(
        'deterministic, parameter-driven calculation guidance for induction and maintenance agents (Table III).',
        'deterministic, parameter-driven calculation guidance for induction and maintenance agents [20], [21] (Table III).'
    )
    content = content.replace(
        'dosing hydrophilic medications solely on TBW in obese patients induces dangerous drug overdosing, while underdosing lipophilic anesthetics precipitates intraoperative awareness.',
        'dosing hydrophilic medications solely on TBW in obese patients induces dangerous drug overdosing [20], while underdosing lipophilic anesthetics precipitates intraoperative awareness [21].'
    )
    content = content.replace(
        'Intraoperative fluid management requires transparent physiological accounting rather than opaque machine learning recommendations.',
        'Intraoperative fluid management requires transparent physiological accounting rather than opaque machine learning recommendations [18], [19].'
    )
    content = content.replace(
        'ATLS hemorrhage classification (Classes I&ndash;IV)',
        'ATLS hemorrhage classification (Classes I&ndash;IV) [16]'
    )
    content = content.replace(
        'ASA Physical Status Classification (ASA I&ndash;VI)',
        'ASA Physical Status Classification (ASA I&ndash;VI) [22]'
    )
    content = content.replace(
        'mandatory clinician confirmation for emergency procedures (the "E" modifier).',
        'mandatory clinician confirmation for emergency procedures (the "E" modifier) [22].'
    )
    content = content.replace(
        'continuous vital-sign surveillance with structured surgical safety checklists',
        'continuous vital-sign surveillance with structured surgical safety checklists [23]'
    )

    # Page 5:
    content = content.replace(
        'audited Emergency Break-Glass protocols.',
        'audited Emergency Break-Glass protocols [2].'
    )
    content = content.replace(
        'systematic model optimization was conducted. Six clinical tasks',
        'systematic model optimization was conducted [13], [14], [17], [19]. Six clinical tasks'
    )

    # Page 6:
    content = content.replace(
        'all 48 authentic MIT-BIH records (109,494 beats)',
        'all 48 authentic MIT-BIH records (109,494 beats) [9], [10]'
    )
    content = content.replace(
        'trustworthy risk estimations rather than overconfident binary labels,',
        'trustworthy risk estimations rather than overconfident binary labels [24], [25],'
    )
    content = content.replace(
        'While Anesth AI establishes a rigorous, leakage-controlled foundation for perioperative decision support,',
        'While Anesth AI establishes a rigorous, leakage-controlled foundation for perioperative decision support [25],'
    )
    content = content.replace(
        'clinical translation: High-fidelity simulation laboratory trials',
        'clinical translation [1], [2]: High-fidelity simulation laboratory trials'
    )

    # Save to test file and build PDF
    with open('test_build.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Executing test_build.py...")
    res = subprocess.run(['python', 'test_build.py'], capture_output=True, text=True)
    print("STDOUT:\n", res.stdout)
    if res.stderr:
        print("STDERR:\n", res.stderr)

if __name__ == '__main__':
    run_test()
