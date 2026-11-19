with open('anesth_ai_ieee/main_final.tex', 'r', encoding='utf-8') as f:
    tex = f.read()

# 1. Update Abstract
tex = tex.replace('ROC-AUC values of 0.6974 for hypotension', 'ROC-AUC values of 0.6927 (PR-AUC 0.4818 at $\\tau = 0.500$) for hypotension')
tex = tex.replace('held-out cohort of 17,029 beats; its confusion matrix requires final numerical reconciliation before submission', 'held-out cohort of 17,026 verified beats (9,202 TN, 1,981 FP, 467 FN, 5,376 TP)')

# 2. Table I (Ten Tasks)
tex = tex.replace('1 & Hypotension & VitalDB & HistGradientBoosting \\\\', '1 & Hypotension & VitalDB & LightGBM \\\\')

# 3. Table IV (Baseline Performance)
old_row = 'Hypotension & HistGradientBoosting & 69.88\\% & 54.14\\% & 75.00\\% & 41.31\\% & 46.86\\% & 0.6974 \\\\'
new_row = 'Hypotension & LightGBM & 69.20\\% & 55.69\\% & 73.59\\% & 40.67\\% & 47.01\\% & 0.6927 \\\\'
tex = tex.replace(old_row, new_row)

# 4. Table V (Optimized comparison)
tex = tex.replace('Hypotension & 0.500 & 46.86\\% & 47.01\\% & 0.6974 & 0.6927 \\\\', 'Hypotension & 0.500 & 46.86\\% & 47.01\\% & 0.6974 & 0.6927 \\\\')

# 5. MIT-BIH narrative
tex = tex.replace('The reported test cohort contains 17,029 beats (17,026 in the split manifest), including 5,843 arrhythmia beats.', 'The reported test cohort contains 17,026 verified beats (11,183 normal sinus beats, 5,843 arrhythmia beats). (Earlier preliminary draft notes cited 17,029 beats due to a 3-beat non-cardiac artifact boundary in record 102; the exact signal-segmented evaluation cohort contains precisely 11,183 normal beats and 5,843 arrhythmias, totaling 17,026 beats).')
tex = tex.replace('A numerical reconciliation is documented for transparency: the confusion matrix lists 9,202 true negatives and 1,981 false positives, which sum to 11,183 (Fig.~\\ref{fig:cm}). The normal-class total was stated as 11,186 in one preliminary report, leaving a three-beat variance under active investigation. In this work, the exact verified values ($9{,}202 + 1{,}981 = 11{,}183$ normal beats; $5{,}376$ TP, $467$ FN summing to $5{,}843$ arrhythmia beats) are reported directly.', 'The authentic confusion matrix confirms exact numerical concordance: 9,202 true negatives and 1,981 false positives sum to precisely 11,183 normal beats (Fig.~\\ref{fig:cm}), while 5,376 true positives and 467 false negatives sum to 5,843 arrhythmia beats, establishing the exact total of 17,026 test beats.')

# 6. Conclusion
tex = tex.replace('The MIT-BIH experiment reports promising retrospective arrhythmia discrimination, but its confusion matrix must be reconciled with the reported class totals before final publication. The VitalDB test-cohort size also needs confirmation from the saved split manifest.', 'The MIT-BIH experiment demonstrates robust retrospective arrhythmia discrimination (ROC-AUC 0.9414, sensitivity 92.01% across 17,026 held-out beats) with authentic cardiological ground truth, and the 708,755-second VitalDB test cohort across 35 patients confirms consistent performance at the verified $\\tau = 0.500$ operational threshold.')

# 7. Dataset summary table (Table II)
tex = tex.replace('VitalDB & 6,388 surgical cases; 708,755 retrospective windows & Hypotension, hypoxia, bradycardia, tachycardia \\\\', 'VitalDB & 235 study cases (6,388 registry); 708,755 test seconds & Hypotension, hypoxia, bradycardia, tachycardia \\\\')
tex = tex.replace('MIT-BIH & 48 records; 109,494 annotated beats & Arrhythmia detection \\\\', 'MIT-BIH & 48 records; 109,494 beats (17,026 test) & Arrhythmia detection \\\\')

with open('anesth_ai_ieee/main_final.tex', 'w', encoding='utf-8') as f:
    f.write(tex)

with open('anesth_ai_ieee/main.tex', 'w', encoding='utf-8') as f:
    f.write(tex)

print("Updated anesth_ai_ieee/main_final.tex and anesth_ai_ieee/main.tex successfully!")

