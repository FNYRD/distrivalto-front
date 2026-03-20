"""
Dashboard data builder.

Mixes real data from the database with supplementary mock data so the
dashboard always looks populated regardless of how many real chats exist.
"""

from collections import defaultdict
from datetime import timedelta

from django.utils import timezone


def _month_label(dt):
    return dt.strftime("%Y-%m")


def get_dashboard_data():
    from apps.chats.models import Chat, Message
    from django.db.models import Count

    now = timezone.now()

    # ── Trend: consultas & garantias per month (last 6 months) ───────────────
    six_months_ago = now - timedelta(days=180)
    chats_qs = Chat.objects.filter(created_at__gte=six_months_ago, deleted_at__isnull=True)

    trend_buckets = defaultdict(lambda: {"consultas": 0, "garantias": 0})
    for chat in chats_qs.values("type", "created_at"):
        label = chat["created_at"].strftime("%Y-%m")
        if chat["type"] == "consulta":
            trend_buckets[label]["consultas"] += 1
        else:
            trend_buckets[label]["garantias"] += 1

    # Fill gaps with mock data so there are always at least 6 data points
    base_mock = [
        (now - timedelta(days=150), 8, 5),
        (now - timedelta(days=120), 12, 7),
        (now - timedelta(days=90), 15, 9),
        (now - timedelta(days=60), 18, 11),
        (now - timedelta(days=30), 22, 13),
        (now, 20, 10),
    ]
    for dt, c, g in base_mock:
        label = _month_label(dt)
        trend_buckets[label]["consultas"] = max(trend_buckets[label]["consultas"], c)
        trend_buckets[label]["garantias"] = max(trend_buckets[label]["garantias"], g)

    trend = [
        {"fecha": label, "consultas": v["consultas"], "garantias": v["garantias"]}
        for label, v in sorted(trend_buckets.items())
    ]

    # ── Geo distribution ──────────────────────────────────────────────────────
    geo_consultas_db = (
        Chat.objects.filter(type="consulta", deleted_at__isnull=True, user__country__gt="")
        .values("user__country")
        .annotate(total=Count("id"))
        .order_by("-total")[:5]
    )
    geo_garantias_db = (
        Chat.objects.filter(type="garantia", deleted_at__isnull=True, user__country__gt="")
        .values("user__country")
        .annotate(total=Count("id"))
        .order_by("-total")[:5]
    )

    # Merge with mock baseline so the chart is never empty
    MOCK_GEO_C = [
        {"pais": "Colombia", "total": 45},
        {"pais": "México", "total": 28},
        {"pais": "Venezuela", "total": 18},
        {"pais": "Ecuador", "total": 12},
        {"pais": "Perú", "total": 8},
    ]
    MOCK_GEO_G = [
        {"pais": "Colombia", "total": 30},
        {"pais": "México", "total": 20},
        {"pais": "Venezuela", "total": 14},
        {"pais": "Ecuador", "total": 9},
        {"pais": "Perú", "total": 6},
    ]

    def merge_geo(db_qs, mock_list):
        merged = {row["pais"]: row["total"] for row in mock_list}
        for row in db_qs:
            merged[row["user__country"]] = merged.get(row["user__country"], 0) + row["total"]
        return [{"pais": k, "total": v} for k, v in sorted(merged.items(), key=lambda x: -x[1])[:5]]

    geo_consultas = merge_geo(geo_consultas_db, MOCK_GEO_C)
    geo_garantias = merge_geo(geo_garantias_db, MOCK_GEO_G)

    # ── Product distribution (mock — no product catalog yet) ─────────────────
    product_consultas = [
        {"name": "Refrigerador Industrial", "value": 30},
        {"name": "Motor Eléctrico", "value": 25},
        {"name": "Compresor de Aire", "value": 20},
        {"name": "Generador", "value": 15},
        {"name": "Tablero Eléctrico", "value": 10},
    ]
    top_garantia_products = [
        {"name": "Compresor de Aire", "garantias": 18},
        {"name": "Bomba de Agua", "garantias": 14},
        {"name": "Motor Eléctrico", "garantias": 12},
        {"name": "UPS", "garantias": 9},
        {"name": "Variador de Velocidad", "garantias": 6},
    ]

    # ── Resolution breakdown (mock) ───────────────────────────────────────────
    resolution = [
        {"name": "Resuelto", "value": 70},
        {"name": "En proceso", "value": 20},
        {"name": "Escalado", "value": 10},
    ]

    # ── KPIs ──────────────────────────────────────────────────────────────────
    total = Chat.objects.filter(deleted_at__isnull=True).count()
    consultas_total = Chat.objects.filter(type="consulta", deleted_at__isnull=True).count()
    garantias_total = Chat.objects.filter(type="garantia", deleted_at__isnull=True).count()
    grand_total = consultas_total + garantias_total or 1

    top_country_row = geo_consultas[0] if geo_consultas else {"pais": "Colombia", "total": 45}

    escalation_rate = 12  # Stubbed until real escalation logic exists

    kpis = {
        "escalationRate": escalation_rate,
        "topCountry": {"name": top_country_row["pais"], "total": top_country_row["total"]},
        "ratio": {
            "garantias": round(garantias_total / grand_total * 100),
            "consultas": round(consultas_total / grand_total * 100),
        },
        "topProducts": {
            "consulta": product_consultas[0]["name"],
            "garantia": top_garantia_products[0]["name"],
        },
    }

    return {
        "kpis": kpis,
        "trend": trend,
        "geoConsultas": geo_consultas,
        "geoGarantias": geo_garantias,
        "productConsultas": product_consultas,
        "topGarantiaProducts": top_garantia_products,
        "resolution": resolution,
    }
