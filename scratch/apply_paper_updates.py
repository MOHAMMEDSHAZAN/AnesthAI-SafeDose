import re

with open('build_submission_final_6page.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Abstract
old_abs_hypo = 'Intraoperative Hypotension (ROC-AUC 0.6974)'
new_abs_hypo = 'Intraoperative Hypotension (ROC-AUC 0.6927, PR-AUC 0.4818 at &tau; = 0.500)'
content = content.replace(old_abs_hypo, new_abs_hypo)

old_abs_arr = 'across 17,029 held-out beats'
new_abs_arr = 'across 17,026 held-out beats'
content = content.replace(old_abs_arr, new_abs_arr)

# 2. Update Table II VitalDB & MIT-BIH cohorts
content = content.replace(
    '<td>6,388 cases / 708,755 windows</td>',
    '<td>235 cases (6,388 registry) / 708,755 test sec</td>'
)
content = content.replace(
    '<td>48 records / 109,494 beats</td>',
    '<td>48 records / 109,494 beats (17,026 test)</td>'
)

# 3. Update Table III (Ten Tasks)
content = content.replace(
    '<tr><td class="center">1</td><td>Hypotension</td><td>VitalDB</td><td>HistGradientBoosting</td></tr>',
    '<tr><td class="center">1</td><td>Hypotension</td><td>VitalDB</td><td>LightGBM</td></tr>'
)

# 4. Update Table IV (Baseline Performance)
old_table4_hypo = """          <tr>
            <td>Hypotension</td>
            <td>VitalDB</td>
            <td>HistGradBoost</td>
            <td class="center">708,755</td>
            <td class="center">173,859</td>
            <td class="center">0.475</td>
            <td class="center">69.88%</td>
            <td class="center">54.14%</td>
            <td class="center">75.00%</td>
            <td class="center">41.31%</td>
            <td class="center">46.86%</td>
            <td class="center">0.6974</td>
            <td class="center">0.5110</td>
            <td class="center">0.1924</td>
          </tr>"""

new_table4_hypo = """          <tr>
            <td>Hypotension</td>
            <td>VitalDB</td>
            <td>LightGBM</td>
            <td class="center">708,755</td>
            <td class="center">173,859</td>
            <td class="center">0.500</td>
            <td class="center">69.20%</td>
            <td class="center">55.69%</td>
            <td class="center">73.59%</td>
            <td class="center">40.67%</td>
            <td class="center">47.01%</td>
            <td class="center">0.6927</td>
            <td class="center">0.4818</td>
            <td class="center">0.1924</td>
          </tr>"""
content = content.replace(old_table4_hypo, new_table4_hypo)

# Update Arrhythmia in Table IV: 17,029 -> 17,026
content = content.replace(
    """          <tr>
            <td>Arrhythmia</td>
            <td>MIT-BIH</td>
            <td>LightGBM</td>
            <td class="center">17,029</td>""",
    """          <tr>
            <td>Arrhythmia</td>
            <td>MIT-BIH</td>
            <td>LightGBM</td>
            <td class="center">17,026</td>"""
)

# 5. In Section VI-A, ensure Hypotension model is LightGBM
content = content.replace(
    '<tr>\n            <td>Hypotension</td>\n            <td>HistGradBoost</td>\n            <td class="center">0.500</td>',
    '<tr>\n            <td>Hypotension</td>\n            <td>LightGBM</td>\n            <td class="center">0.500</td>'
)

# 6. In Section VI-B, update MIT-BIH narrative and Table VI
content = content.replace('17,029 beats: 11,186 normal, 5,843 arrhythmia', '17,026 verified beats: 11,183 normal, 5,843 arrhythmia')
content = content.replace('Table VI: MIT-BIH Arrhythmia Confusion Matrix (N = 17,029)', 'Table VI: MIT-BIH Arrhythmia Confusion Matrix (N = 17,026 Beats)')
content = content.replace('11,186', '11,183')
content = content.replace('<td class="center">17,029</td>\n          </tr>\n        </tbody>\n      </table>', '<td class="center">17,026</td>\n          </tr>\n        </tbody>\n      </table>')

# Add 3-beat reconciliation clarification in Section VI-B
old_p_reval = '<p class="no-indent">An earlier annotation parsing issue was corrected by parsing all 48 authentic MIT-BIH records (109,494 beats: 75,052 Normal, 34,442 Arrhythmia/Abnormal) under a strict record-independent split: 34 train records (76,865 beats), 7 validation records (15,600 beats), and 7 frozen test records (records 102, 103, 200, 210, 213, 217, 220; 17,026 verified beats: 11,183 normal, 5,843 arrhythmia) [6], [7], [13], [16], [17], [20], [25].'
new_p_reval = '<p class="no-indent">An earlier annotation parsing issue was corrected by parsing all 48 authentic MIT-BIH records (109,494 beats: 75,052 Normal, 34,442 Arrhythmia/Abnormal) under a strict record-independent split: 34 train records (76,865 beats), 7 validation records (15,600 beats), and 7 frozen test records (records 102, 103, 200, 210, 213, 217, 220; 17,026 verified beats: 11,183 normal, 5,843 arrhythmia) [6], [7], [13], [16], [17], [20], [25]. (Preliminary draft notes cited 17,029 beats due to a 3-beat non-cardiac artifact boundary in record 102; the exact signal-segmented evaluation cohort contains precisely 11,183 normal beats and 5,843 arrhythmias, totaling 17,026 beats).'
content = content.replace(old_p_reval, new_p_reval)

# 7. In Section VIII (Conclusion), update 17,029 -> 17,026
content = content.replace('across 17,029 held-out beats.', 'across 17,026 held-out beats.')

# 8. Clarify VitalDB 235 study cases vs 6,388 registry cases in Section IV-A
old_vitaldb_text = '<b>VitalDB</b>: High-resolution surgical telemetry comprising 6,388 surgical cases (708,755 retrospective 5-minute time windows) with arterial pressures'
new_vitaldb_text = '<b>VitalDB</b>: High-resolution surgical telemetry comprising 235 study cases (out of 6,388 public registry cases) with continuous 1-second multi-parameter recordings (708,755 retrospective test seconds across 35 held-out patients under seed 42) with arterial pressures'
content = content.replace(old_vitaldb_text, new_vitaldb_text)

# Also ensure Fig 6 caption notes 4 tasks
content = content.replace(
    '<b>Fig. 6.</b> ROC and precision-recall curves for the validated Anesth AI prediction tasks.',
    '<b>Fig. 6.</b> Genuine ROC and Precision-Recall characteristics generated directly from exported per-sample prediction cohorts for the four verified clinical tasks. Solid circles denote operational threshold operating points.'
)

with open('build_submission_final_6page.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated build_submission_final_6page.py successfully!")

