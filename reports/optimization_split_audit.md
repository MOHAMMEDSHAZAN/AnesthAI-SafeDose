# SafeDose AI — Optimization Data Splitting & Patient Leakage Audit

**Status**: VERIFIED ZERO LEAKAGE | **Date**: 2026-09-13

## Executive Summary
This audit mathematically verifies that all datasets in the optimization pipeline enforce strict patient/record grouping with zero inter-partition overlap between Training, Validation, and Test cohorts.

## 1. Grouping Key and Inter-Partition Overlap Verification

| Dataset / Benchmark | Grouping Unit | Total Groups | Train Groups | Val Groups | Test Groups | Train ∩ Val | Train ∩ Test | Val ∩ Test | Leakage Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **VitalDB Hemodynamics** | `PatientID` | 235 | 165 | 35 | 35 | 0 | 0 | 0 | **PASSED (Zero Overlap)** |
| **MIT-BIH Arrhythmia** | `record_id` | 48 | 34 | 7 | 7 | 0 | 0 | 0 | **PASSED (Zero Overlap)** |
| **MIMIC-IV-ED** | `subject_id` | 24496 | 17148 | 3674 | 3674 | 0 | 0 | 0 | **PASSED (Zero Overlap)** |

## 2. MIT-BIH Revalidated Record Distribution

- **Train Records (34)**: `[np.str_('100'), np.str_('101'), np.str_('104'), np.str_('105'), np.str_('106'), np.str_('107'), np.str_('108'), np.str_('109'), np.str_('111'), np.str_('112'), np.str_('113'), np.str_('114'), np.str_('115'), np.str_('116'), np.str_('117'), np.str_('118'), np.str_('119'), np.str_('121'), np.str_('122'), np.str_('124'), np.str_('201'), np.str_('202'), np.str_('208'), np.str_('209'), np.str_('212'), np.str_('215'), np.str_('219'), np.str_('221'), np.str_('222'), np.str_('223'), np.str_('228'), np.str_('230'), np.str_('232'), np.str_('233')]`
- **Validation Records (7)**: `[np.str_('123'), np.str_('203'), np.str_('205'), np.str_('207'), np.str_('214'), np.str_('231'), np.str_('234')]`
- **Test Records (7)**: `[np.str_('102'), np.str_('103'), np.str_('200'), np.str_('210'), np.str_('213'), np.str_('217'), np.str_('220')]` (FROZEN)

All MIT-BIH partitions contain both normal sinus heartbeats and positive arrhythmia events.
