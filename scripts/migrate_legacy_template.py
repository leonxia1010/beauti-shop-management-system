#!/usr/bin/env python3
"""Convert legacy docs/data-template.xlsx sheets into new CSV datasets."""
from __future__ import annotations

import csv
import re
import zipfile
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = ROOT / "docs" / "templates"
OUTPUT_DIR = TEMPLATES_DIR / "legacy_import"
LEGACY_FILE = TEMPLATES_DIR / "data-template.xlsx"
DAILY_OUT = OUTPUT_DIR / "daily_entry_data.csv"
COST_OUT = OUTPUT_DIR / "cost_legacy_data.csv"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
EXCEL_EPOCH = datetime(1899, 12, 30)


def excel_serial_to_date(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    try:
        number = float(value)
    except ValueError:
        return ""
    date = EXCEL_EPOCH + timedelta(days=number)
    return date.strftime("%Y-%m-%d")


def load_shared_strings(zf: zipfile.ZipFile) -> List[str]:
    data = zf.read("xl/sharedStrings.xml")
    root = ET.fromstring(data)
    strings: List[str] = []
    for si in root.findall("s:si", NS):
        text_parts = []
        for t in si.findall('.//s:t', NS):
            text_parts.append(t.text or "")
        strings.append(''.join(text_parts))
    return strings


def parse_sheet(zf: zipfile.ZipFile, sheet_rel_path: str, strings: List[str]) -> List[Dict[str, str]]:
    data = zf.read(sheet_rel_path)
    root = ET.fromstring(data)
    rows: List[Dict[str, str]] = []
    for row in root.findall("s:sheetData/s:row", NS):
        row_dict: Dict[str, str] = {}
        for cell in row.findall("s:c", NS):
            ref = cell.get("r", "")
            match = re.match(r"([A-Z]+)", ref)
            if not match:
                continue
            col = match.group(1)
            cell_type = cell.get("t")
            value_el = cell.find("s:v", NS)
            value = ""
            if cell_type == "s":
                if value_el is not None and value_el.text is not None:
                    idx = int(value_el.text)
                    value = strings[idx]
            else:
                if value_el is not None and value_el.text is not None:
                    value = value_el.text
        
            row_dict[col] = value
        rows.append(row_dict)
    return rows


def parse_revenue_rows(rows: List[Dict[str, str]]) -> List[Dict[str, str]]:
    data_rows: List[Dict[str, str]] = []
    for idx, row in enumerate(rows[1:], start=2):  # skip header
        date_serial = row.get("A", "").strip()
        location = (row.get("G", "") or "").strip()
        gross = row.get("J", "").strip()
        net = row.get("K", "").strip()
        if not date_serial or not location or not gross:
            continue
        entry_date = excel_serial_to_date(date_serial)
        if not entry_date:
            continue
        try:
            gross_val = float(gross)
        except ValueError:
            continue
        try:
            net_val = float(net) if net else 0.0
        except ValueError:
            net_val = 0.0

        beautician_share = max(gross_val - net_val, 0.0)
        duration_min = row.get("L", "").strip()
        duration_hour = row.get("M", "").strip()
        customer_count = row.get("I", "").strip()
        beautician_name = (row.get("H", "") or "").strip()
        value_per_customer = row.get("N", "").strip()

        record: Dict[str, str] = {
            "entry_date": entry_date,
            "store_code": location,
            "store_name": location,
            "beautician_id": "",
            "beautician_name": beautician_name,
            "service_type": "Legacy",
            "payment_method": "Unknown",
            "appointment_ref": f"legacy-row-{idx}",
            "customer_count": customer_count or "1",
            "service_duration_min": duration_min,
            "service_duration_hour": duration_hour,
            "gross_revenue": f"{gross_val:.2f}",
            "beautician_share": f"{beautician_share:.2f}",
            "beautician_subsidy": "0",
            "net_revenue": f"{net_val:.2f}",
            "allocatable_cost": "0",
            "net_after_cost": f"{net_val:.2f}",
            "partner_profit_each": f"{net_val / 2:.2f}",
            "cash_received": f"{gross_val:.2f}",
            "cash_short_over": "0",
            "entry_channel": "Legacy Migration",
            "entered_by": "System",
            "entry_timestamp": f"{entry_date} 23:59",
            "cash_handover_from": beautician_name,
            "cash_handover_to": "",
            "handover_confirmed": "",
            "handover_batch_id": "",
            "handover_status": "Pending",
            "exception_flag": "Normal",
            "exception_reason": "",
            "notes": f"value_per_customer={value_per_customer}" if value_per_customer else "",
        }
        data_rows.append(record)
    return data_rows


def parse_cost_rows(rows: List[Dict[str, str]]):
    cost_map: Dict[Tuple[str, str], float] = defaultdict(float)
    cost_rows: List[Dict[str, str]] = []
    for row in rows[1:]:
        date_serial = row.get("A", "").strip()
        location = (row.get("F", "") or "").strip()
        spending = row.get("J", "").strip()
        if not date_serial or not location or not spending:
            continue
        entry_date = excel_serial_to_date(date_serial)
        if not entry_date:
            continue
        try:
            amount = float(spending)
        except ValueError:
            continue
        key = (entry_date, location)
        cost_map[key] += amount
        cost_rows.append({
            "date": entry_date,
            "store": location,
            "payer": (row.get("G", "") or "").strip(),
            "category": (row.get("H", "") or "").strip(),
            "sub_category": (row.get("I", "") or "").strip(),
            "amount": f"{amount:.2f}",
            "remark": (row.get("K", "") or "").strip(),
        })
    return cost_map, cost_rows


def allocate_costs(entries: List[Dict[str, str]], cost_map: Dict[Tuple[str, str], float]) -> None:
    grouped: Dict[Tuple[str, str], List[Dict[str, str]]] = defaultdict(list)
    for entry in entries:
        key = (entry["entry_date"], entry["store_name"])
        grouped[key].append(entry)

    for key, records in grouped.items():
        total_net = sum(float(r["net_revenue"]) for r in records)
        total_cost = cost_map.get(key, 0.0)
        if total_cost <= 0:
            continue
        if total_net <= 0:
            # spread evenly
            per = total_cost / len(records)
            for record in records:
                record["allocatable_cost"] = f"{per:.2f}"
                net_after = float(record["net_revenue"]) - per
                record["net_after_cost"] = f"{net_after:.2f}"
                record["partner_profit_each"] = f"{net_after / 2:.2f}"
        else:
            remaining = total_cost
            for idx, record in enumerate(records, start=1):
                if idx == len(records):
                    allocation = remaining
                else:
                    allocation = round(total_cost * float(record["net_revenue"]) / total_net, 2)
                    remaining -= allocation
                net_after = float(record["net_revenue"]) - allocation
                record["allocatable_cost"] = f"{allocation:.2f}"
                record["net_after_cost"] = f"{net_after:.2f}"
                record["partner_profit_each"] = f"{net_after / 2:.2f}"


def write_daily(entries: List[Dict[str, str]]):
    headers = [
        "entry_date",
        "store_code",
        "store_name",
        "beautician_id",
        "beautician_name",
        "service_type",
        "payment_method",
        "appointment_ref",
        "customer_count",
        "service_duration_min",
        "service_duration_hour",
        "gross_revenue",
        "beautician_share",
        "beautician_subsidy",
        "net_revenue",
        "allocatable_cost",
        "net_after_cost",
        "partner_profit_each",
        "cash_received",
        "cash_short_over",
        "entry_channel",
        "entered_by",
        "entry_timestamp",
        "cash_handover_from",
        "cash_handover_to",
        "handover_confirmed",
        "handover_batch_id",
        "handover_status",
        "exception_flag",
        "exception_reason",
        "notes",
    ]
    with DAILY_OUT.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.DictWriter(fp, fieldnames=headers)
        writer.writeheader()
        for row in entries:
            writer.writerow(row)


def write_cost_log(cost_rows: List[Dict[str, str]]):
    headers = ["date", "store", "payer", "category", "sub_category", "amount", "remark"]
    with COST_OUT.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.DictWriter(fp, fieldnames=headers)
        writer.writeheader()
        for row in cost_rows:
            writer.writerow(row)


def main():
    if not LEGACY_FILE.exists():
        raise SystemExit(f"Legacy file not found: {LEGACY_FILE}")

    with zipfile.ZipFile(LEGACY_FILE) as zf:
        strings = load_shared_strings(zf)
        revenue_rows = parse_sheet(zf, "xl/worksheets/sheet3.xml", strings)
        cost_rows_sheet = parse_sheet(zf, "xl/worksheets/sheet4.xml", strings)

    entries = parse_revenue_rows(revenue_rows)
    cost_map, cost_rows = parse_cost_rows(cost_rows_sheet)
    allocate_costs(entries, cost_map)
    write_daily(entries)
    write_cost_log(cost_rows)

    print(f"Migrated {len(entries)} revenue rows to {DAILY_OUT.relative_to(ROOT)}")
    print(f"Captured {len(cost_rows)} cost rows to {COST_OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
