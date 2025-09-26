#!/usr/bin/env python3
from __future__ import annotations
import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = ROOT / "docs" / "templates"
REPORTS_DIR = ROOT / "docs" / "reports"
DATA_FILE = TEMPLATES_DIR / "daily_entry_template.csv"
DAILY_SUMMARY_OUT = REPORTS_DIR / "daily_summary_sample.csv"
MONTHLY_SUMMARY_OUT = REPORTS_DIR / "monthly_summary_sample.csv"

REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def _parse_float(value: str) -> float:
    value = (value or "").strip()
    if not value:
        return 0.0
    try:
        return float(value)
    except ValueError:
        # Handle commas or stray symbols
        cleaned = value.replace(",", "").replace("$", "")
        return float(cleaned) if cleaned else 0.0


def _parse_int(value: str) -> int:
    return int(round(_parse_float(value)))


def _parse_bool(value: str) -> bool:
    value = (value or "").strip().lower()
    return value in {"yes", "true", "y", "1"}


def load_daily_entries(path: Path):
    with path.open("r", newline="", encoding="utf-8") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            yield row


def build_summaries(rows):
    daily = defaultdict(lambda: defaultdict(float))
    daily_counts = defaultdict(lambda: defaultdict(int))
    daily_meta = defaultdict(lambda: defaultdict(int))
    monthly = defaultdict(lambda: defaultdict(float))
    monthly_counts = defaultdict(lambda: defaultdict(int))
    monthly_meta = defaultdict(lambda: defaultdict(int))

    for row in rows:
        date_str = row.get("entry_date", "").strip()
        if not date_str:
            continue
        try:
            entry_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            # Skip malformed rows
            continue

        month_key = entry_date.strftime("%Y-%m")
        store_code = row.get("store_code", "").strip() or "UNKNOWN"
        store_name = row.get("store_name", "").strip() or store_code
        payment_method = (row.get("payment_method", "") or "").strip().lower()
        exception_flag = (row.get("exception_flag", "") or "").strip().lower()
        handover_status = (row.get("handover_status", "") or "").strip().lower()
        handover_confirmed = _parse_bool(row.get("handover_confirmed", ""))

        gross = _parse_float(row.get("gross_revenue", ""))
        share = _parse_float(row.get("beautician_share", ""))
        subsidy = _parse_float(row.get("beautician_subsidy", ""))
        net = _parse_float(row.get("net_revenue", ""))
        alloc_cost = _parse_float(row.get("allocatable_cost", ""))
        net_after_cost = _parse_float(row.get("net_after_cost", ""))
        partner_profit = _parse_float(row.get("partner_profit_each", ""))
        cash_received = _parse_float(row.get("cash_received", ""))
        cash_variance = _parse_float(row.get("cash_short_over", ""))
        customers = _parse_int(row.get("customer_count", "0"))

        daily_key = (entry_date.isoformat(), store_code, store_name)
        daily[daily_key]["gross_total"] += gross
        if payment_method == "cash":
            daily[daily_key]["gross_cash"] += gross
            daily[daily_key]["cash_received"] += cash_received
            daily[daily_key]["cash_variance"] += cash_variance
        elif payment_method == "transfer":
            daily[daily_key]["gross_transfer"] += gross
        else:
            daily[daily_key]["gross_other"] += gross

        daily[daily_key]["beautician_share"] += share
        daily[daily_key]["beautician_subsidy"] += subsidy
        daily[daily_key]["net_revenue"] += net
        daily[daily_key]["allocatable_cost"] += alloc_cost
        daily[daily_key]["net_after_cost"] += net_after_cost
        daily[daily_key]["partner_profit_each"] += partner_profit
        daily[daily_key]["customer_count"] += customers

        if exception_flag and exception_flag != "normal":
            daily_meta[daily_key]["exception_count"] += 1
        if (not handover_confirmed) or handover_status in {"pending", "open", ""}:
            daily_meta[daily_key]["handover_pending_count"] += 1

        # monthly aggregated per store
        monthly_key = (month_key, store_code, store_name)
        for metric, value in (
            ("gross_total", gross),
            ("gross_cash", gross if payment_method == "cash" else 0.0),
            ("gross_transfer", gross if payment_method == "transfer" else 0.0),
            ("gross_other", gross if payment_method not in {"cash", "transfer"} else 0.0),
            ("beautician_share", share),
            ("beautician_subsidy", subsidy),
            ("net_revenue", net),
            ("allocatable_cost", alloc_cost),
            ("net_after_cost", net_after_cost),
            ("partner_profit_each", partner_profit),
            ("cash_received", cash_received if payment_method == "cash" else 0.0),
            ("cash_variance", cash_variance if payment_method == "cash" else 0.0),
        ):
            monthly[monthly_key][metric] += value
        monthly_counts[monthly_key]["customer_count"] += customers
        if exception_flag and exception_flag != "normal":
            monthly_meta[monthly_key]["exception_count"] += 1
        if (not handover_confirmed) or handover_status in {"pending", "open", ""}:
            monthly_meta[monthly_key]["handover_pending_count"] += 1

        # Track active days per store
        monthly_meta[monthly_key]["active_days"] += 1

    return daily, daily_meta, monthly, monthly_meta, monthly_counts


def write_daily_summary(daily, meta):
    headers = [
        "report_date",
        "store_code",
        "store_name",
        "customer_count",
        "gross_revenue_cash",
        "gross_revenue_transfer",
        "gross_revenue_other",
        "gross_revenue_total",
        "beautician_share",
        "beautician_subsidy",
        "net_revenue",
        "allocatable_cost",
        "net_after_cost",
        "partner_profit_each",
        "cash_received",
        "cash_variance",
        "exception_count",
        "handover_pending_count",
    ]
    with DAILY_SUMMARY_OUT.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.writer(fp)
        writer.writerow(headers)
        for key in sorted(daily.keys()):
            date, store_code, store_name = key
            metrics = daily[key]
            meta_info = meta.get(key, {})
            row = [
                date,
                store_code,
                store_name,
                int(metrics.get("customer_count", 0)),
                round(metrics.get("gross_cash", 0.0), 2),
                round(metrics.get("gross_transfer", 0.0), 2),
                round(metrics.get("gross_other", 0.0), 2),
                round(metrics.get("gross_total", 0.0), 2),
                round(metrics.get("beautician_share", 0.0), 2),
                round(metrics.get("beautician_subsidy", 0.0), 2),
                round(metrics.get("net_revenue", 0.0), 2),
                round(metrics.get("allocatable_cost", 0.0), 2),
                round(metrics.get("net_after_cost", 0.0), 2),
                round(metrics.get("partner_profit_each", 0.0), 2),
                round(metrics.get("cash_received", 0.0), 2),
                round(metrics.get("cash_variance", 0.0), 2),
                meta_info.get("exception_count", 0),
                meta_info.get("handover_pending_count", 0),
            ]
            writer.writerow(row)


def write_monthly_summary(monthly, meta, counts):
    headers = [
        "month",
        "store_code",
        "store_name",
        "active_days",
        "customer_count",
        "gross_revenue_cash",
        "gross_revenue_transfer",
        "gross_revenue_other",
        "gross_revenue_total",
        "beautician_share",
        "beautician_subsidy",
        "net_revenue",
        "allocatable_cost",
        "net_after_cost",
        "partner_profit_each",
        "cash_received",
        "cash_variance",
        "exception_count",
        "handover_pending_count",
    ]
    with MONTHLY_SUMMARY_OUT.open("w", newline="", encoding="utf-8") as fp:
        writer = csv.writer(fp)
        writer.writerow(headers)
        for key in sorted(monthly.keys()):
            month, store_code, store_name = key
            metrics = monthly[key]
            meta_info = meta.get(key, {})
            count_info = counts.get(key, {})
            row = [
                month,
                store_code,
                store_name,
                meta_info.get("active_days", 0),
                count_info.get("customer_count", 0),
                round(metrics.get("gross_cash", 0.0), 2),
                round(metrics.get("gross_transfer", 0.0), 2),
                round(metrics.get("gross_other", 0.0), 2),
                round(metrics.get("gross_total", 0.0), 2),
                round(metrics.get("beautician_share", 0.0), 2),
                round(metrics.get("beautician_subsidy", 0.0), 2),
                round(metrics.get("net_revenue", 0.0), 2),
                round(metrics.get("allocatable_cost", 0.0), 2),
                round(metrics.get("net_after_cost", 0.0), 2),
                round(metrics.get("partner_profit_each", 0.0), 2),
                round(metrics.get("cash_received", 0.0), 2),
                round(metrics.get("cash_variance", 0.0), 2),
                meta_info.get("exception_count", 0),
                meta_info.get("handover_pending_count", 0),
            ]
            writer.writerow(row)


def main():
    rows = list(load_daily_entries(DATA_FILE))
    daily, daily_meta, monthly, monthly_meta, monthly_counts = build_summaries(rows)
    write_daily_summary(daily, daily_meta)
    write_monthly_summary(monthly, monthly_meta, monthly_counts)
    print(f"Daily summary written to {DAILY_SUMMARY_OUT}")
    print(f"Monthly summary written to {MONTHLY_SUMMARY_OUT}")


if __name__ == "__main__":
    main()
