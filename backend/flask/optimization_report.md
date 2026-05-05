
### Dataset Optimization Report

**1. Size Summary**
- Original Size: 119390 rows
- After Deduplication: 87396 rows
- Reduced Target Size: 20000 rows (Reduction of 83.25%)

**2. Cleaning & Features**
- Columns Dropped (>40% missing): ['company']
- Highly Correlated Features Removed: []
- Outliers Handled: IQR capping applied to 'adr' and 'lead_time'
- Imputation: Median for numerical, Mode for categorical

**3. Sampling Method**
- Technique: Stratified Sampling
- Target: Preserved class balance based on ADR-derived demand levels

**4. Performance Comparison**
| Model | Dataset | Accuracy | Precision | Recall | Train Time |
|-------|---------|----------|-----------|--------|------------|
| RandomForest | Original (30k) | 0.6030 | 0.6040 | 0.6030 | 0.26s |
| RandomForest | Reduced (20k) | 0.5985 | 0.5996 | 0.5985 | 0.18s |
| HistGradientBoosting | Original (30k) | 0.6108 | 0.6121 | 0.6108 | 1.05s |
| HistGradientBoosting | Reduced (20k) | 0.6090 | 0.6102 | 0.6090 | 0.97s |

**Conclusion**
The dataset has been successfully optimized. Performance loss is minimal (< 1-2%) while training time is significantly reduced, meeting the requirement for fast execution.
    