# Clinical Formulas, Physiological Equations & Safety Rules

## 1. Pediatric & Adult Fluid Maintenance (Holliday–Segar Method)
Calculated deterministically using the standard 4-2-1 rule:
$$\text{Rate} = \begin{cases} 4 \times W & \text{if } W \le 10\text{ kg} \\ 40 + 2 \times (W - 10) & \text{if } 10 < W \le 20\text{ kg} \\ 60 + 1 \times (W - 20) & \text{if } W > 20\text{ kg} \end{cases}$$
Where $W$ is patient total body weight in kilograms.

### Fasting Fluid Deficit:
$$\text{Deficit} = \text{Hourly Maintenance Rate} \times \text{Fasting Duration (hours)}$$
Replacement schedule:
- Hour 1: $50\%$ of deficit + hourly maintenance + third-space losses.
- Hour 2: $25\%$ of deficit + hourly maintenance + third-space losses.
- Hour 3: $25\%$ of deficit + hourly maintenance + third-space losses.

### Surgical Trauma Losses (Third-Space Losses):
- Minimal trauma (e.g., hernia): $1\text{--}2\text{ ml/kg/hr}$
- Moderate trauma (e.g., cholecystectomy): $3\text{--}4\text{ ml/kg/hr}$
- Severe trauma (e.g., bowel resection): $5\text{--}8\text{ ml/kg/hr}$

---

## 2. Estimated Blood Volume (EBV) & Allowable Blood Loss (ABL)

### Nadler's Estimated Blood Volume:
- Adult Male: $\text{EBV} = W \times 75\text{ ml/kg}$
- Adult Female: $\text{EBV} = W \times 65\text{ ml/kg}$
- Infant: $\text{EBV} = W \times 80\text{ ml/kg}$
- Neonate: $\text{EBV} = W \times 85\text{ ml/kg}$

### Maximum Allowable Blood Loss (ABL):
$$\text{ABL} = \frac{\text{EBV} \times (Hct_{\text{initial}} - Hct_{\text{minimum}})}{Hct_{\text{initial}}}$$
Default safe clinical trigger: minimum hematocrit ($Hct_{\text{minimum}}$) set to $28\%$ (or hemoglobin $9.0\text{ g/dL}$) unless cardiac history requires $30\%$.

---

## 3. Lean Body Mass (LBM) Formulation (Janmahasatian et al., 2005)
For water-soluble anesthesia induction agents (e.g., Propofol, Rocuronium) in obese patients:
$$\text{LBM}_{\text{male}} = \frac{9270 \times W}{6680 + (216 \times \text{BMI})}$$
$$\text{LBM}_{\text{female}} = \frac{9270 \times W}{8780 + (244 \times \text{BMI})}$$

---

## 4. Hemorrhage Staging (ATLS 10th Edition)
- **Class I:** $<15\%$ blood loss, normal vitals, crystalloid fluid replacement.
- **Class II:** $15\text{--}30\%$ blood loss, tachycardia (HR $>100$), decreased pulse pressure, crystalloids.
- **Class III:** $30\text{--}40\%$ blood loss, marked hypotension, severe tachycardia, crystalloids + packed RBCs.
- **Class IV:** $>40\%$ blood loss, life-threatening hypotension, massive transfusion protocol activation.
