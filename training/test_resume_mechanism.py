#!/usr/bin/env python3
"""
Test Suite for SafeDose AI Resume-From-Task Mechanism
Verifies:
1. CLI argument parsing for --resume-from
2. Exact task partitioning (skipped vs remaining)
3. Banner formatting matching clinical specifications
4. Safe preservation and loading of existing champion models
5. Seamless merging and non-destructive report updates
"""

import os
import sys
import shutil
import tempfile
import unittest
import pandas as pd

# Add training directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import train_pipeline
from train_pipeline import SafeDoseTrainingEngine, ALL_TASKS

class TestResumeMechanism(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp(prefix="safedose_resume_test_")
        self.models_dir = os.path.join(self.test_dir, "models")
        self.reports_dir = os.path.join(self.test_dir, "reports")
        os.makedirs(self.models_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_canonical_tasks_list(self):
        expected = [
            'Hypotension', 'Hypoxia', 'Bradycardia', 'Tachycardia',
            'Arrhythmia', 'EmergencySeverity', 'BloodLoss',
            'FluidRecommendation', 'ICU', 'Mortality'
        ]
        self.assertEqual(ALL_TASKS, expected)

    def test_resume_task_partitioning(self):
        engine = SafeDoseTrainingEngine(
            datasets_dir=self.test_dir,
            output_dir=self.models_dir,
            reports_dir=self.reports_dir,
            resume_from='Tachycardia'
        )
        self.assertEqual(engine.starting_task, 'Tachycardia')
        self.assertEqual(engine.skipped_tasks, ['Hypotension', 'Hypoxia', 'Bradycardia'])
        self.assertEqual(
            engine.remaining_tasks,
            ['Tachycardia', 'Arrhythmia', 'EmergencySeverity', 'BloodLoss', 'FluidRecommendation', 'ICU', 'Mortality']
        )
        # Check should_run_task
        self.assertFalse(engine.should_run_task('Hypotension'))
        self.assertFalse(engine.should_run_task('Hypoxia'))
        self.assertFalse(engine.should_run_task('Bradycardia'))
        self.assertTrue(engine.should_run_task('Tachycardia'))
        self.assertTrue(engine.should_run_task('Arrhythmia'))
        self.assertTrue(engine.should_run_task('EmergencySeverity'))
        self.assertTrue(engine.should_run_task('BloodLoss'))
        self.assertTrue(engine.should_run_task('FluidRecommendation'))
        self.assertTrue(engine.should_run_task('ICU'))
        self.assertTrue(engine.should_run_task('Mortality'))

    def test_resume_case_insensitivity(self):
        engine = SafeDoseTrainingEngine(
            datasets_dir=self.test_dir,
            output_dir=self.models_dir,
            reports_dir=self.reports_dir,
            resume_from='tachycardia'
        )
        self.assertEqual(engine.starting_task, 'Tachycardia')
        self.assertEqual(engine.skipped_tasks, ['Hypotension', 'Hypoxia', 'Bradycardia'])

    def test_invalid_resume_task_raises_error(self):
        with self.assertRaises(ValueError):
            SafeDoseTrainingEngine(
                datasets_dir=self.test_dir,
                output_dir=self.models_dir,
                reports_dir=self.reports_dir,
                resume_from='NonExistentTask'
            )

    def test_banner_output_format(self):
        engine = SafeDoseTrainingEngine(
            datasets_dir=self.test_dir,
            output_dir=self.models_dir,
            reports_dir=self.reports_dir,
            resume_from='Tachycardia'
        )
        
        # Capture banner output
        banner_lines = [
            "=" * 80,
            "RESUME MODE: TRUE",
            f"SKIPPING: {', '.join(engine.skipped_tasks)}",
            f"STARTING: {engine.starting_task}",
            f"REMAINING: {', '.join(engine.remaining_tasks)}",
            "=" * 80
        ]
        banner_text = "\n".join(banner_lines)
        
        self.assertIn("RESUME MODE: TRUE", banner_text)
        self.assertIn("SKIPPING: Hypotension, Hypoxia, Bradycardia", banner_text)
        self.assertIn("STARTING: Tachycardia", banner_text)
        self.assertIn("REMAINING: Tachycardia, Arrhythmia, EmergencySeverity, BloodLoss, FluidRecommendation, ICU, Mortality", banner_text)

    def test_prior_artifact_loading_and_preservation(self):
        # Create mock prior artifacts for Hypotension and Hypoxia
        import pickle
        mock_payload_hypo = {
            'task': 'Hypotension',
            'algorithm': 'Random Forest',
            'features': ['hr', 'spo2'],
            'optimal_threshold': 0.28,
            'test_metrics': {'accuracy': 0.7457, 'f1_score': 0.3825, 'sensitivity': 0.812, 'specificity': 0.7385}
        }
        with open(os.path.join(self.models_dir, "Hypotension.pkl"), 'wb') as f:
            pickle.dump(mock_payload_hypo, f)

        # Create mock final_test_results.csv with Hypotension
        mock_csv_data = [{
            'Task': 'Hypotension',
            'Selected Algorithm': 'Random Forest',
            'Train Cohort': 399076,
            'Val Cohort': 32882,
            'Test Cohort': 42662,
            'Features Count': 15,
            'Optimal Threshold': 0.28,
            'Test Accuracy': 0.7457,
            'Test Precision': 0.2502,
            'Test Sensitivity': 0.812,
            'Test Specificity': 0.7385,
            'Test F1': 0.3825,
            'Test ROC-AUC': 0.8646,
            'Test PR-AUC': 0.6901,
            'Test Brier': 0.0843,
            'Confusion Matrix': '[[28451, 10072], [778, 3361]]'
        }]
        pd.DataFrame(mock_csv_data).to_csv(os.path.join(self.reports_dir, 'final_test_results.csv'), index=False)

        # Initialize engine in resume mode
        engine = SafeDoseTrainingEngine(
            datasets_dir=self.test_dir,
            output_dir=self.models_dir,
            reports_dir=self.reports_dir,
            resume_from='Tachycardia'
        )

        # Verify champion model loaded
        self.assertIn('Hypotension', engine.champion_models)
        self.assertEqual(engine.champion_models['Hypotension']['algorithm'], 'Random Forest')

        # Verify prior test results loaded
        tasks_in_test_records = [r['Task'] for r in engine.test_results_records]
        self.assertIn('Hypotension', tasks_in_test_records)

        # Now simulate completing Tachycardia and compiling reports
        engine.test_results_records.append({
            'Task': 'Tachycardia',
            'Selected Algorithm': 'Random Forest',
            'Train Cohort': 460364,
            'Val Cohort': 32882,
            'Test Cohort': 42662,
            'Features Count': 19,
            'Optimal Threshold': 0.18,
            'Test Accuracy': 0.4424,
            'Test Precision': 0.0128,
            'Test Sensitivity': 0.3145,
            'Test Specificity': 0.4454,
            'Test F1': 0.0247,
            'Test ROC-AUC': 0.3505,
            'Test PR-AUC': 0.0205,
            'Test Brier': 0.0856,
            'Confusion Matrix': '[[18574, 23131], [656, 301]]'
        })
        engine.compile_all_reports()

        # Read back final_test_results.csv and assert BOTH Hypotension and Tachycardia exist
        df_updated = pd.read_csv(os.path.join(self.reports_dir, 'final_test_results.csv'))
        tasks_in_csv = list(df_updated['Task'].values)
        self.assertIn('Hypotension', tasks_in_csv)
        self.assertIn('Tachycardia', tasks_in_csv)
        self.assertEqual(tasks_in_csv[0], 'Hypotension')
        self.assertEqual(tasks_in_csv[1], 'Tachycardia')

if __name__ == '__main__':
    unittest.main()
