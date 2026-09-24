import os
import json
import pandas as pd

cases_dir = r"e:\HH Goa Fraud Agent\cases"
case_pack_path = r"e:\HH Goa Fraud Agent\data\HHGOA_IEEE\case_pack.csv"
report_path = r"e:\HH Goa Fraud Agent\BENCHMARK_REPORT.md"

df_case_pack = pd.read_csv(case_pack_path)
allowed_patterns = {'card_testing', 'card_not_present_fraud', 'card_not_present_new_device', 'out_of_region_use', 'account_takeover', 'undocumented', 'none'}

audit_findings = []

for idx, row in df_case_pack.iterrows():
    cid = row["case_id"]
    file_path = os.path.join(cases_dir, f"{cid}.json")
    
    if not os.path.exists(file_path):
        audit_findings.append(f"[MISSING FILE] {cid}.json does not exist!")
        continue
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    # 1. Top level check
    if data.get("case_id") != cid:
        audit_findings.append(f"[{cid}] ID mismatch: expected {cid}, got {data.get('case_id')}")
        
    case_obj = data.get("case", {})
    pat = case_obj.get("pattern")
    verdict = case_obj.get("verdict")
    exposure = case_obj.get("exposure_usd", 0.0)
    
    # 2. Pattern check
    if pat not in allowed_patterns:
        audit_findings.append(f"[{cid}] Invalid pattern '{pat}'! Allowed: {allowed_patterns}")
        
    # 3. SAR agreement check
    sar_obj = data.get("sar", {})
    sar_file = sar_obj.get("file", False)
    final_actions = [a.get("action") for a in data.get("next_best_actions", {}).get("final", [])]
    has_file_report = "FILE_REPORT" in final_actions
    
    if sar_file != has_file_report:
        audit_findings.append(f"[{cid}] SAR mismatch! sar.file={sar_file} but FILE_REPORT in final_actions={has_file_report}")
        
    # 4. SAR justification check per Section 3a
    # SAR requires: exposure >= 1000 OR shared device/region/other card fraud OR undocumented (R9)
    if sar_file:
        is_high_exposure = exposure >= 1000.0
        is_shared_device = len(case_obj.get("connected_card_ids", [])) > 0 or len(case_obj.get("connected_device_profiles", [])) > 0
        is_undocumented = pat == "undocumented"
        
        if not (is_high_exposure or is_shared_device or is_undocumented):
            audit_findings.append(f"[{cid}] SAR Filed for low exposure (${exposure:.2f}) without shared device/region or undocumented pattern!")

print("=== AUDIT FINDINGS ===")
if not audit_findings:
    print("ALL 20 CASES PASSED VERIFICATION PERFECTLY!")
else:
    for f in audit_findings:
        print(f)
