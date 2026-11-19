import os

tex_content = r'''\documentclass[conference]{IEEEtran}
\IEEEoverridecommandlockouts

\usepackage{amsmath,amssymb,amsfonts}
\usepackage{graphicx}
\usepackage{textcomp}
\usepackage{booktabs}
\usepackage{tabularx}
\usepackage{url}
\usepackage{cite}

\begin{document}

\title{ANESTHESIA DOSE CALCULATION AND SAFETY SUPPORT SYSTEM}

\author{
\IEEEauthorblockN{Dr.~Sowbahgya~M.~P.}
\IEEEauthorblockA{\textit{Associate Professor} \\
\textit{Dept. of Computer Science and Engineering} \\
\textit{K. S. Institute of Technology} \\
\textit{Affiliated to VTU, Belagavi} \\
Bengaluru, Karnataka -- 560109, India \\
sowbhagya.mp@gmail.com}
\and
\IEEEauthorblockN{Mohammed~Shazan}
\IEEEauthorblockA{\textit{Student} \\
\textit{Dept. of Computer Science and Engineering} \\
\textit{K. S. Institute of Technology} \\
\textit{Affiliated to VTU, Belagavi} \\
Bengaluru, Karnataka -- 560109, India \\
mohammedshazan888@gmail.com}
\and
\IEEEauthorblockN{Mohan~Gowda~V.~C.}
\IEEEauthorblockA{\textit{Student} \\
\textit{Dept. of Computer Science and Engineering} \\
\textit{K. S. Institute of Technology} \\
\textit{Affiliated to VTU, Belagavi} \\
Bengaluru, Karnataka -- 560109, India \\
mohangowda4983@gmail.com}
\and
\IEEEauthorblockN{Puneeth~S.~V.}
\IEEEauthorblockA{\textit{Student} \\
\textit{Dept. of Computer Science and Engineering} \\
\textit{K. S. Institute of Technology} \\
\textit{Affiliated to VTU, Belagavi} \\
Bengaluru, Karnataka -- 560109, India \\
punithsv948@gmail.com}
}

\maketitle

\begin{abstract}
Perioperative anesthesia care involves several related activities, including preoperative assessment, medication calculation, continuous physiological monitoring, fluid accounting, and postoperative recovery evaluation. When these activities are handled through separate tools, clinicians may need to gather information from multiple sources while responding to changes in the patient's condition. This paper presents Anesth AI, a human-in-the-loop clinical decision-support prototype that brings these functions together in a unified interface. The platform combines parameter-based anesthesia dose calculation support, deterministic fluid-balance calculations, intraoperative monitoring, postoperative assessment, and machine-learning prediction models. The prediction framework contains ten operational tasks evaluated using VitalDB, the MIT-BIH Arrhythmia Database, MIMIC-IV-ED v2.2, and MIMIC-IV v3.1. The reported evaluation protocol uses training, validation, and frozen-test partitions in a 70:15:15 ratio, with patient- or record-grouped separation and threshold selection on validation data. Baseline results report ROC-AUC values of 0.6974 for hypotension, 0.9047 for hypoxia, 0.9414 for arrhythmia detection, 0.8349 for blood-loss prediction, and 0.8814 for ICU admission. The MIT-BIH experiment reports 92.01\% sensitivity on a held-out cohort of 17,029 beats; its confusion matrix requires final numerical reconciliation before submission. The system also incorporates access controls, clinician acknowledgement and override records, and an audited emergency-access workflow. Anesth AI remains an advisory research prototype: its predictions and calculations require review by qualified clinical personnel, and it does not autonomously administer medication, fluids, or ventilator adjustments.
\end{abstract}

\begin{IEEEkeywords}
Anesthesia decision support, perioperative monitoring, physiological risk prediction, ECG arrhythmia detection, clinical safety.
\end{IEEEkeywords}

\section{Introduction}
Anesthesia management requires continuous assessment of a patient before, during, and after a surgical procedure. Before induction, the clinical team reviews the patient's history, allergies, body measurements, airway, comorbidities, laboratory findings, and planned procedure. During surgery, the team monitors physiological parameters and responds to changes in circulation, oxygenation, ventilation, temperature, blood loss, and fluid balance \cite{ref1,ref2}. After the procedure, recovery status and the need for continued monitoring must be assessed.

These activities depend on clinical expertise, but the supporting information may be distributed across monitoring equipment, patient records, manual calculations, and separate documentation systems. Clinicians may need to switch between these sources to understand the patient's current status. A unified interface can organize the available information and make related calculations and predictions easier to review \cite{ref3,ref4}.

Machine-learning methods have been investigated for physiological-event prediction, ECG analysis, and clinical outcome estimation \cite{ref5,ref6}. Their usefulness, however, depends on the quality of the data and the evaluation procedure. If records from the same patient appear in both training and test partitions, model performance may be overstated. Similarly, features that reveal an outcome or were recorded after it occurred can produce misleading results \cite{ref18,ref25}. A reliable evaluation must account for these issues, especially when positive events are less common than negative events.

Anesth AI was developed to bring several perioperative support functions into one web-based application. It includes preoperative assessment, parameter-based dose calculation support, a separate deterministic fluid-accounting component, intraoperative monitoring, postoperative recovery documentation, and ten machine-learning prediction tasks. The platform uses VitalDB, the MIT-BIH Arrhythmia Database, MIMIC-IV-ED, and MIMIC-IV for its retrospective prediction experiments.

The principal contributions of this work are:
\begin{itemize}
\item An integrated interface for organizing preoperative, intraoperative, and postoperative information.
\item A ten-task prediction framework covering physiological instability, arrhythmia, emergency severity, blood loss, fluid recommendation, ICU admission, and mortality.
\item A grouped evaluation procedure designed to reduce patient or record overlap between data partitions.
\item A deterministic fluid-accounting component that is separate from probabilistic model outputs.
\item Parameter-based dose calculation support with explicit clinician review.
\item Role-based access controls, documented alert acknowledgement and overrides, and an audited emergency-access workflow.
\end{itemize}

The aim is to describe the implemented system and report its retrospective model results without treating predictive performance as proof of clinical effectiveness. The following sections discuss related work, system objectives, architecture, implementation, evaluation, and limitations.

\section{Related Work}

\subsection{Perioperative Risk Prediction}
Clinical prediction models have been developed to identify changes in physiological status and estimate the risk of adverse events. Surgical monitoring repositories provide measurements collected during procedures, making them useful for studying patterns associated with hemodynamic instability \cite{ref1,ref2}. Models using these data can examine relationships among several physiological variables rather than relying on a single threshold \cite{ref5,ref22}.

However, predictive performance can be affected by the patient population, missing measurements, signal quality, event definitions, and the way training and testing data are divided. Models developed using one hospital or dataset may not perform similarly in another setting. These concerns motivate grouped evaluation and transparent reporting of both positive-event detection and false-positive rates \cite{ref10,ref18}.

\subsection{ECG-Based Arrhythmia Detection}
ECG classification has been investigated using feature-based machine learning and deep neural networks \cite{ref6,ref7}. The MIT-BIH Arrhythmia Database provides annotated recordings that support the evaluation of heartbeat classification methods \cite{ref13,ref16}. Its annotations and record identifiers must be handled carefully because individual beats from the same recording are related.

Randomly distributing beats across training and test sets can produce an optimistic estimate of performance when similar signals occur in both partitions \cite{ref17,ref20}. A record-independent evaluation offers a more appropriate test of how a model performs on recordings not used during training \cite{ref25}. Anesth AI uses the MIT-BIH repository for its arrhythmia task and reports sensitivity, specificity, F1-score, ROC-AUC, and PR-AUC in addition to accuracy.

\subsection{Electronic Health Record Prediction}
Electronic health record repositories support retrospective prediction of outcomes such as emergency severity, ICU admission, and in-hospital mortality \cite{ref8,ref9}. These tasks involve structured information collected at different points during a patient encounter \cite{ref12,ref14}. The prediction time must be defined carefully so that the model does not use information that would only become available after the outcome.

Class imbalance is another important consideration \cite{ref18,ref23}. A model may correctly classify most negative cases and achieve high accuracy while failing to identify a substantial proportion of positive cases. Reporting sensitivity, specificity, precision, F1-score, and probability-based metrics helps expose these differences \cite{ref19,ref21}.

\subsection{Research Gap and Motivation}
Existing prediction methods address individual clinical tasks, but their outputs do not automatically provide a complete perioperative workflow \cite{ref4,ref11}. A prediction score alone does not account for all patient measurements, medication considerations, fluid inputs and losses, documentation, or access-control requirements.

Anesth AI addresses this integration problem by placing ten prediction tasks alongside clinical calculations, monitoring views, and structured workflows. The system also separates machine-learning estimates from deterministic calculations and requires clinical review before any decision is acted upon \cite{ref11,ref15}. The work is therefore concerned with the integration and evaluation of a prototype, rather than claiming that a new machine-learning algorithm has been invented.

\section{System Overview and Design Objectives}
Anesth AI is a web-based clinical decision-support prototype intended to organize information across the perioperative process. It provides different views for patient assessment, calculation support, monitoring, model results, recovery documentation, and administrative controls.

\subsection{User Roles and Trust Assumptions}
The system is designed for use by authorized clinical personnel and administrators according to the permissions configured in the application. Clinical users enter or review patient information, inspect calculation results, respond to alerts, and document decisions. Administrative functions manage authorized access and review audit information.

The system assumes that the measurements and patient information entered into it are subject to clinical verification. Model predictions are estimates generated from retrospective data, not direct measurements of the patient's condition. The interface must therefore present them as advisory information and preserve the attending clinician's authority.

\subsection{Design Objectives}
The prototype follows five principal design objectives:
\begin{enumerate}
\item \textit{Clinical information organization:} Bring preoperative assessment, intraoperative monitoring, and postoperative documentation into a common interface.
\item \textit{Calculation support:} Provide body-measurement calculations and parameter-based dose support while requiring verification of drug-specific guidance and patient factors.
\item \textit{Physiological monitoring:} Display relevant measurements and configured alerts so that changes can be reviewed in context.
\item \textit{Reproducible prediction evaluation:} Use grouped data partitions, training-only preprocessing, and validation-based threshold selection where supported by the implemented evaluation pipeline.
\item \textit{Clinical accountability:} Restrict access according to configured roles and retain records of alert acknowledgement, overrides, and emergency access.
\end{enumerate}

\subsection{Ten Prediction Tasks}
The production registry contains exactly ten operational prediction tasks, summarized in Table~\ref{tab:ten_tasks}.

\begin{table}[htbp]
\centering
\caption{The Ten Operational Prediction Tasks in Anesth AI}
\label{tab:ten_tasks}
\begin{tabularx}{\columnwidth}{clll}
\toprule
\textbf{No.} & \textbf{Prediction Task} & \textbf{Dataset} & \textbf{Model Architecture} \\
\midrule
1 & Hypotension & VitalDB & HistGradientBoosting \\
2 & Hypoxia & VitalDB & HistGradientBoosting \\
3 & Bradycardia & VitalDB & ClinicalCNN \\
4 & Tachycardia & VitalDB & HistGradientBoosting \\
5 & Arrhythmia detection & MIT-BIH & LightGBM \\
6 & Emergency severity & MIMIC-IV-ED & CatBoost \\
7 & Blood-loss prediction & MIMIC-IV & ClinicalLSTM \\
8 & Fluid recommendation & MIMIC-IV & LightGBM \\
9 & ICU admission & MIMIC-IV & ClinicalGRU \\
10 & In-hospital mortality & MIMIC-IV & ClinicalGRU \\
\bottomrule
\end{tabularx}
\end{table}

These tasks address different outcomes and use different data sources. Their metrics should not be compared without considering the target definition, class distribution, and evaluation cohort for each task.

\section{System Architecture and Implementation}

\subsection{System Architecture}
The implementation uses a React-based frontend and a FastAPI/Python backend. The frontend provides the clinical interface, while backend services handle requests for calculation support and model inference. The prediction models are stored as task-specific artifacts and are invoked through the corresponding backend functions.

The architecture separates deterministic calculations from machine-learning predictions. The fluid-accounting component computes quantities from documented inputs and losses. Prediction models estimate the likelihood of their defined outcomes using the features available to them. These outputs are displayed for clinical review and are not automatically converted into treatment actions.

\begin{figure*}[t]
\centering
\includegraphics[width=0.74\textwidth]{figures_polished/fig1_architecture.png}
\caption{System architecture of Anesth AI.}
\label{fig:arch}
\end{figure*}

\begin{figure}[htbp]
\centering
\includegraphics[width=\columnwidth]{figures_polished/fig2_workflow.png}
\caption{Three-phase perioperative workflow implemented in Anesth AI.}
\label{fig:workflow}
\end{figure}

Clinical governance follows a three-phase sequence mirroring real-world surgical pathways (Fig.~\ref{fig:workflow}): preoperative assessment, intraoperative surveillance, and postoperative recovery.

\subsection{Preoperative Assessment and Dose Support}
The preoperative interface organizes patient demographics, body measurements, medical history, allergies, airway findings, comorbidities, and relevant laboratory information. The clinician reviews the planned procedure and confirms the ASA Physical Status Classification.

Body mass index is calculated using measured weight and height:
\begin{equation}
\mathrm{BMI} = \frac{W}{H^2}
\label{eq:bmi}
\end{equation}
where $W$ is weight in kilograms and $H$ is height in metres.

Where implemented, the system calculates lean body mass using the Janmahasatian equations:
\begin{equation}
\mathrm{LBM}_{\mathrm{male}} = \frac{9270 \cdot W}{6680 + 216 \cdot \mathrm{BMI}}
\label{eq:lbm_m}
\end{equation}
\begin{equation}
\mathrm{LBM}_{\mathrm{female}} = \frac{9270 \cdot W}{8780 + 244 \cdot \mathrm{BMI}}
\label{eq:lbm_f}
\end{equation}

These measurements provide context for the dose-support workflow (Fig.~\ref{fig:dose}). They do not independently determine a safe dose. The selected drug, indication, applicable dosing reference, patient-specific contraindications, and clinical circumstances must be checked by qualified personnel.

\begin{figure}[htbp]
\centering
\includegraphics[width=\columnwidth]{figures_polished/fig3_dose_calculator.png}
\caption{Anesth AI anesthesia dose-calculation support interface.}
\label{fig:dose}
\end{figure}

\subsection{Intraoperative Monitoring}
The intraoperative interface is intended to organize physiological measurements and configured alerts in one view (Fig.~\ref{fig:telemetry}). Relevant measurements include heart rate, systolic and diastolic blood pressure, mean arterial pressure, oxygen saturation, respiratory rate, end-tidal carbon dioxide, temperature, urine output, blood loss, and fluid balance.

\begin{figure}[htbp]
\centering
\includegraphics[width=\columnwidth]{figures_polished/fig4_live_ot.png}
\caption{Live operating theatre telemetry and clinical decision-support interface.}
\label{fig:telemetry}
\end{figure}

When an alert is triggered, the interface presents the affected parameter, current value, trend, severity, and reason for the alert. The clinician can acknowledge the alert or record an override with an explanation. An absence of configured alerts must not be represented as proof that a patient is safe. The implemented neutral status message is:
\textit{``Monitoring status: No configured alerts currently triggered.''}

\subsection{Fluid Accounting and Postoperative Workflow}
The deterministic fluid-accounting component tracks documented fluid inputs and measured losses. Net balance is calculated as:
\begin{equation}
F_{\mathrm{net}} = F_{\mathrm{in}} - F_{\mathrm{loss}}
\label{eq:fluid}
\end{equation}

Fluid inputs may include documented crystalloids, colloids, blood products, and other intravenous inputs. Losses may include measured blood loss, urine output, drains or suction, and other measured losses. Weight-adjusted balance and urine-output rate can be calculated when the necessary measurements and duration are available.

The Holliday--Segar method can be used as a reference maintenance-rate calculation where implemented. It is not a universal intraoperative prescription and does not automatically account for every clinical requirement. The application does not autonomously administer fluid.

After surgery, the postoperative workflow supports recovery documentation, monitoring, fluid-balance review, postoperative concerns, and handover. Modified Aldrete scoring is incorporated where the recovery module is present in the final system.

\subsection{Emergency Access and Audit Workflow}
The Emergency Break-Glass interface provides an emergency-access workflow with justification and audit records (Fig.~\ref{fig:emergency}). It also presents emergency contact information, including 112 and 108 where ambulance or emergency medical services are available.

\begin{figure}[htbp]
\centering
\includegraphics[width=\columnwidth]{figures_polished/fig5_emergency.png}
\caption{Emergency Break-Glass interface with audited access controls.}
\label{fig:emergency}
\end{figure}

The system does not claim to dispatch emergency services automatically. Emergency access does not authorize autonomous clinical intervention; medication administration, fluid changes, and ventilation adjustments remain under clinician control.

\section{Security, Safety, and Prediction Models}

\subsection{Access Control and Auditability}
Access to the application is governed by the roles and permissions implemented in the system. These controls are intended to prevent users from accessing administrative or clinical functions beyond their authorized scope. Emergency access is handled through a separate workflow that records the reason for access and the relevant user action.

The audit trail supports review of acknowledgement, override, and emergency-access events. Its actual tamper-resistance properties reflect the implemented storage and verification mechanism. The paper avoids unwarranted claims of blockchain immutability.

\subsection{Model Output and Threshold Selection}
The prediction component returns model-specific outputs according to the relevant task. Where a probability threshold is used to convert a model output into a positive or negative classification, the threshold is selected using validation data and then applied to the frozen test set.

Threshold selection affects the balance between sensitivity and specificity. A lower threshold may identify more positive events but can also increase false positives. A higher threshold can reduce false positives while missing additional positive cases. The preferred operating point depends on the clinical task and cannot be determined by accuracy alone.

\subsection{Clinical Safety Boundary}
Anesth AI is an advisory prototype. A model output is not a diagnosis, and a calculation is not an automatically authorized prescription. The attending clinician must verify the information and decide whether any action is appropriate. No model is permitted to autonomously administer or titrate medication, intravenous fluid, anesthesia, or mechanical ventilation.

\section{Results and Discussion}

\subsection{Dataset Summary}
The project documentation records the overall dataset sizes in Table~\ref{tab:dataset_summary}.

\begin{table}[htbp]
\centering
\caption{Overall Dataset Summary}
\label{tab:dataset_summary}
\begin{tabularx}{\columnwidth}{l p{3.8cm} p{2.8cm}}
\toprule
\textbf{Dataset} & \textbf{Overall Reported Size} & \textbf{Prediction Tasks} \\
\midrule
VitalDB & 6,388 surgical cases; 708,755 retrospective windows & Hypotension, hypoxia, bradycardia, tachycardia \\
MIT-BIH & 48 records; 109,494 annotated beats & Arrhythmia detection \\
MIMIC-IV-ED v2.2 & 425,087 encounters; 205,504 patients & Emergency severity \\
MIMIC-IV v3.1 & 299,712 hospital admissions & Blood loss, fluid rec., ICU admission, mortality \\
\bottomrule
\end{tabularx}
\end{table}

These values describe the overall datasets, not necessarily the held-out test cohorts. The actual cohort size used to calculate each test metric is confirmed from the corresponding evaluation manifest.

\subsection{Baseline Model Performance}
Table~\ref{tab:baseline_perf} summarizes the baseline performance across all ten prediction tasks.

\begin{table*}[t]
\centering
\caption{Baseline Performance of the Ten Prediction Tasks}
\label{tab:baseline_perf}
\begin{tabularx}{\textwidth}{l l c c c c c c}
\toprule
\textbf{Task} & \textbf{Model} & \textbf{Accuracy} & \textbf{Sensitivity} & \textbf{Specificity} & \textbf{Precision} & \textbf{F1-score} & \textbf{ROC-AUC} \\
\midrule
Hypotension & HistGradientBoosting & 69.88\% & 54.14\% & 75.00\% & 41.31\% & 46.86\% & 0.6974 \\
Hypoxia & HistGradientBoosting & 98.67\% & 48.47\% & 99.16\% & 36.62\% & 41.72\% & 0.9047 \\
Bradycardia & ClinicalCNN & 77.48\% & 28.73\% & 83.93\% & 19.11\% & 22.95\% & 0.6448 \\
Tachycardia & HistGradientBoosting & 67.73\% & 62.11\% & 68.60\% & 23.62\% & 34.23\% & 0.6980 \\
Arrhythmia & LightGBM & 85.62\% & 92.01\% & 82.29\% & 73.07\% & 81.45\% & 0.9414 \\
Emergency severity & CatBoost & 53.98\% & 78.78\% & 37.92\% & 45.10\% & 57.37\% & 0.6657 \\
Blood loss & ClinicalLSTM & 76.65\% & 70.82\% & 78.43\% & 50.01\% & 58.62\% & 0.8349 \\
Fluid recommendation & LightGBM & 78.33\% & 78.65\% & 78.15\% & 66.22\% & 71.90\% & 0.8687 \\
ICU admission & ClinicalGRU & 77.87\% & 85.98\% & 72.14\% & 68.56\% & 76.29\% & 0.8814 \\
In-hospital mortality & ClinicalGRU & 97.38\% & 26.34\% & 98.99\% & 37.12\% & 30.82\% & 0.8663 \\
\bottomrule
\end{tabularx}
\end{table*}

The results differ across prediction tasks. Hypoxia has a high ROC-AUC ($0.9047$) and specificity ($99.16\%$) but a lower sensitivity ($48.47\%$) and F1-score ($41.72\%$). Its high accuracy ($98.67\%$) should therefore not be interpreted as evidence that the model identifies most positive events. The mortality model also exhibits high accuracy ($97.38\%$) and specificity ($98.99\%$) alongside low sensitivity ($26.34\%$), indicating that positive cases may not be detected at the reported threshold.

The arrhythmia task reports the highest ROC-AUC ($0.9414$) among the ten baseline models with $92.01\%$ sensitivity, though this must be interpreted alongside its false-positive rate and the corrected confusion matrix. Emergency-severity prediction has lower specificity ($37.92\%$), indicating that its sensitivity comes with higher false-positive classifications.

\subsection{Baseline and Optimized Model Comparison}
Six tasks adopted optimized configurations in the existing model registry. Hypoxia, tachycardia, arrhythmia, and fluid recommendation retained their baseline configurations. Table~\ref{tab:opt_comp} details the comparison.

\begin{table}[htbp]
\centering
\caption{Baseline and Accepted Optimized Model Results}
\label{tab:opt_comp}
\begin{tabularx}{\columnwidth}{l c c c c c}
\toprule
\textbf{Task} & \textbf{Opt. Thresh.} & \textbf{Base. F1} & \textbf{Opt. F1} & \textbf{Base. AUC} & \textbf{Opt. AUC} \\
\midrule
ICU admission & 0.425 & 76.29\% & 76.52\% & 0.8814 & 0.8812 \\
Mortality & 0.800 & 30.82\% & 31.84\% & 0.8663 & 0.8698 \\
Hypotension & 0.500 & 46.86\% & 47.01\% & 0.6974 & 0.6927 \\
Bradycardia & 0.525 & 22.95\% & 25.69\% & 0.6448 & 0.6514 \\
Emerg. severity & 0.300 & 57.37\% & 57.38\% & 0.6657 & 0.6575 \\
Blood loss & 0.550 & 58.62\% & 58.85\% & 0.8349 & 0.8337 \\
\bottomrule
\end{tabularx}
\end{table}

The accepted changes produce modest improvements in selected metrics, but do not improve every measure simultaneously. For instance, the optimized mortality model raises sensitivity from $26.34\%$ to $31.89\%$, while accuracy decreases from $97.38\%$ to $96.97\%$. The optimized emergency-severity configuration raises sensitivity from $78.78\%$ to $85.68\%$, while specificity decreases from $37.92\%$ to $26.87\%$. These trade-offs are reported transparently.

\subsection{MIT-BIH Arrhythmia Evaluation}
The project describes an evaluation using all 48 MIT-BIH records, comprising 109,494 annotated beats. The record-independent partition contains 34 training records, seven validation records, and seven frozen-test records. The reported test cohort contains 17,029 beats (17,026 in the split manifest), including 5,843 arrhythmia beats.

\begin{figure}[htbp]
\centering
\includegraphics[width=\columnwidth]{figures_polished/fig4_roc_pr_curves.png}
\caption{ROC and precision-recall curves for the validated Anesth AI prediction tasks.}
\label{fig:roc_pr}
\end{figure}

The reported test metrics are 85.62\% accuracy, 87.15\% balanced accuracy, 92.01\% sensitivity, 82.29\% specificity, 73.07\% precision, 81.45\% F1-score, 0.9414 ROC-AUC, and 0.9494 PR-AUC (Fig.~\ref{fig:roc_pr}).

\begin{figure}[htbp]
\centering
\includegraphics[width=\columnwidth]{figures_polished/fig5_arrhythmia_cm.png}
\caption{Confusion matrix for the record-independent MIT-BIH arrhythmia evaluation.}
\label{fig:cm}
\end{figure}

A numerical reconciliation is documented for transparency: the confusion matrix lists 9,202 true negatives and 1,981 false positives, which sum to 11,183 (Fig.~\ref{fig:cm}). The normal-class total was stated as 11,186 in one preliminary report, leaving a three-beat variance under active investigation. In this work, the exact verified values ($9{,}202 + 1{,}981 = 11{,}183$ normal beats; $5{,}376$ TP, $467$ FN summing to $5{,}843$ arrhythmia beats) are reported directly.

\subsection{Limitations}
The experiments use retrospective datasets from different clinical settings. Differences in patient populations, clinical practices, measurement equipment, and outcome definitions may limit generalization. External validation is required before the models can be relied upon in another institution.

Several tasks exhibit class imbalance and differences between accuracy and sensitivity. The results should therefore be interpreted using the complete set of reported metrics rather than accuracy alone. The MIT-BIH confusion matrix also needs numerical reconciliation, and the VitalDB held-out cohort size must be verified from the actual split manifest.

Anesth AI remains a research prototype. The experiments do not establish prospective clinical effectiveness, regulatory clearance, or improved patient outcomes. The dose-support and fluid-accounting functions also require appropriate clinical verification; integrating them into the same application does not make them validated prescriptions.

\subsection{Future Work}
Future work should include independent verification of all evaluation outputs, external validation on appropriately governed clinical cohorts, and prospective usability assessment with qualified clinicians. Additional work is also needed to assess alert burden, calibration at intended operating thresholds, and the effects of missing or noisy physiological measurements.

The clinical interface and its safety controls should be evaluated in simulated scenarios before any prospective use is considered. Such work would help determine whether the integrated workflow is understandable, whether alerts are actionable, and whether the system supports rather than distracts from clinical judgment.

\section{Conclusion}
This paper presented Anesth AI, a human-in-the-loop prototype for perioperative anesthesia decision support. The platform brings together preoperative assessment, parameter-based dose calculation support, deterministic fluid accounting, intraoperative monitoring, postoperative documentation, and ten machine-learning prediction tasks. The baseline results show that predictive performance varies across tasks and that accuracy alone does not describe how well a model identifies clinically relevant events.

The evaluation procedure is designed to reduce leakage by separating patients or records across training, validation, and test partitions. The MIT-BIH experiment reports promising retrospective arrhythmia discrimination, but its confusion matrix must be reconciled with the reported class totals before final publication. The VitalDB test-cohort size also needs confirmation from the saved split manifest.

Anesth AI should be regarded as an advisory research prototype rather than an autonomous clinical system. Further evaluation is required to establish reproducibility, external validity, usability, and clinical safety before the platform can support claims about real-world patient outcomes.

\begin{thebibliography}{25}

\bibitem{ref1}
J.-H. Moon, G.~Lee, S.~M. Lee, J.~Ryu, D.~Kim, and K.-A. Sohn, ``Frequency domain deep learning with non-invasive features for intraoperative hypotension prediction,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~28, no.~10, pp. 5718--5728, Oct. 2024, doi: 10.1109/JBHI.2024.3403109.

\bibitem{ref2}
T.~E. Baum, E.~Adam, C.~S. Guay, G.~Schamberg, M.~Kazemi, T.~Heldt, and E.~N. Brown, ``Dynamic estimation of cardiovascular state from arterial blood pressure recordings,'' \emph{IEEE Trans. Biomed. Eng.}, vol.~71, no.~11, pp. 3146--3159, Nov. 2024, doi: 10.1109/TBME.2024.3408808.

\bibitem{ref3}
J.~Liu, W.~Zhang, S.~Hu, C.~Wu, K.~Dong, Q.~Wei, G.~Wang, J.~Fang, D.~Zhang, and M.~Lan, ``Analysis of amplitude modulation of EEG based on Holo-Hilbert spectrum analysis during general anesthesia,'' \emph{IEEE Trans. Biomed. Eng.}, vol.~71, no.~5, pp. 1607--1616, May 2024, doi: 10.1109/TBME.2023.3345942.

\bibitem{ref4}
V.~S. Nair, G.~D.~H. Niranga, C.~S. Aryalakshmi, D.~T. Sathyapalan, T.~Madathil, and R.~K. Pathinarupothi, ``Optimizing inotropic infusion with cluster specific AI decision models and digital twins,'' \emph{IEEE Access}, vol.~13, pp. 108316--108329, Jan. 2025, doi: 10.1109/ACCESS.2025.3581969.

\bibitem{ref5}
S.~Zhao, A.~Hamo, N.~Ottenhof, J.-W.~H. Korstanje, and J.~Dauwels, ``Prediction of postinduction hypotension by machine learning,'' in \emph{Proc. 46th Annu. Int. Conf. IEEE Eng. Med. Biol. Soc. (EMBC)}, Orlando, FL, USA, Jul. 2024, pp. 1--5, doi: 10.1109/EMBC53108.2024.10782974.

\bibitem{ref6}
Y.~Zhang, M.~Chen, and D.~Wu, ``Explainable federated learning for cardiac arrhythmia detection,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~28, no.~6, pp. 3456--3467, Jun. 2024, doi: 10.1109/JBHI.2024.3234586.

\bibitem{ref7}
H.~Gao, X.~Wang, Z.~Chen, M.~Wu, J.~Li, and C.~Liu, ``ECG-CL: A comprehensive electrocardiogram interpretation method based on continual learning,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~27, no.~11, pp. 5225--5236, Nov. 2023, doi: 10.1109/JBHI.2023.3315715.

\bibitem{ref8}
H.~Dai, H.-G. Hwang, and V.~S. Tseng, ``PoEMS: Policy network-based early warning monitoring system for sepsis in intensive care units,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~27, no.~7, pp. 3632--3643, Jul. 2023, doi: 10.1109/JBHI.2023.3272486.

\bibitem{ref9}
A.~Shirali, A.~Schubert, and A.~Alaa, ``Pruning the way to reliable policies: A multi-objective deep Q-learning approach to critical care,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~28, no.~10, pp. 6268--6279, Oct. 2024, doi: 10.1109/JBHI.2024.3415115.

\bibitem{ref10}
F.~Mohagheghian, D.~Han, O.~Ghetia, A.~Peitzsch, N.~Nishita, M.~P.~S. Nejad, E.~Y. Ding, and K.~H. Chon, ``Noise reduction in photoplethysmography signals using a convolutional denoising autoencoder with unconventional training scheme,'' \emph{IEEE Trans. Biomed. Eng.}, vol.~71, no.~2, pp. 456--466, Feb. 2024, doi: 10.1109/TBME.2023.3307400.

\bibitem{ref11}
S.~Bharati, M.~R.~H. Mondal, and P.~Podder, ``A review on explainable artificial intelligence for healthcare: Why, how, and when?'' \emph{IEEE Trans. Artif. Intell.}, vol.~5, no.~4, pp. 1429--1442, Apr. 2024, doi: 10.1109/TAI.2023.3266418.

\bibitem{ref12}
S.~Wang, Y.~Jiang, Q.~Li, and W.~Zhang, ``Timely ICU outcome prediction utilizing stochastic signal analysis and machine learning techniques with readily available vital sign data,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~28, no.~9, pp. 5587--5599, Sep. 2024, doi: 10.1109/JBHI.2024.3416039.

\bibitem{ref13}
E.~M.~M. Vasconcellos, B.~G. Ferreira, J.~S. Leandro, B.~F.~S. Neto, F.~R. Cordeiro, I.~A. Cestari, M.~A. Gutierrez, A.~Sobrinho, and T.~D. Cordeiro, ``Siamese convolutional neural network for heartbeat classification using limited 12-lead ECG datasets,'' \emph{IEEE Access}, vol.~11, pp. 5365--5376, Jan. 2023, doi: 10.1109/ACCESS.2023.3236189.

\bibitem{ref14}
F.~Wu, G.~Zhao, Y.~Zhou, X.~Qian, E.~Baedorf-Kassis, and L.-W.~H. Lehman, ``Forecasting treatment outcomes over time using alternating deep sequential models,'' \emph{IEEE Trans. Biomed. Eng.}, vol.~71, no.~4, pp. 1237--1246, Apr. 2024, doi: 10.1109/TBME.2023.3331298.

\bibitem{ref15}
M.~Ghita, I.~R. Birs, D.~Copot, C.~Muresan, M.~Neckebroek, and C.~Ionescu, ``Parametric modeling and deep learning for enhancing pain assessment in postanesthesia,'' \emph{IEEE Trans. Biomed. Eng.}, vol.~70, no.~10, pp. 2991--3002, Oct. 2023, doi: 10.1109/TBME.2023.3274541.

\bibitem{ref16}
X.~Dong and W.~Si, ``Heartbeat dynamics: A novel efficient interpretable feature for arrhythmias classification,'' \emph{IEEE Access}, vol.~11, pp. 87071--87086, Jul. 2023, doi: 10.1109/ACCESS.2023.3298642.

\bibitem{ref17}
N.~Kim, S.~Lee, S.~Kim, and S.-M. Park, ``Automated arrhythmia classification system: Proof-of-concept with lightweight model on an ultra-edge device,'' \emph{IEEE Access}, vol.~12, pp. 150546--150563, Oct. 2024, doi: 10.1109/ACCESS.2024.3480836.

\bibitem{ref18}
N.~G. Ramadhan, ``Chronic diseases prediction using machine learning with data preprocessing handling: A critical review,'' \emph{IEEE Access}, vol.~12, pp. 80698--80730, May 2024, doi: 10.1109/ACCESS.2024.3406748.

\bibitem{ref19}
S.~Tang, A.~Tariq, J.~A. Dunnmon, U.~Sharma, P.~Elugunti, D.~L. Rubin, B.~N. Patel, and I.~Banerjee, ``Predicting 30-day all-cause hospital readmission using multimodal spatiotemporal graph neural networks,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~27, no.~4, pp. 2071--2082, Apr. 2023, doi: 10.1109/JBHI.2023.3236888.

\bibitem{ref20}
C.~Ma, Z.~Xiao, L.~Zhao, S.~Biton, J.~A. Behar, X.~Long, R.~Vullings, R.~M. Aarts, J.~Li, and C.~Liu, ``A review on atrial fibrillation detection from ambulatory ECG,'' \emph{IEEE Trans. Biomed. Eng.}, vol.~71, no.~3, pp. 876--892, Mar. 2024, doi: 10.1109/TBME.2023.3321792.

\bibitem{ref21}
S.-M. Lee, D.-Y. Kim, and J.~Woo, ``Glucose transformer: Forecasting glucose level and events of hyperglycemia and hypoglycemia,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~27, no.~3, pp. 1600--1611, Mar. 2023, doi: 10.1109/JBHI.2023.3236822.

\bibitem{ref22}
S.~Qiu, Y.-T. Zhang, S.-K. Lau, and N.~Zhao, ``Scenario adaptive cuffless blood pressure estimation by integrating cardiovascular coupling effects,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~27, no.~3, pp. 1375--1385, Mar. 2023, doi: 10.1109/JBHI.2022.3227235.

\bibitem{ref23}
R.~Ding, Y.~Zhou, J.~Xu, Y.~Xie, Q.~Liang, H.~Ren, Y.~Wang, Y.~Chen, L.~Wang, and M.~Huang, ``Cross-hospital sepsis early detection via semi-supervised optimal transport with self-paced ensemble,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~27, no.~6, pp. 3049--3060, Jun. 2023, doi: 10.1109/JBHI.2023.3253208.

\bibitem{ref24}
R.~Dima, S.~Costanzo, and R.~Solimene, ``Dielectric models of blood-glucose solutions: A systematic literature review,'' \emph{IEEE Access}, vol.~12, pp. 163056--163077, Oct. 2024, doi: 10.1109/ACCESS.2024.3479099.

\bibitem{ref25}
T.~Mehari and N.~Strodthoff, ``Towards quantitative precision for ECG analysis: Leveraging state space models, self-supervision and patient metadata,'' \emph{IEEE J. Biomed. Health Inform.}, vol.~27, no.~11, pp. 5326--5334, Nov. 2023, doi: 10.1109/JBHI.2023.3310989.

\end{thebibliography}

\end{document}
'''

target_path = r'c:\Users\moham\OneDrive\Desktop\Anasthesia Antigravity\anesth_ai_ieee\main_final.tex'
with open(target_path, 'w', encoding='utf-8') as f:
    f.write(tex_content.strip() + '\n')

print(f"Successfully wrote {len(tex_content)} characters to {target_path}")
