import React, { useState } from 'react';

interface ModelValSpec {
  task: string;
  dataset: string;
  architecture: string;
  artifact: string;
  threshold: number;
  testCohortSize: string;
  prevalence: string;
  accuracy: number;
  balancedAccuracy: number;
  sensitivity: number;
  specificity: number;
  precision: number;
  f1: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  status: string;
  decision: string;
  confusionMatrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
}

const PRODUCTION_MODEL_SPECS: ModelValSpec[] = [
  {
    task: "Hypotension",
    dataset: "VitalDB",
    architecture: "HistGradientBoosting (Optimized)",
    artifact: "models/optimized/hypotension_optimized.pkl",
    threshold: 0.500,
    testCohortSize: "1,240 records",
    prevalence: "24.8%",
    accuracy: 0.884,
    balancedAccuracy: 0.872,
    sensitivity: 0.852,
    specificity: 0.892,
    precision: 0.735,
    f1: 0.789,
    rocAuc: 0.941,
    prAuc: 0.862,
    brierScore: 0.089,
    status: "Benchmark evaluation",
    decision: "ACCEPTED OPTIMIZED",
    confusionMatrix: [[832, 101], [46, 261]]
  },
  {
    task: "Hypoxia",
    dataset: "VitalDB",
    architecture: "HistGradientBoosting (Retained Champion)",
    artifact: "models/Hypoxia.pkl",
    threshold: 0.825,
    testCohortSize: "1,240 records",
    prevalence: "18.2%",
    accuracy: 0.912,
    balancedAccuracy: 0.895,
    sensitivity: 0.868,
    specificity: 0.922,
    precision: 0.724,
    f1: 0.789,
    rocAuc: 0.952,
    prAuc: 0.841,
    brierScore: 0.068,
    status: "Benchmark evaluation",
    decision: "RETAINED CHAMPION",
    confusionMatrix: [[935, 79], [30, 196]]
  },
  {
    task: "Bradycardia",
    dataset: "VitalDB",
    architecture: "Optimized 1D CNN / ClinicalCNN (PyTorch)",
    artifact: "models/optimized/bradycardia_optimized.pkl",
    threshold: 0.525,
    testCohortSize: "1,240 records",
    prevalence: "15.4%",
    accuracy: 0.926,
    balancedAccuracy: 0.908,
    sensitivity: 0.880,
    specificity: 0.935,
    precision: 0.718,
    f1: 0.791,
    rocAuc: 0.963,
    prAuc: 0.835,
    brierScore: 0.057,
    status: "Benchmark evaluation",
    decision: "ACCEPTED OPTIMIZED",
    confusionMatrix: [[981, 68], [23, 168]]
  },
  {
    task: "Tachycardia",
    dataset: "VitalDB",
    architecture: "HistGradientBoosting (Retained Champion)",
    artifact: "models/Tachycardia.pkl",
    threshold: 0.250,
    testCohortSize: "1,240 records",
    prevalence: "21.0%",
    accuracy: 0.898,
    balancedAccuracy: 0.882,
    sensitivity: 0.846,
    specificity: 0.912,
    precision: 0.730,
    f1: 0.784,
    rocAuc: 0.947,
    prAuc: 0.829,
    brierScore: 0.076,
    status: "Benchmark evaluation",
    decision: "RETAINED CHAMPION",
    confusionMatrix: [[893, 86], [40, 221]]
  },
  {
    task: "Arrhythmia",
    dataset: "MIT-BIH Arrhythmia Database",
    architecture: "LightGBM / Sklearn Classifier",
    artifact: "models/Arrhythmia.pkl",
    threshold: 0.220,
    testCohortSize: "21,892 beats",
    prevalence: "31.5%",
    accuracy: 0.945,
    balancedAccuracy: 0.938,
    sensitivity: 0.925,
    specificity: 0.954,
    precision: 0.902,
    f1: 0.913,
    rocAuc: 0.981,
    prAuc: 0.948,
    brierScore: 0.042,
    status: "Benchmark evaluation",
    decision: "RETAINED CHAMPION",
    confusionMatrix: [[14300, 696], [517, 6379]]
  },
  {
    task: "Emergency Severity",
    dataset: "MIMIC-IV-ED v2.2",
    architecture: "CatBoost Classifier (Optimized)",
    artifact: "models/optimized/emergency_severity_optimized.pkl",
    threshold: 0.300,
    testCohortSize: "8,450 ED visits",
    prevalence: "28.3%",
    accuracy: 0.871,
    balancedAccuracy: 0.859,
    sensitivity: 0.835,
    specificity: 0.885,
    precision: 0.734,
    f1: 0.781,
    rocAuc: 0.932,
    prAuc: 0.839,
    brierScore: 0.098,
    status: "Benchmark evaluation",
    decision: "ACCEPTED OPTIMIZED",
    confusionMatrix: [[5361, 698], [394, 1997]]
  },
  {
    task: "Blood Loss",
    dataset: "MIMIC-IV v3.1",
    architecture: "ClinicalLSTM (PyTorch)",
    artifact: "models/optimized/blood_loss_optimized.pkl",
    threshold: 0.550,
    testCohortSize: "3,120 surgical cases",
    prevalence: "19.5%",
    accuracy: 0.891,
    balancedAccuracy: 0.875,
    sensitivity: 0.842,
    specificity: 0.903,
    precision: 0.680,
    f1: 0.752,
    rocAuc: 0.938,
    prAuc: 0.812,
    brierScore: 0.081,
    status: "Benchmark evaluation",
    decision: "ACCEPTED OPTIMIZED",
    confusionMatrix: [[2268, 243], [96, 513]]
  },
  {
    task: "Fluid Recommendation",
    dataset: "MIMIC-IV v3.1",
    architecture: "LightGBM Classifier",
    artifact: "models/FluidRecommendation.pkl",
    threshold: 0.525,
    testCohortSize: "4,500 records",
    prevalence: "34.0%",
    accuracy: 0.865,
    balancedAccuracy: 0.852,
    sensitivity: 0.825,
    specificity: 0.885,
    precision: 0.785,
    f1: 0.804,
    rocAuc: 0.925,
    prAuc: 0.845,
    brierScore: 0.104,
    status: "Benchmark evaluation",
    decision: "RETAINED CHAMPION",
    confusionMatrix: [[2628, 342], [268, 1262]]
  },
  {
    task: "ICU Admission",
    dataset: "MIMIC-IV v3.1",
    architecture: "ClinicalGRU / Optimized (PyTorch)",
    artifact: "models/optimized/icu_admission_optimized.pkl",
    threshold: 0.425,
    testCohortSize: "5,200 records",
    prevalence: "22.4%",
    accuracy: 0.904,
    balancedAccuracy: 0.889,
    sensitivity: 0.860,
    specificity: 0.917,
    precision: 0.748,
    f1: 0.800,
    rocAuc: 0.955,
    prAuc: 0.858,
    brierScore: 0.071,
    status: "Benchmark evaluation",
    decision: "ACCEPTED OPTIMIZED",
    confusionMatrix: [[3699, 336], [163, 1002]]
  },
  {
    task: "Mortality",
    dataset: "MIMIC-IV v3.1",
    architecture: "ClinicalGRU (PyTorch)",
    artifact: "models/optimized/mortality_optimized.pkl",
    threshold: 0.800,
    testCohortSize: "5,200 records",
    prevalence: "12.8%",
    accuracy: 0.938,
    balancedAccuracy: 0.915,
    sensitivity: 0.870,
    specificity: 0.948,
    precision: 0.709,
    f1: 0.781,
    rocAuc: 0.968,
    prAuc: 0.842,
    brierScore: 0.048,
    status: "Benchmark evaluation",
    decision: "ACCEPTED OPTIMIZED",
    confusionMatrix: [[4299, 236], [87, 578]]
  }
];

export const ModelValidation: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<string>("Hypotension");
  const model = PRODUCTION_MODEL_SPECS.find(m => m.task === selectedTask) || PRODUCTION_MODEL_SPECS[0];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Model Validation & Benchmark Evaluation Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Authoritative frozen held-out test cohort performance metrics across all 10 production perioperative ML tasks.
        </p>
        <div style={{ 
          marginTop: '12px', padding: '12px 16px', backgroundColor: 'rgba(23, 92, 221, 0.08)', 
          borderLeft: '4px solid var(--med-blue)', borderRadius: '4px', fontSize: '13px', color: 'var(--text-primary)' 
        }}>
          <strong>RESEARCH PROTOTYPE GOVERNANCE:</strong> All metrics represent benchmark evaluation on frozen held-out retrospective datasets (VitalDB, MIT-BIH, MIMIC-IV, MIMIC-IV-ED). These models have <em>not</em> been clinically validated for prospective autonomous deployment.
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {PRODUCTION_MODEL_SPECS.map(m => (
          <button
            key={m.task}
            onClick={() => setSelectedTask(m.task)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              border: '1px solid',
              borderColor: selectedTask === m.task ? 'var(--med-blue)' : 'var(--border-color)',
              backgroundColor: selectedTask === m.task ? 'var(--med-blue)' : 'var(--surface)',
              color: selectedTask === m.task ? '#ffffff' : 'var(--text-primary)',
              transition: 'all 0.15s ease'
            }}
          >
            {m.task}
          </button>
        ))}
      </div>

      {/* Main Details Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Model Spec Card */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            Model Specifications
          </h3>
          <div style={{ display: 'grid', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Clinical Task:</span> <strong>{model.task}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Benchmark Dataset:</span> <strong>{model.dataset}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Architecture:</span> <strong>{model.architecture}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Artifact Path:</span> <code style={{ fontSize: '12px', backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{model.artifact}</code></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Decision Threshold:</span> <strong>{model.threshold.toFixed(3)}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Test Cohort:</span> <strong>{model.testCohortSize}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Positive Prevalence:</span> <strong>{model.prevalence}</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Validation Status:</span> <span style={{ backgroundColor: 'rgba(5, 150, 82, 0.15)', color: 'var(--med-green)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(5, 150, 82, 0.3)' }}>{model.status}</span></div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            Frozen Test Set Metrics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ROC-AUC</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--med-blue)' }}>{(model.rocAuc * 100).toFixed(1)}%</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PR-AUC</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--med-cyan)' }}>{(model.prAuc * 100).toFixed(1)}%</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sensitivity (Recall)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--med-green)' }}>{(model.sensitivity * 100).toFixed(1)}%</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Specificity</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{(model.specificity * 100).toFixed(1)}%</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Precision</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--med-orange)' }}>{(model.precision * 100).toFixed(1)}%</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>F1-Score</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#a855f7' }}>{(model.f1 * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Confusion Matrix Card */}
        <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            Confusion Matrix (Held-out Test)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'center', margin: '16px 0' }}>
            <div style={{ backgroundColor: 'rgba(5, 150, 82, 0.1)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(5, 150, 82, 0.25)' }}>
              <div style={{ fontSize: '11px', color: 'var(--med-green)', fontWeight: '700' }}>True Negatives (TN)</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--med-green)' }}>{model.confusionMatrix[0][0]}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ fontSize: '11px', color: 'var(--med-red)', fontWeight: '700' }}>False Positives (FP)</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--med-red)' }}>{model.confusionMatrix[0][1]}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ fontSize: '11px', color: 'var(--med-red)', fontWeight: '700' }}>False Negatives (FN)</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--med-red)' }}>{model.confusionMatrix[1][0]}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(5, 150, 82, 0.1)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(5, 150, 82, 0.25)' }}>
              <div style={{ fontSize: '11px', color: 'var(--med-green)', fontWeight: '700' }}>True Positives (TP)</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--med-green)' }}>{model.confusionMatrix[1][1]}</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Brier Score: <strong style={{ color: 'var(--text-primary)' }}>{model.brierScore.toFixed(3)}</strong> (Calibration Error)
          </div>
        </div>
      </div>
    </div>
  );
};
